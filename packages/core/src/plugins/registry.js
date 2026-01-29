export class ModuleRegistry {
    modules = new Map();
    adapters = new Map();
    bus = null;
    constructor(bus) {
        if (bus)
            this.bus = bus;
    }
    registerModule(module, ctx) {
        if (this.modules.has(module.id))
            return;
        this.modules.set(module.id, module);
        if (module.adapters) {
            for (const [key, adapter] of Object.entries(module.adapters)) {
                const typedKey = key;
                this.registerAdapter(typedKey, adapter);
            }
        }
        module.setup?.(ctx);
    }
    getAdapter(key) {
        return this.adapters.get(key);
    }
    // Register an adapter at runtime. Emits `adapter:registered` so modules
    // depending on adapters can react when new adapters become available.
    registerAdapter(key, adapter) {
        this.adapters.set(key, adapter);
        if (this.bus) {
            try {
                // notify listeners asynchronously
                this.bus.emit('adapter:registered', { key }).catch(() => { });
            }
            catch (e) {
                // ignore emit errors
            }
        }
    }
    async runLifecycle(hook, ctx) {
        for (const module of this.modules.values()) {
            const fn = module[hook];
            if (typeof fn === 'function') {
                await fn.call(module, ctx);
            }
        }
    }
}
