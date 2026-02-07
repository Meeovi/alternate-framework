// Minimal Product reducer compatibility layer. Responds to `PRODUCT_LOADED`.
export default function ProductReducer(state = { product: null }, action: any) {
  if (!action) return state
  try {
    if (action.type === 'PRODUCT_LOADED') {
      return { ...state, product: action.payload }
    }
  } catch (e) {
    // ignore and return current state
  }
  return state
}
