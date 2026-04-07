import { registerRestEndpoint } from '../rest/registry';
export function loadRest() {
    const modules = import.meta.glob('../rest/*.ts', { eager: true });
    for (const path in modules) {
        const mod = modules[path];
        for (const key in mod) {
            registerRestEndpoint(key, mod[key]);
        }
    }
}
