export interface LivePreviewState {
  token?: string;
}

export interface LivePreviewOptions {
  query?: Record<string, string | undefined>;
  initialState?: LivePreviewState;
}

export function createLivePreview(options: LivePreviewOptions) {
  const { query = {}, initialState = {} } = options;

  const shouldEnable =
    Boolean(query.preview) && Boolean(query.token);

  const state: LivePreviewState = {
    token: query.token || initialState.token,
  };

  return {
    enabled: shouldEnable,
    state,
  };
}
