import * as Sentry from "@sentry/nuxt";

Sentry.init({
  // If set up, you can use your runtime config here
  // dsn: useRuntimeConfig().public.sentry.dsn,
  dsn: (useRuntimeConfig().public as any).sentry.dsn,

  // Full tracing in dev, light sampling in production so trace volume and
  // cost stay sane on a live site.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,
  
  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,
  
  // If you don't want to use Session Replay, just remove the line below:
  // Replays mask all text and block media (explicit, so a library default
  // change can't start recording what users type).
  integrations: [Sentry.replayIntegration({ maskAllText: true, maskAllInputs: true, blockAllMedia: true })],

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending of user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nuxt/configuration/options/#sendDefaultPii
  // Off: on the server this attaches request cookies/headers/IP to every
  // event — i.e. live session tokens stored at a third party. Errors still
  // carry the URL, stack and release; set a user id explicitly if needed.
  sendDefaultPii: false,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
