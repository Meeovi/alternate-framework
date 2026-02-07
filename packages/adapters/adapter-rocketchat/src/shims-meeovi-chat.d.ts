declare module '@mframework/chat' {
  import type { ChatProvider } from './src/types'
  export function registerChatProviderRuntime(name: string, provider: ChatProvider): void
  export function createMemoryChatProvider(): any
}
