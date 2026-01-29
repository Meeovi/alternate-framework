export function createLivePreview(options) {
    const { query = {}, initialState = {} } = options;
    const shouldEnable = Boolean(query.preview) && Boolean(query.token);
    const state = {
        token: query.token || initialState.token,
    };
    return {
        enabled: shouldEnable,
        state,
    };
}
