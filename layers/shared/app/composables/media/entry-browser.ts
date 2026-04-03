import setupAutoAttach from './autoAttach'

// expose a global for the test page and other simple integrations
(globalThis as any).setupAutoAttach = setupAutoAttach
export default setupAutoAttach
