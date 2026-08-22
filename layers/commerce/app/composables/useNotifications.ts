// Better Notify integration for commerce layer notifications.
//
// Mirrors layers/shared's useSearchNotifications.ts: delegates to the
// server-side notification endpoint (which resolves the user's email,
// builds the Directus transport, and sends through the
// notificationService.commerce[route] catalog) rather than touching the
// Directus SDK or betternotify client in the browser.
interface CommerceNotificationInput {
  userId: string;
  [key: string]: unknown;
}

const sendCommerceNotification = async (
  route: string,
  input: CommerceNotificationInput,
): Promise<void> => {
  try {
    await $fetch('/api/notifications/commerce', {
      method: 'POST',
      body: { userId: input.userId, route, input },
    })
  } catch (error: any) {
    console.error(`[useNotifications] Failed to send notification "${route}":`, error?.data?.message || error)
  }
}

export function useNotifications() {
  return {
    /** Notification for when an item is added to the cart. */
    cartItemAdded: (input: {
      userId: string;
      productName: string;
      productId: string;
      quantity: number;
      cartUrl: string;
    }) => sendCommerceNotification('cartItemAdded', input),

    /** Notification confirming an order was placed. */
    orderConfirmed: (input: {
      userId: string;
      orderId: string;
      orderTotal: string;
      items: Array<{ name: string; quantity: number }>;
      orderUrl: string;
    }) => sendCommerceNotification('orderConfirmed', input),

    /** Notification for when an order ships. */
    orderShipped: (input: {
      userId: string;
      orderId: string;
      trackingNumber: string;
      carrier: string;
      estimatedDelivery: string;
      orderUrl: string;
    }) => sendCommerceNotification('orderShipped', input),

    /** Notification for a successful payment. */
    paymentSucceeded: (input: {
      userId: string;
      orderId: string;
      amount: string;
      currency: string;
      paymentMethod: string;
      orderUrl: string;
    }) => sendCommerceNotification('paymentSucceeded', input),

    /** Notification for a failed payment. */
    paymentFailed: (input: {
      userId: string;
      orderId: string;
      amount: string;
      currency: string;
      reason: string;
      retryUrl: string;
    }) => sendCommerceNotification('paymentFailed', input),

    /** Notification confirming checkout completed. */
    checkoutCompleted: (input: {
      userId: string;
      orderId: string;
      orderTotal: string;
      itemsCount: number;
      orderUrl: string;
    }) => sendCommerceNotification('checkoutCompleted', input),
  };
}
