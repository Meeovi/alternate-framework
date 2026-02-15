import { loadGridsomePlugins } from './plugin-loader'
import { runLoadSourceHooks, runCreatePagesHooks, applyConfigureWebpackHooks } from './hook-mapping'

export default {
  name: 'gridsome-compat',

  async setup(mContext) {
    mContext.__gridsome = loadGridsomePlugins(mContext.appRoot)
  },

  async runDataPhase(mContext) {
    for (const plugin of mContext.__gridsome) {
      await runLoadSourceHooks(plugin.hooks, mContext.data)
    }
  },

  async runPagesPhase(mContext) {
    for (const plugin of mContext.__gridsome) {
      await runCreatePagesHooks(plugin.hooks, mContext.router)
    }
  },

  extendBuildConfig(config) {
    return mContext.__gridsome.reduce((cfg, plugin) => {
      return applyConfigureWebpackHooks(plugin.hooks, cfg)
    }, config)
  }
}
