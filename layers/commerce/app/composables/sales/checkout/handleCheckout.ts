import { useCart } from '../cart/useCart';
import { usePayment } from '../../payments/usePayment'

const { cart } = useCart();
const { createCheckoutSession } = usePayment();

// Define what your server endpoint returns
interface CheckoutResponse {
  success: boolean;
  clientSecret?: string;
  sessionId: string;
  url?: string;
}

async function handleCheckout() {
  try {
    const formattedItems = cart.value.map((item) => ({
      key: String(item.key),
      variationId: item.variation?.node?.databaseId,
      quantity: item.quantity,
    }));

    // Delegate to the payment provider abstraction
    const response = await createCheckoutSession(
      formattedItems,
      {
        mode: 'payment',
        currency: 'gbp',
      },
    );

    // TypeScript now safely recognizes response.url and response.clientSecret!
    if (response.url) {
      window.location.href = response.url;
    } else if (response.clientSecret) {
      console.log('Client Secret received:', response.clientSecret);
    }

  } catch (error) {
    console.error('Checkout error:', error);
  }
}

export default handleCheckout;
