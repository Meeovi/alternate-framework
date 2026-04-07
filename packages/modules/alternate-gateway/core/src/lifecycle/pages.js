// src/lifecycle/pages.ts
import { runCompatHook } from '../compat/loader';
export async function runPagesPhase(ctx, providers) {
    // Core route/page generation would go here
    // Then delegate to compat providers
    await runCompatHook(providers, 'runPagesPhase', ctx);
}
