import * as Sentry from "@sentry/nuxt";
 
Sentry.init({
  dsn: (useRuntimeConfig().public as any).sentry.dsn,

  // The Sentry Nuxt SDK does not support server-side tracing on Vercel
  // (it warns during the build), so there's nothing to sample there.
  // Off Vercel, sample lightly in production and fully in dev.
  tracesSampleRate: process.env.VERCEL
    ? 0
    : process.env.NODE_ENV === 'production'
      ? 0.1
      : 1.0,

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
