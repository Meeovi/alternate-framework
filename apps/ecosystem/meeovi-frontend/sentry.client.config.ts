import * as Sentry from "@sentry/nuxt";

Sentry.init({
  // If set up, you can use your runtime config here
  // dsn: useRuntimeConfig().public.sentry.dsn,
  dsn: (useRuntimeConfig().public as any).sentry.dsn,

  // Full tracing in dev, light sampling in production so trace volume and
  // cost stay sane on a live site.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Rates within the sessions that load replay at all (REPLAY_SESSION_SHARE
  // below): 10% of those record in full (1% of all sessions), and every
  // error in the rest of them gets a replay.
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

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

// Session Replay costs ~2.5 s of main-thread CPU per page on a mobile
// device (its full-DOM snapshot). Sentry can't skip that by sampling: with
// any replaysOnErrorSampleRate > 0 it buffers in EVERY session and only
// samples once an error happens. So the sampling is done here, once per tab
// session: 10% of sessions load replay; the other 90% never record.
const REPLAY_SESSION_SHARE = 0.1;
const replayThisSession = (() => {
  try {
    const stored = sessionStorage.getItem('meeovi:replay');
    if (stored !== null) return stored === '1';
    const sampled = Math.random() < REPLAY_SESSION_SHARE;
    sessionStorage.setItem('meeovi:replay', sampled ? '1' : '0');
    return sampled;
  } catch {
    return false;
  }
})();

// Replays mask all text and block media (explicit, so a library default
// change can't start recording what users type). Started once the page has
// loaded and the browser is idle, not during hydration; errors before then
// have no replay.
if (replayThisSession) {
  const startReplay = () => Sentry.addIntegration(Sentry.replayIntegration({ maskAllText: true, maskAllInputs: true, blockAllMedia: true }));
  const whenIdle = () => ('requestIdleCallback' in window ? window.requestIdleCallback(startReplay, { timeout: 10000 }) : setTimeout(startReplay, 3000));
  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', whenIdle, { once: true });
}
