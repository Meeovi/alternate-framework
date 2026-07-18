import Stripe from 'stripe';
import { centsToDollars } from '../../../app/utils/currency';
import { stripe } from '../../utils/stripe';

const relevantEvents = [
	'checkout.session.async_payment_failed',
	'checkout.session.async_payment_succeeded',
	'checkout.session.completed',
];

export default defineEventHandler(async (event) => {
	const { directusServer, createItem, readItems } = useNuxtApp() as any

	// Get the Stripe headers and verify the webhook signature.
	const sig = getHeader(event, 'stripe-signature');
	const { stripeWebhookSecret } = useRuntimeConfig();

	if (!sig || !stripeWebhookSecret) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Missing stripe-signature header or webhook secret',
		});
	}

	const rawBody = await readRawBody(event);
	if (!rawBody) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Empty request body',
		});
	}

	// Verify synchronously and fail closed: any verification error must return a
	// non-2xx status so Stripe knows the delivery failed and will retry.
	let stripeEvent: Stripe.Event;
	try {
		stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, stripeWebhookSecret);
	} catch (error) {
		throw createError({
			statusCode: 400,
			statusMessage: `Webhook signature verification failed: ${(error as Error).message}`,
		});
	}

	if (!relevantEvents.includes(stripeEvent.type)) {
		return { received: true, ignored: stripeEvent.type };
	}

	try {
		switch (stripeEvent.type) {
			case 'checkout.session.completed': {
				const checkoutSession = stripeEvent.data.object as Stripe.Checkout.Session;
				const paymentIntentId = checkoutSession.payment_intent as string | null;

				// `payment_intent` is only present for one-time (payment) checkouts.
				// For setup/subscription sessions it is null or a subscription id.
				if (checkoutSession.mode !== 'payment' || !paymentIntentId) {
					break;
				}

				// Idempotency: Stripe can (and does) deliver events more than once.
				// Skip if we already recorded this payment intent.
				const existing = await directusServer.request(
					readItems('os_payments', {
						filter: { stripe_payment_id: { _eq: paymentIntentId } },
						limit: 1,
					}),
				);
				if (Array.isArray(existing) && existing.length > 0) {
					break;
				}

			const paymentIntentResponse = await stripe.paymentIntents.retrieve(paymentIntentId, {
				expand: ['charges'],
			}) as Stripe.PaymentIntent & {
				charges?: { data: Stripe.Charge[] };
			};

				const metadata = checkoutSession.metadata;
				const contact_id = metadata?.contact_id;
				const organization_id = metadata?.organization_id;
				const invoice_id = metadata?.invoice_id;

				const charge = paymentIntentResponse?.charges?.data[0];
				const createdSeconds = charge?.created ?? 0;

				await directusServer.request(
					createItem('os_payments', {
						organization: organization_id,
						contact: contact_id,
						invoice: invoice_id,
						// Stripe `created` is epoch seconds; convert to ISO. Fixed
						// precedence so a missing charge yields epoch 0, not `0 * 1000`.
						payment_date: new Date(createdSeconds * 1000).toISOString(),
						stripe_payment_id: paymentIntentId,
						amount: centsToDollars(checkoutSession.amount_total ?? 0),
						metadata: { checkoutSession, paymentIntent: paymentIntentResponse },
						receipt_url: charge?.receipt_url ?? null,
					}),
				);

				break;
			}

			case 'checkout.session.async_payment_failed':
			case 'checkout.session.async_payment_succeeded':
				// No action required — payment state is reconciled on
				// checkout.session.completed. Hook points retained for future
				// fulfillment/notification logic.
				break;

			default:
				throw new Error('Unhandled relevant event!');
		}
	} catch (err: any) {
		throw createError({
			statusCode: 500,
			statusMessage: err.message,
		});
	}

	return {
		received: true,
	};
});
