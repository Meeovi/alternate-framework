// src/lifecycle/context.ts
export function createMAppContext(params) {
    return {
        appRoot: params.appRoot,
        env: params.env ?? process.env.NODE_ENV ?? 'development',
        data: params.data,
        router: params.router,
        buildConfig: params.buildConfig,
        compatState: Object.create(null),
    };
}
