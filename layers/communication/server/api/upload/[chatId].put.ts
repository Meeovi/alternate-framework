import { put } from '@vercel/blob'
import { prisma } from '../../db'
import { z } from 'zod'

const FILE_UPLOAD_CONFIG = {
  maxSize: 8 * 1024 * 1024, // 8MB
  types: ['image/', 'application/pdf', 'text/csv']
} as const

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const { chatId } = await getValidatedRouterParams(event, z.object({
    chatId: z.string()
  }).parse)

  const chat = await prisma.chats.findFirst({
    where: { id: chatId }
  })

  if (chat && chat.userId !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You do not have permission to upload files to this chat'
    })
  }

  const username = user.username

  // Parse multipart form data
  const formData = await readFormData(event)
  const files = formData.getAll('files') as File[]

  if (!files || files.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No files provided'
    })
  }

  const results = await Promise.all(
    files.map(async (file) => {
      // Validate file size
      if (file.size > FILE_UPLOAD_CONFIG.maxSize) {
        throw createError({
          statusCode: 413,
          statusMessage: `File too large. Max size is ${FILE_UPLOAD_CONFIG.maxSize} bytes`
        })
      }

      // Validate file type
      const isValidType = FILE_UPLOAD_CONFIG.types.some(type =>
        file.type.startsWith(type) || file.type === type
      )
      if (!isValidType) {
        throw createError({
          statusCode: 415,
          statusMessage: `File type not allowed. Allowed types: ${FILE_UPLOAD_CONFIG.types.join(', ')}`
        })
      }

      // Generate unique pathname with random suffix
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const randomSuffix = Math.random().toString(36).substring(2, 8)
      const pathname = `${username}/${chatId}/${randomSuffix}-${file.name}`

      const result = await put(pathname, buffer, {
        contentType: file.type
      })

      return {
        url: result.url,
        pathname: result.pathname
      }
    })
  )

  return results
})