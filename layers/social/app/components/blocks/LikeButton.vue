<template>
  <!-- One reusable like control for any kind of content. `targetType` is
       free-form (product / list / post / shorts / video / space …) and,
       with `targetId`, is all the server needs — persistence lives in the
       content_reactions collection keyed by (target_type, target_id,
       user_id, emoji), so a like is tied to the signed-in user and the
       count is shared across every render of this button for that item. -->
  <div class="like-button d-inline-flex align-center">
    <template v-if="isLoggedIn">
      <v-btn
        :icon="reacted ? 'fas fa-heart' : 'far fa-heart'"
        :color="reacted ? 'red' : undefined"
        variant="text"
        :size="size"
        density="comfortable"
        :loading="pending"
        :aria-pressed="reacted"
        :aria-label="reacted ? 'Remove like' : 'Like'"
        @click.stop.prevent="toggle"
      />
    </template>

    <!-- Guest: the heart and its count are visible but inert; the tooltip
         (hover, focus, or tap) says why. -->
    <template v-else>
      <v-tooltip location="top" :text="guestTooltip" open-on-click open-on-focus>
        <template #activator="{ props: activator }">
          <span
            v-bind="activator"
            class="like-button__guest"
            tabindex="0"
            role="button"
            aria-disabled="true"
            :aria-label="guestTooltip"
          >
            <v-icon icon="far fa-heart" :size="iconSize" />
          </span>
        </template>
      </v-tooltip>
    </template>

    <span v-if="showCount" class="like-button__count text-caption ml-1">{{ count }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useSocialStore } from '../../stores/social'

const props = withDefaults(
  defineProps<{
    /**
     * Content kind — free-form, stored verbatim as
     * content_reactions.target_type. e.g. 'product', 'list', 'post',
     * 'shorts', 'video', 'space'. Pick one string per content type and
     * use it consistently wherever that type is liked.
     */
    targetType: string
    /** The content's own id. */
    targetId: string | number | null | undefined
    /**
     * Reaction emoji. The API and this button both default to a heart, so
     * a plain like never needs to pass it.
     */
    emoji?: string
    /**
     * Seed the count for first paint — pass a `likes_count` / `reaction_count`
     * already on the record so the number doesn't flash 0 before the
     * status fetch resolves.
     */
    initialCount?: number
    /** Show the numeric count next to the icon. */
    showCount?: boolean
    /** Forwarded to the v-btn / v-icon size. */
    size?: string | number
  }>(),
  {
    emoji: '❤️',
    initialCount: 0,
    showCount: true,
    size: 'default',
  },
)

const social = useSocialStore()

const currentUser = ref<Record<string, any> | null>(null)
const count = ref(props.initialCount ?? 0)
const reacted = ref(false)
const pending = ref(false)

// Guest during SSR and the first client render (currentUser is null), then
// corrected after mount — same approach as FollowButton, so a grid of
// these fires exactly one get-session (memoised in stores/social.ts)
// instead of one per button.
const isLoggedIn = computed(() => !!currentUser.value)
const guestTooltip = 'Log in to like this'
const iconSize = computed(() => (props.size === 'default' ? undefined : props.size))

const targetKey = computed(() =>
  props.targetId != null && props.targetId !== '' ? String(props.targetId) : null,
)

async function load() {
  const id = targetKey.value
  if (!id) return
  try {
    const res = await $fetch<{ count: number; reacted: boolean }>('/api/social/reactions', {
      params: { targetType: props.targetType, targetId: id, emoji: props.emoji },
    })
    count.value = res.count ?? 0
    reacted.value = !!res.reacted
  } catch {
    // Keep the seeded count — a failed status read shouldn't blank the UI.
  }
}

async function toggle() {
  const id = targetKey.value
  if (!id || pending.value || !isLoggedIn.value) return

  // Optimistic; reconciled with the server's authoritative count below.
  const wasReacted = reacted.value
  reacted.value = !wasReacted
  count.value = Math.max(0, count.value + (wasReacted ? -1 : 1))
  pending.value = true
  try {
    const res = await $fetch<{ reacted: boolean; count: number }>('/api/social/reactions', {
      method: 'POST',
      body: { targetType: props.targetType, targetId: id, emoji: props.emoji },
    })
    reacted.value = !!res.reacted
    if (typeof res.count === 'number') count.value = res.count
  } catch (err) {
    reacted.value = wasReacted
    count.value = Math.max(0, count.value + (wasReacted ? 1 : -1))
    console.error('Failed to toggle like:', err)
  } finally {
    pending.value = false
  }
}

// Client-only (onMounted doesn't run during SSR). The count seeds from
// initialCount so there's no 0-flash before the fetches resolve.
onMounted(async () => {
  await social.fetchSession()
  currentUser.value = social.session
  await load()
})

watch(targetKey, (id, prev) => {
  if (id && id !== prev) load()
})
</script>

<style scoped>
.like-button__guest {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  cursor: help;
  border-radius: 50%;
}

.like-button__guest:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.like-button__count {
  font-variant-numeric: tabular-nums;
}
</style>
