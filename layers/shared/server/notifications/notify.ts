import {
  NotifyRpcRateLimitedError,
  createClient,
  createNotify,
  type Client,
} from '@betternotify/core';
import { consoleLogger } from '@betternotify/core/logger';
import {
  withEventLogger,
  withIdempotency,
  withRateLimit,
  withTracing,
} from '@betternotify/core/middlewares';
import { inMemoryEventSink } from '@betternotify/core/sinks';
import {
  inMemoryIdempotencyStore,
  inMemoryRateLimitStore,
  inMemorySuppressionList,
} from '@betternotify/core/stores';
import { inMemoryTracer } from '@betternotify/core/tracers';
import { emailChannel, withSuppressionList } from '@betternotify/email';
import { mockTransport } from './test-utils';
import { z } from 'zod';
import { directusTransport } from './transports/directus';

/* ------------------------------------------------------------------ *
 * Central notification module
 *
 * Every example file in this directory builds the same boilerplate:
 *   - an email channel bound to env SMTP credentials
 *   - a `createNotify` instance with a `welcome` route whose
 *     template renders "Welcome, {name}! Verify here: {verifyUrl}"
 *   - a `createClient` wired to a mock transport
 *
 * This module owns that boilerplate so the example files only contain
 * the logic specific to their topic (transport, middleware, strategy).
 * ------------------------------------------------------------------ */

/* --- Shared environment ------------------------------------------- */

/**
 * Reads notification-related config from `process.env`.
 *
 * Several example files referenced a bare `env` object; this centralizes
 * that lookup so each file imports `env` from here instead of reading
 * `process.env` inline (and so the documented logic stays in one place).
 */
export const env = {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
  SMTP_DESTINATION_EMAIL: process.env.SMTP_DESTINATION_EMAIL,
  NUXT_PUBLIC_SITE_EMAIL: process.env.NUXT_PUBLIC_SITE_EMAIL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  RESEND_DESTINATION_EMAIL: process.env.RESEND_DESTINATION_EMAIL,
  HTTP_TRANSPORT_URL: process.env.HTTP_TRANSPORT_URL,
  HTTP_TRANSPORT_API_KEY: process.env.HTTP_TRANSPORT_API_KEY,
  REDIS_URL: process.env.REDIS_URL,
  PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
};

/* --- Re-export shared test utilities ------------------------------ */

export { mockTransport, mockOkSend, mockFailSend } from './test-utils';

/* --- Dynamic send helpers ----------------------------------------- */

/**
 * Builds a verify URL with a freshly generated token so each send carries a
 * unique, non-hardcoded link (e.g. `https://example.com/verify?token=<uuid>`).
 */
export const makeVerifyUrl = (base = 'https://example.com/verify', seed?: string): string =>
  `${base}?token=${seed ?? crypto.randomUUID()}`;

/** Picks a deterministic-ish destination from env with a safe fallback. */
export const recipientEmail = (fallback = 'demo@example.com'): string =>
  env.SMTP_DESTINATION_EMAIL || fallback;

/** Assembles the canonical `welcome` route input with a dynamic verifyUrl. */
export const makeWelcomeInput = (name: string, verifyUrl?: string) => ({
  name,
  verifyUrl: verifyUrl ?? makeVerifyUrl(),
});

const NAME_POOL = [
  'Ada',
  'Grace',
  'Alan',
  'Linus',
  'Margaret',
  'Dennis',
  'Katherine',
  'Tim',
];

/**
 * Generates `count` dynamic recipients, each with a unique name and per-user
 * verify URL — useful for batch / multi-recipient demos.
 */
export const makeRecipients = (count: number, domain = 'example.com') =>
  Array.from({ length: count }, (_, i) => {
    const name = NAME_POOL[i % NAME_POOL.length]!;
    const handle = `${name.toLowerCase()}${i}`;
    return { name: `${name} ${i}`, email: `${handle}@${domain}`, verifyUrl: makeVerifyUrl() };
  });

/* --- Directus transport (notifications tied to logged-in user) ---------- */

/**
 * Directus transport that creates notification items in the `notifications`
 * collection, resolving the recipient by email so every notification is
 * tied to the logged-in user.
 */
const directus = directusTransport({
  url: process.env.DIRECTUS_URL || 'http://localhost:8055',
  token: process.env.NUXTUS_DIRECTUS_STATIC_TOKEN || '',
});

/* --- Shared channel + rpc ------------------------------------------- */

const ch = emailChannel({
  defaults: { from: { name: process.env.SMTP_FROM_NAME, email: process.env.SMTP_USER } },
});

const rpc = createNotify({ channels: { email: ch } });

/* The canonical `welcome` route used by most examples. */
const welcomeCatalog = rpc.catalog({
  welcome: rpc
    .email()
    .input(z.object({ name: z.string(), verifyUrl: z.string().url() }))
    .subject(({ input }) => `Welcome, ${input.name}!`)
    .template({
      render: async ({ input }) => ({
        text: `Welcome, ${input.name}! Verify here: ${input.verifyUrl}`,
        html: `<p>Welcome, ${input.name}! <a href="${input.verifyUrl}">Verify</a></p>`,
      }),
    }),
});

/* --- Shared client factory ---------------------------------------- */

type BuildClientOptions = {
  transportsByChannel?: Record<string, any>;
  logger?: Parameters<typeof createClient>[0]['logger'];
  hooks?: Parameters<typeof createClient>[0]['hooks'];
  plugins?: Parameters<typeof createClient>[0]['plugins'];
  ctx?: Parameters<typeof createClient>[0]['ctx'];
  queue?: Parameters<typeof createClient>[0]['queue'];
};

/**
 * Builds a `createClient` for the shared `welcome` catalog.
 * Defaults to the in-memory mock transport so examples stay self-contained.
 */
export const buildClient = (options: BuildClientOptions = {}): Client<typeof welcomeCatalog> => {
  const { transportsByChannel, ...rest } = options;
  const clientOptions = {
    catalog: welcomeCatalog,
    transportsByChannel: {
      email: mockTransport('mock'),
      ...(transportsByChannel as Record<string, unknown>),
    },
    ...rest,
  } as any;
  return createClient(clientOptions) as unknown as Client<typeof welcomeCatalog>;
};

/* --- Input schemas ------------------------------------------------ */

const welcomeInput = z.object({ name: z.string(), verifyUrl: z.string().url() });
const resetInput = z.object({ name: z.string(), resetUrl: z.string().url() });
const newsletterInput = z.object({ headline: z.string(), bodyUrl: z.string().url() });

/* --- Commerce input schemas ---------------------------------------- */

const cartItemAddedInput = z.object({
  userId: z.string().min(1, 'userId is required'),
  productName: z.string().min(1, 'productName is required'),
  productId: z.string().min(1, 'productId is required'),
  quantity: z.number().int().positive(),
  cartUrl: z.string().url(),
});

const orderConfirmedInput = z.object({
  userId: z.string().min(1, 'userId is required'),
  orderId: z.string().min(1, 'orderId is required'),
  orderTotal: z.string().min(1, 'orderTotal is required'),
  items: z.array(z.object({ name: z.string().min(1), quantity: z.number().int().positive() })),
  orderUrl: z.string().url(),
});

const orderShippedInput = z.object({
  userId: z.string().min(1, 'userId is required'),
  orderId: z.string().min(1, 'orderId is required'),
  trackingNumber: z.string().min(1, 'trackingNumber is required'),
  carrier: z.string().min(1, 'carrier is required'),
  estimatedDelivery: z.string().min(1, 'estimatedDelivery is required'),
  orderUrl: z.string().url(),
});

const paymentSucceededInput = z.object({
  userId: z.string().min(1, 'userId is required'),
  orderId: z.string().min(1, 'orderId is required'),
  amount: z.string().min(1, 'amount is required'),
  currency: z.string().length(3, 'currency must be a 3-letter code'),
  paymentMethod: z.string().min(1, 'paymentMethod is required'),
  orderUrl: z.string().url(),
});

const paymentFailedInput = z.object({
  userId: z.string().min(1, 'userId is required'),
  orderId: z.string().min(1, 'orderId is required'),
  amount: z.string().min(1, 'amount is required'),
  currency: z.string().length(3, 'currency must be a 3-letter code'),
  reason: z.string().min(1, 'reason is required'),
  retryUrl: z.string().url(),
});

const checkoutCompletedInput = z.object({
  userId: z.string().min(1, 'userId is required'),
  orderId: z.string().min(1, 'orderId is required'),
  orderTotal: z.string().min(1, 'orderTotal is required'),
  itemsCount: z.number().int().positive(),
  orderUrl: z.string().url(),
});

/* --- Search input schemas ------------------------------------------ */

const searchAlertCreatedInput = z.object({
  userId: z.string().min(1, 'userId is required'),
  query: z.string().trim().min(1, 'Query cannot be empty'),
  alertUrl: z.string().url(),
});

const searchNewResultsInput = z.object({
  userId: z.string().min(1, 'userId is required'),
  query: z.string().trim().min(1, 'Query cannot be empty'),
  resultCount: z.number().int().nonnegative(),
  topResultName: z.string().min(1, 'topResultName is required'),
  resultsUrl: z.string().url(),
});

/* --- Auth input schemas -------------------------------------------- */

const loginNotificationInput = z.object({
  userId: z.string().min(1, 'userId is required'),
  email: z.string().email(),
  ipAddress: z.string().optional(),
  device: z.string().optional(),
  location: z.string().optional(),
});

const passwordResetInput = z.object({
  userId: z.string().min(1, 'userId is required'),
  name: z.string().min(1, 'name is required'),
  resetUrl: z.string().url(),
});

const twoFactorCodeInput = z.object({
  userId: z.string().min(1, 'userId is required'),
  code: z.string().min(1, 'code is required'),
  validUntil: z.string().min(1, 'validUntil is required'),
});

const passwordChangedInput = z.object({
  userId: z.string().min(1, 'userId is required'),
  email: z.string().email(),
});

/* --- Event-based transactional input schemas ----------------------- */

const accountCreatedInput = z.object({
  userId: z.string().min(1, 'userId is required'),
  name: z.string().min(1, 'name is required'),
  email: z.string().email(),
  welcomeUrl: z.string().url(),
});

const emailChangedInput = z.object({
  userId: z.string().min(1, 'userId is required'),
  newEmail: z.string().email(),
  verifiedUrl: z.string().url(),
});

const subscriptionStartedInput = z.object({
  userId: z.string().min(1, 'userId is required'),
  planName: z.string().min(1, 'planName is required'),
  amount: z.string().min(1, 'amount is required'),
  currency: z.string().length(3, 'currency must be a 3-letter code'),
  nextBillingDate: z.string().min(1, 'nextBillingDate is required'),
  manageUrl: z.string().url(),
});

const subscriptionRenewedInput = z.object({
  userId: z.string().min(1, 'userId is required'),
  planName: z.string().min(1, 'planName is required'),
  amount: z.string().min(1, 'amount is required'),
  currency: z.string().length(3, 'currency must be a 3-letter code'),
  nextBillingDate: z.string().min(1, 'nextBillingDate is required'),
  invoiceUrl: z.string().url(),
});

const subscriptionCancelledInput = z.object({
  userId: z.string().min(1, 'userId is required'),
  planName: z.string().min(1, 'planName is required'),
  refundedUntil: z.string().min(1, 'refundedUntil is required'),
});

const refundProcessedInput = z.object({
  userId: z.string().min(1, 'userId is required'),
  orderId: z.string().min(1, 'orderId is required'),
  amount: z.string().min(1, 'amount is required'),
  currency: z.string().length(3, 'currency must be a 3-letter code'),
  orderUrl: z.string().url(),
});

const reviewPostedInput = z.object({
  userId: z.string().min(1, 'userId is required'),
  productName: z.string().min(1, 'productName is required'),
  rating: z.number().int().min(1).max(5),
  reviewUrl: z.string().url(),
});

/* --- Stores -------------------------------------------------------- */

const stores = {
  suppression: inMemorySuppressionList({
    seed: {
      'blocked@example.com': { reason: 'unsubscribe', createdAt: new Date('2026-01-01') },
    },
  }),
  rateLimit: inMemoryRateLimitStore(),
  idempotency: inMemoryIdempotencyStore(),
};

const observability = {
  sink: inMemoryEventSink(),
  tracer: inMemoryTracer(),
};

/* --- Service with middlewares ------------------------------------- */

const notificationService = createNotify({ channels: { email: ch } })
  .use(withTracing({ tracer: observability.tracer }))
  .use(withEventLogger({ sink: observability.sink }))
  .use(withSuppressionList({ list: stores.suppression }))
  .use(
    withRateLimit({
      store: stores.rateLimit,
      key: ({ args }) => (Array.isArray(args.to) ? 'multi' : String(args.to)),
      max: 5,
      window: 60_000,
    }),
  );

/* --- Catalogs ------------------------------------------------------ */

const transactional = notificationService.catalog({
  welcome: notificationService
    .email()
    .input(welcomeInput)
    .subject(({ input }) => `Welcome, ${input.name}!`)
    .use(
      withIdempotency<z.infer<typeof welcomeInput>>({
        store: stores.idempotency,
        key: ({ input, args }) => `welcome:${args.to}:${input.name}`,
        ttl: 24 * 60 * 60_000,
      }),
    )
    .template({
      render: async ({ input }) => ({
        text: `Welcome, ${input.name}! Verify: ${input.verifyUrl}`,
        html: `<p>Welcome, ${input.name}! <a href="${input.verifyUrl}">Verify</a></p>`,
      }),
    }),
  reset: notificationService
    .email()
    .input(resetInput)
    .subject(() => 'Reset your password')
    .template({
      render: async ({ input }) => ({
        text: `Hi ${input.name}, reset here: ${input.resetUrl}`,
        html: `<p>Hi ${input.name}, <a href="${input.resetUrl}">reset your password</a>.</p>`,
      }),
    }),
});

const marketing = notificationService.catalog({
  newsletter: notificationService
    .email()
    .input(newsletterInput)
    .subject(({ input }) => input.headline)
    .template({
      render: async ({ input }) => ({
        text: `${input.headline} — read: ${input.bodyUrl}`,
        html: `<h1>${input.headline}</h1><p><a href="${input.bodyUrl}">Read more</a></p>`,
      }),
    }),
});

/* --- Commerce catalog ---------------------------------------------- */

const commerce = notificationService.catalog({
  cartItemAdded: notificationService
    .email()
    .input(cartItemAddedInput)
    .subject(({ input }) => `Added to cart: ${input.productName}`)
    .template({
      render: async ({ input }) => ({
        text: `${input.productName} (qty ${input.quantity}) added to your cart. View cart: ${input.cartUrl}`,
        html: `<p><strong>${input.productName}</strong> (qty ${input.quantity}) was added to your cart.<br><a href="${input.cartUrl}">View your cart</a></p>`,
      }),
    }),
  orderConfirmed: notificationService
    .email()
    .input(orderConfirmedInput)
    .subject(({ input }) => `Order confirmed: ${input.orderId}`)
    .template({
      render: async ({ input }) => ({
        text: `Order ${input.orderId} confirmed. Total: ${input.orderTotal}. Items: ${input.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}. View order: ${input.orderUrl}`,
        html: `<p>Order <strong>${input.orderId}</strong> confirmed. Total: <strong>${input.orderTotal}</strong>.</p><p>Items: ${input.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</p><p><a href="${input.orderUrl}">View order details</a></p>`,
      }),
    }),
  orderShipped: notificationService
    .email()
    .input(orderShippedInput)
    .subject(({ input }) => `Order shipped: ${input.orderId}`)
    .template({
      render: async ({ input }) => ({
        text: `Order ${input.orderId} shipped via ${input.carrier}. Tracking: ${input.trackingNumber}. Est. delivery: ${input.estimatedDelivery}. View order: ${input.orderUrl}`,
        html: `<p>Order <strong>${input.orderId}</strong> has shipped via <strong>${input.carrier}</strong>.</p><p>Tracking number: <strong>${input.trackingNumber}</strong></p><p>Estimated delivery: ${input.estimatedDelivery}</p><p><a href="${input.orderUrl}">Track your order</a></p>`,
      }),
    }),
  paymentSucceeded: notificationService
    .email()
    .input(paymentSucceededInput)
    .subject(({ input }) => `Payment received: ${input.amount} ${input.currency}`)
    .template({
      render: async ({ input }) => ({
        text: `Payment of ${input.amount} ${input.currency} succeeded for order ${input.orderId} via ${input.paymentMethod}. View order: ${input.orderUrl}`,
        html: `<p>Payment of <strong>${input.amount} ${input.currency}</strong> succeeded for order <strong>${input.orderId}</strong> via <strong>${input.paymentMethod}</strong>.</p><p><a href="${input.orderUrl}">View order</a></p>`,
      }),
    }),
  paymentFailed: notificationService
    .email()
    .input(paymentFailedInput)
    .subject(({ input }) => `Payment failed for order ${input.orderId}`)
    .template({
      render: async ({ input }) => ({
        text: `Payment of ${input.amount} ${input.currency} failed for order ${input.orderId}. Reason: ${input.reason}. Retry: ${input.retryUrl}`,
        html: `<p>Payment of <strong>${input.amount} ${input.currency}</strong> failed for order <strong>${input.orderId}</strong>.</p><p>Reason: ${input.reason}</p><p><a href="${input.retryUrl}">Retry payment</a></p>`,
      }),
    }),
  checkoutCompleted: notificationService
    .email()
    .input(checkoutCompletedInput)
    .subject(({ input }) => `Checkout complete: ${input.orderId}`)
    .template({
      render: async ({ input }) => ({
        text: `Checkout complete for order ${input.orderId}. Total: ${input.orderTotal}. ${input.itemsCount} items. View order: ${input.orderUrl}`,
        html: `<p>Checkout complete for order <strong>${input.orderId}</strong>. Total: <strong>${input.orderTotal}</strong>. ${input.itemsCount} items.</p><p><a href="${input.orderUrl}">View order</a></p>`,
      }),
    }),
});

/* --- Search catalog ----------------------------------------------- */

const search = notificationService.catalog({
  alertCreated: notificationService
    .email()
    .input(searchAlertCreatedInput)
    .subject(({ input }) => `Search alert created: "${input.query}"`)
    .template({
      render: async ({ input }) => ({
        text: `Your search alert for "${input.query}" has been created. You'll be notified when new results are available. Manage alerts: ${input.alertUrl}`,
        html: `<p>Your search alert for "<strong>${input.query}</strong>" has been created.</p><p>You'll be notified when new results are available.</p><p><a href="${input.alertUrl}">Manage your alerts</a></p>`,
      }),
    }),
  newResults: notificationService
    .email()
    .input(searchNewResultsInput)
    .subject(({ input }) => `${input.resultCount} new results for "${input.query}"`)
    .template({
      render: async ({ input }) => ({
        text: `${input.resultCount} new results for "${input.query}". Top result: ${input.topResultName}. View results: ${input.resultsUrl}`,
        html: `<p><strong>${input.resultCount}</strong> new results for "<strong>${input.query}</strong>".</p><p>Top result: ${input.topResultName}</p><p><a href="${input.resultsUrl}">View all results</a></p>`,
      }),
    }),
});

/* --- Auth catalog -------------------------------------------------- */

const auth = notificationService.catalog({
  login: notificationService
    .email()
    .input(loginNotificationInput)
    .subject(({ input }) => `New login to your account`)
    .template({
      render: async ({ input }) => ({
        text: `A new login was detected for your account (${input.email}).${input.ipAddress ? ` IP: ${input.ipAddress}` : ''}${input.device ? ` Device: ${input.device}` : ''}${input.location ? ` Location: ${input.location}` : ''}. If this was you, no action needed. If not, please secure your account.`,
        html: `<p>A new login was detected for your account (<strong>${input.email}</strong>).</p>${input.ipAddress ? `<p>IP: ${input.ipAddress}</p>` : ''}${input.device ? `<p>Device: ${input.device}</p>` : ''}${input.location ? `<p>Location: ${input.location}</p>` : ''}<p>If this was you, no action needed. If not, please <a href="/account/security">secure your account</a>.</p>`,
      }),
    }),
  passwordReset: notificationService
    .email()
    .input(passwordResetInput)
    .subject(() => 'Reset your password')
    .template({
      render: async ({ input }) => ({
        text: `Hi ${input.name}, reset your password here: ${input.resetUrl}`,
        html: `<p>Hi <strong>${input.name}</strong>,</p><p>Click the link below to reset your password:</p><p><a href="${input.resetUrl}">Reset password</a></p>`,
      }),
    }),
  twoFactorCode: notificationService
    .email()
    .input(twoFactorCodeInput)
    .subject(({ input }) => `Your 2FA verification code`)
    .template({
      render: async ({ input }) => ({
        text: `Your 2FA verification code is: ${input.code}. Valid until: ${input.validUntil}`,
        html: `<p>Your 2FA verification code is: <strong>${input.code}</strong></p><p>Valid until: ${input.validUntil}</p>`,
      }),
    }),
  passwordChanged: notificationService
    .email()
    .input(passwordChangedInput)
    .subject(() => `Your password was changed`)
    .template({
      render: async ({ input }) => ({
        text: `Your password for ${input.email} was changed successfully. If you didn't make this change, please contact support immediately.`,
        html: `<p>Your password for <strong>${input.email}</strong> was changed successfully.</p><p>If you didn't make this change, please <a href="/support">contact support</a> immediately.</p>`,
      }),
    }),
});

/* --- Transactional events catalog -------------------------------- */

const transactionalEvents = notificationService.catalog({
  accountCreated: notificationService
    .email()
    .input(accountCreatedInput)
    .subject(({ input }) => `Welcome to our platform, ${input.name}!`)
    .template({
      render: async ({ input }) => ({
        text: `Welcome ${input.name}! Your account has been created. Verify your email: ${input.welcomeUrl}`,
        html: `<p>Welcome <strong>${input.name}</strong>! Your account has been created.</p><p><a href="${input.welcomeUrl}">Verify your email address</a></p>`,
      }),
    }),
  emailChanged: notificationService
    .email()
    .input(emailChangedInput)
    .subject(({ input }) => `Verify your new email address`)
    .template({
      render: async ({ input }) => ({
        text: `Your email was changed to ${input.newEmail}. Verify here: ${input.verifiedUrl}`,
        html: `<p>Your email address was changed to <strong>${input.newEmail}</strong>.</p><p><a href="${input.verifiedUrl}">Verify this change</a></p>`,
      }),
    }),
  subscriptionStarted: notificationService
    .email()
    .input(subscriptionStartedInput)
    .subject(({ input }) => `Subscription started: ${input.planName}`)
    .template({
      render: async ({ input }) => ({
        text: `Your ${input.planName} subscription started. Amount: ${input.amount} ${input.currency}. Next billing: ${input.nextBillingDate}. Manage: ${input.manageUrl}`,
        html: `<p>Your <strong>${input.planName}</strong> subscription has started.</p><p>Amount: <strong>${input.amount} ${input.currency}</strong></p><p>Next billing date: ${input.nextBillingDate}</p><p><a href="${input.manageUrl}">Manage your subscription</a></p>`,
      }),
    }),
  subscriptionRenewed: notificationService
    .email()
    .input(subscriptionRenewedInput)
    .subject(({ input }) => `Subscription renewed: ${input.planName}`)
    .template({
      render: async ({ input }) => ({
        text: `Your ${input.planName} subscription has been renewed. Amount: ${input.amount} ${input.currency}. Next billing: ${input.nextBillingDate}. Invoice: ${input.invoiceUrl}`,
        html: `<p>Your <strong>${input.planName}</strong> subscription has been renewed.</p><p>Amount: <strong>${input.amount} ${input.currency}</strong></p><p>Next billing date: ${input.nextBillingDate}</p><p><a href="${input.invoiceUrl}">View invoice</a></p>`,
      }),
    }),
  subscriptionCancelled: notificationService
    .email()
    .input(subscriptionCancelledInput)
    .subject(({ input }) => `Subscription cancelled: ${input.planName}`)
    .template({
      render: async ({ input }) => ({
        text: `Your ${input.planName} subscription has been cancelled. You'll have access until ${input.refundedUntil}.`,
        html: `<p>Your <strong>${input.planName}</strong> subscription has been cancelled.</p><p>You'll have access until <strong>${input.refundedUntil}</strong>.</p>`,
      }),
    }),
  refundProcessed: notificationService
    .email()
    .input(refundProcessedInput)
    .subject(({ input }) => `Refund processed for order ${input.orderId}`)
    .template({
      render: async ({ input }) => ({
        text: `Refund of ${input.amount} ${input.currency} has been processed for order ${input.orderId}. View order: ${input.orderUrl}`,
        html: `<p>Refund of <strong>${input.amount} ${input.currency}</strong> has been processed for order <strong>${input.orderId}</strong>.</p><p><a href="${input.orderUrl}">View order</a></p>`,
      }),
    }),
  reviewPosted: notificationService
    .email()
    .input(reviewPostedInput)
    .subject(({ input }) => `Review posted: ${input.productName}`)
    .template({
      render: async ({ input }) => ({
        text: `Thank you for your ${input.rating}-star review of ${input.productName}. View your review: ${input.reviewUrl}`,
        html: `<p>Thank you for your <strong>${input.rating}-star</strong> review of <strong>${input.productName}</strong>.</p><p><a href="${input.reviewUrl}">View your review</a></p>`,
      }),
    }),
});

/* --- Full catalog -------------------------------------------------- */

const catalog = notificationService.catalog({
  transactional,
  marketing,
  commerce,
  search,
  auth,
  transactionalEvents,
});

/* The full notification service — imported by RPC and composables. */
export { catalog as notificationService }

/* --- Kitchen-sink runner ------------------------------------------ */

export const runKitchenSink = async (): Promise<void> => {
  const mail = createClient({
    catalog,
    transportsByChannel: { email: mockTransport('mock') },
    logger: consoleLogger({ level: 'warn' }),
  });

  const sendWelcome = async (
    label: string,
    to: string,
    input: { name: string; verifyUrl: string },
  ): Promise<void> => {
    try {
      const result = await mail.transactional.welcome.send({ to, input });
      console.log(`${label.padEnd(28)} → ${result.messageId.slice(0, 12)}`);
    } catch (err) {
      if (err instanceof NotifyRpcRateLimitedError) {
        console.log(
          `${label.padEnd(28)} → rate-limited (retry in ${err.retryAfterMs.toFixed(0)}ms)`,
        );
        return;
      }
      throw err;
    }
  };

  const verifyUrl = makeVerifyUrl();

  console.log('1. fresh send via transactional sub-catalog (idempotency miss, rate limit ok)');
  await sendWelcome('  first send', 'john@example.com', makeWelcomeInput('John Doe', verifyUrl));

  console.log('2. same key (idempotency hit — replays cached result)');
  await sendWelcome(
    '  second send same key',
    'john@example.com',
    makeWelcomeInput('John Doe', verifyUrl),
  );

  console.log('3. blocked recipient (suppression short-circuit)');
  await sendWelcome('  to suppressed', 'blocked@example.com', makeWelcomeInput('Blocked', verifyUrl));

  console.log('4. burn the rate limit (max=5 per 60s, keyed per-recipient)');
  for (let i = 0; i < 6; i++) {
    await sendWelcome(`  send #${i + 1} to sarah`, 'sarah@example.com', {
      name: `Sarah ${i}`,
      verifyUrl,
    });
  }

  console.log('5. send via marketing sub-catalog (nested path: mail.marketing.newsletter)');
  const newsletter = await mail.marketing.newsletter.send({
    to: 'john@example.com',
    input: {
      headline: 'Weekly update',
      bodyUrl: 'https://example.com/posts/weekly',
    },
  });
  console.log(`  newsletter → ${newsletter.messageId.slice(0, 12)}`);

  console.log('6. send via transactional.reset (second route in transactional sub-catalog)');
  const reset = await mail.transactional.reset.send({
    to: 'john@example.com',
    input: { name: 'John Doe', resetUrl: makeVerifyUrl('https://example.com/reset') },
  });
  console.log(`  reset → ${reset.messageId.slice(0, 12)}`);

  /* --- Commerce catalog tests ------------------------------------ */

  console.log('7. commerce.cartItemAdded');
  const cartAdded = await mail.commerce.cartItemAdded.send({
    to: 'john@example.com',
    input: {
      userId: 'user-123',
      productName: 'Meeovi Wireless Headphones',
      productId: 'prod-456',
      quantity: 2,
      cartUrl: 'https://example.com/cart',
    },
  });
  console.log(`  cartItemAdded → ${cartAdded.messageId.slice(0, 12)}`);

  console.log('8. commerce.orderConfirmed');
  const orderConfirmed = await mail.commerce.orderConfirmed.send({
    to: 'john@example.com',
    input: {
      userId: 'user-123',
      orderId: 'ORD-789',
      orderTotal: '$149.99',
      items: [
        { name: 'Meeovi Wireless Headphones', quantity: 1 },
        { name: 'Meeovi Charging Cable', quantity: 2 },
      ],
      orderUrl: 'https://example.com/orders/ORD-789',
    },
  });
  console.log(`  orderConfirmed → ${orderConfirmed.messageId.slice(0, 12)}`);

  console.log('9. commerce.orderShipped');
  const orderShipped = await mail.commerce.orderShipped.send({
    to: 'john@example.com',
    input: {
      userId: 'user-123',
      orderId: 'ORD-789',
      trackingNumber: '1Z999AA10123456784',
      carrier: 'FedEx',
      estimatedDelivery: '2026-08-15',
      orderUrl: 'https://example.com/orders/ORD-789',
    },
  });
  console.log(`  orderShipped → ${orderShipped.messageId.slice(0, 12)}`);

  console.log('10. commerce.paymentSucceeded');
  const paymentOk = await mail.commerce.paymentSucceeded.send({
    to: 'john@example.com',
    input: {
      userId: 'user-123',
      orderId: 'ORD-789',
      amount: '149.99',
      currency: 'USD',
      paymentMethod: 'Stripe',
      orderUrl: 'https://example.com/orders/ORD-789',
    },
  });
  console.log(`  paymentSucceeded → ${paymentOk.messageId.slice(0, 12)}`);

  /* --- Search catalog tests -------------------------------------- */

  console.log('11. search.alertCreated');
  const alertCreated = await mail.search.alertCreated.send({
    to: 'john@example.com',
    input: {
      userId: 'user-123',
      query: 'wireless headphones',
      alertUrl: 'https://example.com/alerts/123',
    },
  });
  console.log(`  alertCreated → ${alertCreated.messageId.slice(0, 12)}`);

  console.log('12. search.newResults');
  const newResults = await mail.search.newResults.send({
    to: 'john@example.com',
    input: {
      userId: 'user-123',
      query: 'wireless headphones',
      resultCount: 15,
      topResultName: 'Meeovi Pro Headphones',
      resultsUrl: 'https://example.com/search?q=wireless+headphones',
    },
  });
  console.log(`  newResults → ${newResults.messageId.slice(0, 12)}`);

  /* --- Auth catalog tests ---------------------------------------- */

  console.log('13. auth.login');
  const loginNotif = await mail.auth.login.send({
    to: 'john@example.com',
    input: {
      userId: 'user-123',
      email: 'john@example.com',
      ipAddress: '192.168.1.1',
      device: 'MacBook Pro',
      location: 'San Francisco, CA',
    },
  });
  console.log(`  login → ${loginNotif.messageId.slice(0, 12)}`);

  console.log('14. auth.passwordReset');
  const pwReset = await mail.auth.passwordReset.send({
    to: 'john@example.com',
    input: {
      userId: 'user-123',
      name: 'John',
      resetUrl: makeVerifyUrl('https://example.com/reset'),
    },
  });
  console.log(`  passwordReset → ${pwReset.messageId.slice(0, 12)}`);

  console.log('15. auth.twoFactorCode');
  const tfaCode = await mail.auth.twoFactorCode.send({
    to: 'john@example.com',
    input: {
      userId: 'user-123',
      code: '123456',
      validUntil: '2026-07-26T21:06:00Z',
    },
  });
  console.log(`  twoFactorCode → ${tfaCode.messageId.slice(0, 12)}`);

  /* --- Transactional events tests -------------------------------- */

  console.log('16. transactionalEvents.accountCreated');
  const acctCreated = await mail.transactionalEvents.accountCreated.send({
    to: 'john@example.com',
    input: {
      userId: 'user-123',
      name: 'John',
      email: 'john@example.com',
      welcomeUrl: makeVerifyUrl('https://example.com/welcome'),
    },
  });
  console.log(`  accountCreated → ${acctCreated.messageId.slice(0, 12)}`);

  console.log('17. transactionalEvents.subscriptionStarted');
  const subStarted = await mail.transactionalEvents.subscriptionStarted.send({
    to: 'john@example.com',
    input: {
      userId: 'user-123',
      planName: 'Pro',
      amount: '29.99',
      currency: 'USD',
      nextBillingDate: '2026-08-26',
      manageUrl: 'https://example.com/subscription/manage',
    },
  });
  console.log(`  subscriptionStarted → ${subStarted.messageId.slice(0, 12)}`);

  console.log('18. transactionalEvents.refundProcessed');
  const refund = await mail.transactionalEvents.refundProcessed.send({
    to: 'john@example.com',
    input: {
      userId: 'user-123',
      orderId: 'ORD-789',
      amount: '149.99',
      currency: 'USD',
      orderUrl: 'https://example.com/orders/ORD-789',
    },
  });
  console.log(`  refundProcessed → ${refund.messageId.slice(0, 12)}`);

  console.log('---');
  console.log(`events written: ${observability.sink.events.length}`);
  console.log(`spans recorded: ${observability.tracer.spans.length}`);
};
