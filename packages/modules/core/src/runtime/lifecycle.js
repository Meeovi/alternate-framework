export async function runAppLifecycle(registry, ctx, bus) {
    // Example lifecycle sequence
    await registry.runLifecycle('onAppInit', ctx);
    bus.emit('app:ready', { context: ctx });
}
