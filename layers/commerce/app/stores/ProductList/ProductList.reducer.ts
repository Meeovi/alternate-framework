// Minimal ProductList reducer compatibility layer. Accepts an action with
// `type: 'PRODUCT_LIST_LOADED'` and `payload` to populate `items`.
export default function ProductListReducer(state = { items: [] }, action: any) {
  if (!action) return state
  try {
    if (action.type === 'PRODUCT_LIST_LOADED') {
      return { ...state, items: Array.isArray(action.payload) ? action.payload : state.items }
    }
  } catch (e) {
    // ignore and return current state
  }
  return state
}
