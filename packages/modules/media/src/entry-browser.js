import setupAutoAttach from './autoAttach';
// expose a global for the test page and other simple integrations
globalThis.setupAutoAttach = setupAutoAttach;
export default setupAutoAttach;
