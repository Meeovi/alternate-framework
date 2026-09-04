import { defineEventHandler, readBody, createError, setResponseStatus } from 'h3'
import { z } from 'zod'
import { resolveNewsletterProvider } from '../../providers'
import type {
  NewsletterPublicRuntimeConfig,
  NewsletterRuntimeConfig,
  NewsletterSubscribeResponse,
} from '../../../runtime/types'

const bodySchema = z.object({
  email: z.email().max(320),
  name: z.string().trim().max(200).optional(),
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  tags: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  source: z.string().trim().max(200).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export default defineEventHandler(async (event): Promise<NewsletterSubscribeResponse> => {
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Invalid subscription details',
      data: { issues: parsed.error.issues },
    })
  }

  const runtimeConfig = useRuntimeConfig(event)
  const priv = (runtimeConfig.meeoviNewsletter ?? {}) as NewsletterRuntimeConfig
  const pub = (runtimeConfig.public?.meeoviNewsletter ?? {}) as NewsletterPublicRuntimeConfig

  const provider = resolveNewsletterProvider(priv.provider ?? pub.provider)

  const result = await provider.subscribe(parsed.data, {
    doubleOptIn: priv.doubleOptIn !== false,
    config: priv,
  })

  if (result.status === 'already_subscribed') setResponseStatus(event, 200)
  else setResponseStatus(event, 201)

  return { ok: true, ...result }
})
