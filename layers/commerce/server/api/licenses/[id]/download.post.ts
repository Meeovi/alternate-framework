import { defineEventHandler, readBody } from 'h3'
import type { DownloadLicenseResponse } from '../../../licensing'
import { bodyString, licensingFor, licensingResponse, repository, routeId } from '../../../licensing-host'

/**
 * POST /api/licenses/{id}/download `{ fileId }` — authorizes and records a
 * download under the license (counts against its download limit); needs
 * the Idempotency-Key header. Serving the file stays with the caller.
 */
export default defineEventHandler((event) => licensingResponse(event, 200, async (): Promise<DownloadLicenseResponse> => {
  const { downloads } = await licensingFor(event)
  const licenseId = routeId(event)
  const fileId = bodyString(await readBody(event).catch(() => null), 'fileId')
  await downloads.recordDownload(licenseId, fileId)
  const repo = repository()
  const license = await repo.getUserLicense(licenseId)
  const max = license ? (await repo.getProductLicense(license.productLicenseId))?.maxDownloads : undefined
  return { licenseId, fileId, ...(max === undefined ? {} : { remainingDownloads: Math.max(0, max - await repo.countDownloads(licenseId)) }) }
}))
