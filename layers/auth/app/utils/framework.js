let ctx = {};
/**
 * Frameworks (Nuxt, React, etc.) call this once during initialization.
 */
export function setFrameworkContext(newCtx) {
    ctx = { ...ctx, ...newCtx };
}
/**
 * Auth providers use this to access framework-specific helpers.
 */
export function getFrameworkContext() {
    return ctx;
}
