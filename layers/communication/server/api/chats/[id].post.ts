import type { UIMessage } from 'ai'
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, generateText, smoothStream, stepCountIs, streamText } from 'ai'
import { prisma } from '../../db'
import { z } from 'zod'
import type { AnthropicLanguageModelOptions } from '@ai-sdk/anthropic'
import { anthropic } from '@ai-sdk/anthropic'
import type { GoogleLanguageModelOptions } from '@ai-sdk/google'
// import { google } from '@ai-sdk/google'
import type { OpenAILanguageModelResponsesOptions } from '@ai-sdk/openai'
import { openai } from '@ai-sdk/openai'
import { chartTool } from '../../../shared/utils/tools/chart'
import { weatherTool } from '../../../shared/utils/tools/weather'

defineRouteMeta({
  openAPI: {
    description: 'Chat with AI.',
    tags: ['ai']
  }
})

type RouteOptions = Extract<NitroRouteOptions, { node?: unknown }>
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  const { model, messages } = await readValidatedBody(event, z.object({
    model: z.string().refine(value => MODELS.some(m => m.value === value), {
      message: 'Invalid model'
    }),
    messages: z.array(z.custom<UIMessage>())
  }).parse)

  const chat = await prisma.conversations.findFirst({
    where: {
      id: id as string,
      userId: session.user?.id || session.id as string
    },
    include: {
      messages: true
    }
  })
  if (!chat) {
    throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
  }

  if (!chat.title) {
    const { text: title } = await generateText({
      model: 'openai/gpt-4.1-nano',
      system: `You are a title generator for a chat:
          - Generate a short title based on the first user's message
          - The title should be less than 30 characters long
          - The title should be a summary of the user's message
          - Do not use quotes (' or ") or colons (:) or any other punctuation
          - Do not use markdown, just plain text`,
      prompt: JSON.stringify(messages[0])
    })

    await prisma.conversations.update({
      where: { id: id as string },
      data: { title }
    })
  }

  const lastMessage = messages[messages.length - 1]
  if (lastMessage?.role === 'user' && messages.length > 1) {
    const existingMessage = await prisma.messages.findUnique({
      where: { id: lastMessage.id as string }
    })

    if (existingMessage) {
      await prisma.messages.update({
        where: { id: lastMessage.id as string },
        data: { parts: lastMessage.parts }
      })
    } else {
      await prisma.messages.create({
        data: {
          id: lastMessage.id as string,
          chatId: id as string,
          userId: session.user?.id || session.id as string,
          role: 'user',
          parts: lastMessage.parts
        }
      })
    }
  }

  const abortController = new AbortController()
  event.node.req.on('close', () => abortController.abort())

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const result = streamText({
        abortSignal: abortController.signal,
        model,
        system: `You are a knowledgeable and helpful AI assistant. ${session.user?.username ? `The user's name is ${session.user.username}.` : ''} Your goal is to provide clear, accurate, and well-structured responses.

**FORMATTING RULES (CRITICAL):**
- ABSOLUTELY NO MARKDOWN HEADINGS: Never use #, ##, ###, ####, #####, or ######
- NO underline-style headings with === or ---
- Use **bold text** for emphasis and section labels instead
- Examples:
  * Instead of "## Usage", write "**Usage:**" or just "Here's how to use it:"
  * Instead of "# Complete Guide", write "**Complete Guide**" or start directly with content
- Start all responses with content, never with a heading

**WEB SEARCH:**
- You have access to a web search tool to find current, up-to-date information
- Only use it when the user explicitly asks about recent events, real-time data, or current facts
- Do NOT search proactively — rely on your knowledge first
- Cite your sources when providing information from web search results

**RESPONSE QUALITY:**
- Be concise yet comprehensive
- Use examples when helpful
- Break down complex topics into digestible parts
- Maintain a friendly, professional tone`,
        messages: await convertToModelMessages(messages),
        tools: {
          chart: chartTool,
          weather: weatherTool,
          ...(model.startsWith('anthropic/') && { web_search: anthropic.tools.webSearch_20250305() }),
          ...(model.startsWith('openai/') && { web_search: openai.tools.webSearch() })
          // TODO: enable once AI SDK supports combining provider-defined tools with custom tools
          // ...(model.startsWith('google/') && { google_search: google.tools.googleSearch({}) })
        },
        providerOptions: {
          anthropic: {
            thinking: {
              type: 'enabled',
              budgetTokens: 2048
            }
          } satisfies AnthropicLanguageModelOptions,
          google: {
            thinkingConfig: {
              includeThoughts: true,
              thinkingLevel: 'low'
            }
          } satisfies GoogleLanguageModelOptions,
          openai: {
            reasoningEffort: 'low',
            reasoningSummary: 'detailed'
          } satisfies OpenAILanguageModelResponsesOptions
        },
        stopWhen: stepCountIs(5),
        experimental_transform: smoothStream()
      })

      if (!chat.title) {
        writer.write({
          type: 'data-chat-title',
          data: { message: 'Generating title...' },
          transient: true
        })
      }

      writer.merge(result.toUIMessageStream({
        sendSources: true,
        sendReasoning: true
      }))
    },
    onFinish: async ({ messages }) => {
      await prisma.messages.createMany({
        data: messages.map(message => ({
          id: message.id,
          chatId: chat.id as string,
          userId: chat.userId,
          role: message.role as string,
          parts: message.parts
        })),
        skipDuplicates: true
      })
    }
  })

  return createUIMessageStreamResponse({
    stream
  })
})
