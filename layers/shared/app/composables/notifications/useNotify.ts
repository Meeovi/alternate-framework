import { ref, onMounted, onBeforeUnmount } from 'vue';

// Shape returned by /api/content/subscribe's SSE stream — see
// alternate-sdk's ContentChangeEvent contract, which this mirrors.
export interface ContentChangeEvent {
  event: 'create' | 'update' | 'delete';
  collection: string;
  data: any[];
}

/**
 * Live content-change subscription for a collection, filtered to items
 * belonging to a given user. Talks to /api/content/subscribe (an SSE
 * bridge — see server/api/content/subscribe.get.ts), which resolves
 * whatever adapter (Directus, Magento, Vendure, ...) is registered in
 * ContentAdapterRegistry. This composable has no backend-specific SDK
 * dependency and no direct WebSocket/realtime-transport knowledge — that's
 * entirely the registered adapter's concern.
 *
 * Previously (as useDirectusNotifications) this constructed its own
 * @directus/sdk realtime client directly in the browser, hardcoding this
 * layer to Directus specifically despite layers/shared being meant to work
 * with any registered backend.
 */
export function useContentSubscription(
  collectionName: string,
  userId: string,
  userField: string = 'user_created' // The field relating the item to the user
) {
  const events = ref<ContentChangeEvent[]>([]);
  const isConnected = ref(false);
  let eventSource: EventSource | null = null;

  onMounted(() => {
    const params = new URLSearchParams({ collection: collectionName, userField, userId });
    eventSource = new EventSource(`/api/content/subscribe?${params.toString()}`);

    eventSource.onopen = () => {
      isConnected.value = true;
    };

    eventSource.onmessage = (message) => {
      try {
        const payload = JSON.parse(message.data) as ContentChangeEvent;
        events.value.unshift(payload);
      } catch (error) {
        console.error('[useContentSubscription] Failed to parse event payload:', error);
      }
    };

    eventSource.onerror = () => {
      isConnected.value = false;
    };
  });

  onBeforeUnmount(() => {
    eventSource?.close();
    eventSource = null;
  });

  return {
    events,
    isConnected,
    clearEvents: () => (events.value = []),
  };
}

export default useContentSubscription
