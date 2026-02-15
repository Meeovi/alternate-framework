Auto-translation (hybrid/local-first)
===================================

Overview
- This package implements a hybrid, local-first auto-translation strategy:
  - Prefer translations from local locale JSON files (fast, offline, secure).
  - If no local translation exists, the composable returns the original text.
  - An optional server-side provider helper (`callProvider`) is provided for future integration with machine-translation APIs.

Usage
- Import the composable and use it in components:

```ts
import useAutoTranslate from '@mframework/localization/src/composables/useAutoTranslate'

const { translate, translateComputed } = useAutoTranslate()

// async
const translated = await translate('Hello world', 'fr-FR')

// reactive / synchronous best-effort
const computedTranslation = translateComputed(() => message, 'fr-FR')
```

Server provider
- To add machine translation later, expose a server API route in your consuming app that POSTs to an external provider and forwards results. Use `callProvider(url, text, from, to)` from `src/server/provider.ts` to make the external call.

Notes
- This implementation intentionally avoids sending user text to 3rd-party services by default — it is local-first and returns original text when missing.
