# Seller Dashboard Layer

This layer provides a seller/admin dashboard UI and runtime provider hooks to integrate with e-commerce adapters (for example `adapter-magento`).

Key points
- Register a runtime provider using `registerSellerProviderRuntime(name, provider)` exported from `app/composables/registry.ts`.
- The UI composables (e.g. `useSellerProducts`, `useSellerOrders`, `useSellerReviews`) call the registered provider; a memory provider is used by default for development.
- Routes under this layer are protected by a global middleware that only allows users with `seller` or `admin` roles.

Owner-scoped operations
- Composables automatically pass the current seller id (when available) to provider calls so providers can enforce ownership and return only seller-specific data. The helper `getCurrentSellerId()` is available in `app/composables/_auth.ts` and memory provider enforces owner scoping by default.

Integration example (Nuxt runtime):

```ts
import { registerSellerProviderRuntime } from '~~/layers/seller-dashboard/app/composables/registry'
import { createMagentoSellerAdapter } from 'adapter-magento'

registerSellerProviderRuntime('magento', createMagentoSellerAdapter({ /* config */ }))
```

Next steps
- Scaffold product/order/review management pages and wire to real adapters.
- Add tests and CI checks.
