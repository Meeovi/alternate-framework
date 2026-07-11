// packages/adapters/adapter-magento/src/normalizers/team.ts
import { createNormalizer } from './automapper'
import type { Query as DirectusQuery } from 'adapter-directus'

type DirectusTeam = NonNullable<DirectusQuery['Directus_team']>[0]

// Magento has no native `team` concept in codegen, so we define an explicit
// fallback raw shape here (mirrors the Directus team collection).
export interface RawMagentoteam {
  entity_id: number | string
  name?: string
  job_title?: string
  bio?: string
  image?: string
}

export const normalizeMagentoTeam = createNormalizer<RawMagentoteam, DirectusTeam>({
  id: (src) => String(src?.entity_id ?? ''),
  name: (src) => src?.name ?? '',
  job_title: (src) => src?.job_title ?? '',
  bio: (src) => src?.bio ?? '',
  status: () => 'active'
})
