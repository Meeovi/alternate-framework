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

/* --- Shared channel + rpc ----------------------------------------- */

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

/* --- Observability + stores (kitchen-sink) ----------------------- */

const welcomeInput = z.object({ name: z.string(), verifyUrl: z.string().url() });
const resetInput = z.object({ name: z.string(), resetUrl: z.string().url() });
const newsletterInput = z.object({ headline: z.string(), bodyUrl: z.string().url() });

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

const catalog = notificationService.catalog({ transactional, marketing });

/* The full kitchen-sink service — imported by `rpc.ts` via ./notify. */
export { catalog as notificationService };

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

  console.log('---');
  console.log(`events written: ${observability.sink.events.length}`);
  console.log(`spans recorded: ${observability.tracer.spans.length}`);
};
