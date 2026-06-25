// modules/experience-builder/server/db/repository.ts

import type { H3Event } from 'h3'
import { useRuntimeConfig } from 'nuxt/app'
import { sql } from 'kysely' // or your DB client

export function getExperiencePagesRepository(event: H3Event) {
  const db = event.context.db // however you access your DB

  return {
    /* --------------------------------------------
     * Find a single page
     * -------------------------------------------- */
    async findOne(entityType: string, entityId: string, slug: string) {
      return await db
        .selectFrom('experience_pages')
        .selectAll()
        .where('entity_type', '=', entityType)
        .where('entity_id', '=', entityId)
        .where('slug', '=', slug)
        .executeTakeFirst()
    },

    /* --------------------------------------------
     * Create or update a page
     * -------------------------------------------- */
    async upsert(payload: {
      entityType: string
      entityId: string
      slug: string
      title: string
      data: any
      published: boolean
      version: number
      updatedBy?: string
    }) {
      const existing = await this.findOne(
        payload.entityType,
        payload.entityId,
        payload.slug
      )

      if (existing) {
        return await db
          .updateTable('experience_pages')
          .set({
            title: payload.title,
            data: payload.data,
            published: payload.published,
            version: payload.version,
            updated_by: payload.updatedBy || null,
            updated_at: sql`NOW()`
          })
          .where('id', '=', existing.id)
          .returningAll()
          .executeTakeFirst()
      }

      return await db
        .insertInto('experience_pages')
        .values({
          entity_type: payload.entityType,
          entity_id: payload.entityId,
          slug: payload.slug,
          title: payload.title,
          data: payload.data,
          published: payload.published,
          version: payload.version,
          updated_by: payload.updatedBy || null
        })
        .returningAll()
        .executeTakeFirst()
    },

    /* --------------------------------------------
     * Create a version snapshot
     * -------------------------------------------- */
    async createVersion(payload: {
      pageId: string
      entityType: string
      entityId: string
      slug: string
      title: string
      data: any
      published: boolean
      label: string | null
      createdBy?: string
    }) {
      return await db
        .insertInto('experience_page_versions')
        .values({
          page_id: payload.pageId,
          entity_type: payload.entityType,
          entity_id: payload.entityId,
          slug: payload.slug,
          title: payload.title,
          data: payload.data,
          published: payload.published,
          label: payload.label,
          created_by: payload.createdBy || null
        })
        .returningAll()
        .executeTakeFirst()
    },

    /* --------------------------------------------
     * DELETE a page + cascade versions
     * -------------------------------------------- */
    async delete(pageId: string) {
      // Delete versions first (if not using ON DELETE CASCADE)
      await db
        .deleteFrom('experience_page_versions')
        .where('page_id', '=', pageId)
        .execute()

      // Delete the page
      await db
        .deleteFrom('experience_pages')
        .where('id', '=', pageId)
        .execute()

      return true
    }
  }
}
