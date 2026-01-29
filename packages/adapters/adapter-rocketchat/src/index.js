import { createRocketChatProvider } from './runtime';
import { registerChatProviderRuntime } from '@meeovi/chat';
export { createRocketChatProvider };
// Auto-register helper for runtime use. Adapter consumers can import and
// call this from their app entry to register Rocket.Chat as a chat provider.
export function registerRocketChat(options) {
    const prov = createRocketChatProvider(options);
    registerChatProviderRuntime('rocketchat', prov);
}
