// src/lifecycle/build.ts
import { foldBuildConfig } from '../compat/loader';
export function applyBuildConfig(ctx, providers) {
    ctx.buildConfig = foldBuildConfig(providers, ctx.buildConfig, ctx);
    return ctx.buildConfig;
}
