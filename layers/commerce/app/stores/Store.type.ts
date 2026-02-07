// Minimal RootState shim to satisfy legacy reducer shape references.
// Keep it permissive: callers may rely on additional keys at runtime.
export interface ConfigReducerState {
  countries?: any[]
  base_link_url?: string
  secure_base_media_url?: string
  base_url?: string
  [key: string]: any
}

export interface CartReducerState {
  cart?: any
  items?: any[]
  totals?: any
  [key: string]: any
}

export interface MyAccountReducerState {
  customer?: any
  signedIn?: boolean
  [key: string]: any
}

export interface RootState {
  ConfigReducer?: ConfigReducerState
  CartReducer?: CartReducerState
  MyAccountReducer?: MyAccountReducerState
  [key: string]: any
}

// Named interface `RootState` exported above; no additional export statement needed.
