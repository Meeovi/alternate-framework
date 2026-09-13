import { computed, ref } from 'vue'
import { useNuxtApp } from '#imports'
import { useProfileIdentity } from './useProfileIdentity'
import { useProfileSocial } from './useProfileSocial'
import { usePosts } from '../posts/usePosts'

/**
 * Inline post composer for `/u/` (Timeline tab).
 *
 * Tries the backend-agnostic social driver first (`usePosts().createPost`,
 * the path `QuotePostModal` uses) so the post is attributed server-side.
 * When no social driver is wired up it falls back to creating the row
 * straight in the Directus `posts` collection — the same collection
 * `useProfileSocial` reads back. Either way the new post appears at the
 * top of the profile's post lists immediately; the user never leaves the
 * page.
 */
export function useProfileComposer() {
  const { displayName, avatarUrl } = useProfileIdentity()
  const { addPost } = useProfileSocial()
  const { createPost } = usePosts()

  const text = ref('')
  const submitting = ref(false)
  const error = ref('')

  const canSubmit = computed(() => text.value.trim().length > 0 && !submitting.value)

  const createViaDirectus = async (content: string) => {
    const { $directus, $createItem } = useNuxtApp() as any
    if (!$directus || typeof $createItem !== 'function') return null
    const res = await $directus.request($createItem('posts', {
      content,
      status: 'published',
      content_type: 'Post',
      visibility_scope: 'public',
      username: displayName.value,
      user_avatar: avatarUrl.value,
      // `gallery` is NOT NULL on the collection.
      gallery: [],
    }))
    return res?.data ?? res ?? null
  }

  const submit = async () => {
    if (!canSubmit.value) return
    const content = text.value.trim()
    submitting.value = true
    error.value = ''
    try {
      let created: any = null
      try {
        created = await createPost({ content })
      } catch {
        created = null
      }
      if (!created || (!created.id && !created.content)) {
        created = await createViaDirectus(content)
      }
      if (!created) {
        error.value = 'Posting is not available right now. Please try again later.'
        return
      }
      addPost({
        id: created.id,
        content: created.content ?? content,
        username: created.username ?? displayName.value,
        date_created: created.createdAt ?? created.date_created ?? new Date().toISOString(),
        author: created.authorId ?? created.author,
      })
      text.value = ''
    } catch (e: any) {
      error.value = e?.errors?.[0]?.message || e?.data?.message || e?.message || 'Could not publish your post. Please try again.'
    } finally {
      submitting.value = false
    }
  }

  return { text, submitting, error, canSubmit, submit }
}
