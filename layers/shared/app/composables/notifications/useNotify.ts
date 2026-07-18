// composables/useDirectusNotifications.ts
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { createDirectus, realtime, authentication } from '@directus/sdk';

// Define the shape of incoming update notifications
export interface NotificationEvent {
  event: 'create' | 'update' | 'delete';
  collection: string;
  data: any[];
}

export function useDirectusNotifications(
  directusUrl: string,
  collectionName: string,
  userId: string,
  userField: string = 'user_created' // The field relating the item to the user
) {
  const notifications = ref<NotificationEvent[]>([]);
  const isConnected = ref(false);
  let unsubscribeFn: (() => void) | null = null;

  // Initialize the composable Directus SDK client
  const client = createDirectus(directusUrl)
    .with(authentication('json', { autoRefresh: true })) // JSON authentication helper
    .with(realtime()); // Adds WebSockets/Subscription support

  const startSubscription = async () => {
    try {
      // 1. Subscribe specifically to actions on this collection
      // We filter changes so the client only receives updates they are connected to
      const { subscription, unsubscribe } = await client.subscribe(collectionName, {
        event: 'update', // Triggers on 'create', 'update', or 'delete'
        query: {
          fields: ['*'],
          filter: {
            [userField]: {
              _eq: userId,
            },
          },
        },
      });

      unsubscribeFn = unsubscribe;
      isConnected.value = true;

      // 2. Listen to incoming payload stream using an asynchronous generator loop
      for await (const message of subscription) {
        if (message) {
          notifications.value.unshift({
            event: message.event as any,
            collection: collectionName,
            data: message.data,
          });
        }
      }
    } catch (error) {
      console.error(`Failed to subscribe to ${collectionName}:`, error);
    }
  };

  onMounted(() => {
    // Wait for the WebSocket handshake authentication success, then subscribe
    const cleanupWs = client.onWebSocket('message', (message) => {
      if (message.type === 'auth' && message.status === 'ok') {
        startSubscription();
      }
    });

    client.connect();

    onBeforeUnmount(() => {
      cleanupWs();
      if (unsubscribeFn) {
        unsubscribeFn();
      }
    });
  });

  return {
    notifications,
    isConnected,
    clearNotifications: () => (notifications.value = []),
  };
}