import adapter from '../adapters/mframeworkApiAdapter'

export default () => {
  // register on the server global so server handlers can use it
  try {
    ;(globalThis as any).__adapterServer = adapter
  } catch (err) {
    // ignore
  }
}
