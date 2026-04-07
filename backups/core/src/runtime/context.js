export class MFrameworkContext {
    constructor(config, modules) {
        this.config = config;
        this.modules = modules;
    }
    getAdapter(key) {
        return this.modules.getAdapter(key);
    }
}
