// src/lifecycle/data.ts
import { runCompatHook } from '../compat/loader';
export async function runDataPhase(ctx, providers) {
    // Core data loading (native m modules) would go here
    // Then delegate to compat providers
    await runCompatHook(providers, 'runDataPhase', ctx);
}
