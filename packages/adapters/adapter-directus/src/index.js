import { createDirectusClient } from './runtime/composables/useContentRequest';
export function directusContentAdapter(config = {}) {
    return createDirectusClient(config);
}
