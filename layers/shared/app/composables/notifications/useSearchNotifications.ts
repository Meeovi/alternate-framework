// Better Notify integration for search layer notifications.
//
// Previously this composable imported server-side transports directly
// (#shared/server/notifications/transports/directus, #shared/server/notifications/notify)
// and used the Directus SDK client in the browser. Both are now replaced
// by a single `$fetch` call to the server-side endpoint.
interface SearchNotificationInput {
  userId: string;
  [key: string]: unknown;
}

/**
 * Notifies a user about a search-related event.
 *
 * Delegates to the server-side notification endpoint which resolves the
 * user's email, builds the Directus transport, and sends the notification
 * through the `notificationService.search[route]` catalog route.
 */
const sendSearchNotification = async (
  route: string,
  input: SearchNotificationInput,
): Promise<void> => {
  try {
    await $fetch('/api/notifications/search', {
      method: 'POST',
      body: { userId: input.userId, route, input },
    })
  } catch (error: any) {
    console.error(`[useSearchNotifications] Failed to send notification "${route}":`, error?.data?.message || error)
  }
}

export function useSearchNotifications() {
  return {
    /** Notification for when a search alert is created. */
    alertCreated: (input: {
      userId: string;
      query: string;
      alertUrl: string;
    }) => sendSearchNotification('alertCreated', input),

    /** Notification for when new search results are available. */
    newResults: (input: {
      userId: string;
      query: string;
      resultCount: number;
      topResultName: string;
      resultsUrl: string;
    }) => sendSearchNotification('newResults', input),
  };
}
