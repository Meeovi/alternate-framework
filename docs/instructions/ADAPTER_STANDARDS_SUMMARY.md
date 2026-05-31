# Adapter Standards Summary

**Quick reference for the new adapter standardization initiative**

---

## What Changed?

All adapters should now follow the **adapter-starter pattern** to enable provider-neutral swappability.

### Before (Non-Swappable)
```typescript
// App code tightly coupled to specific adapter
import { directus, readItem } from '@mframework/adapter-directus'
const product = await readItem('products', 1)

// To use Magento instead, rewrite entire app:
import { magento, getProduct } from '@mframework/adapter-magento'
const product = await magento.getProduct(1)
```

### After (Swappable)
```typescript
// Installation (one-time, per deployment)
import { installDirectusAdapter } from '@mframework/adapter-directus'
installDirectusAdapter({ url: '...', token: '...' })

// App code (provider-neutral, works with ANY adapter)
import { useContent } from '@mframework/gateway'
const { readItem } = useContent()
const product = await readItem('products', 1)

// To swap adapters, only change this line in nuxt.config:
// installDirectusAdapter(...) → installPostgresAdapter(...)
// OR
// installMagentoAdapter(...)
// NO app code changes needed!
```

---

## Adapter Compliance Status

| Adapter | Status | Effort | Priority |
|---------|--------|--------|----------|
| **adapter-starter** | ✅ Template | — | Reference |
| **adapter-opensearch** | ⚠️ Partial | Small | P1 |
| **adapter-rocketchat** | ⚠️ Partial | Medium | P1 |
| **adapter-directus** | ❌ Non-Compliant | Large | P2 |
| **adapter-magento** | ❌ Non-Compliant | Large | P2 |
| **adapter-federation** | ❌ Non-Compliant | XLarge | P3 |
| **adapter-prisma** | ⚠️ Special | Decision | P4 |

---

## For Developers: Creating New Adapters

### 1. Copy adapter-starter template
```bash
cp -r packages/adapters/adapter-starter packages/adapters/adapter-myservice
cd packages/adapters/adapter-myservice
```

### 2. Update these files
- `package.json` — Change name, description, dependencies
- `src/transport.ts` — HTTP abstraction over your backend SDK
- `src/[layer].ts` — Implement AuthAdapter, CommerceAdapter, etc.
- `src/index.ts` — Export installer function

### 3. Follow this structure
```typescript
export const createMyServiceTransport = (config) => TransportAdapter
export const createMyServiceAuthAdapter = (transport) => AuthAdapter
export const installMyServiceAdapter = createAdapterInstaller(transport, factories)
```

### 4. That's it!
Your adapter is automatically swappable with all others following the pattern.

**Read:** [ADAPTER_DEVELOPMENT_GUIDE.md](ADAPTER_DEVELOPMENT_GUIDE.md)

---

## For Teams: Standardizing Existing Adapters

### Priority 1 (Quick Wins)
- [ ] **adapter-opensearch** → Remove dual pattern, simplify to installer pattern
- [ ] **adapter-rocketchat** → Align with standard installer pattern

**Estimated:** 1-2 weeks, 1-2 people

### Priority 2 (Core Adapters)
- [ ] **adapter-directus** → Refactor to ContentAdapter + TransportAdapter
- [ ] **adapter-magento** → Implement CommerceAdapter, remove hardcoded routes

**Estimated:** 3-4 weeks, 1 person per adapter

### Priority 3 (Complex)
- [ ] **adapter-federation** → Define SocialAdapter interface, implement factory pattern

**Estimated:** 2-3 weeks, 1 person

### Priority 4 (Decision)
- [ ] **adapter-prisma** → Decide if it follows same pattern or stays specialized

**Estimated:** Research, 2-3 hours

**Read:** [ADAPTER_MIGRATION_GUIDE.md](ADAPTER_MIGRATION_GUIDE.md)

---

## Key Concepts

### TransportAdapter
Generic HTTP abstraction. Every adapter implements one.

```typescript
interface TransportAdapter {
  request<T>(method: string, path: string, options?: RequestOptions): Promise<APIResponse<T>>
}
```

**Why?** Lets your adapter work with any backend API (REST, GraphQL, custom) without code changes.

### Layer Adapters
Specific functionality implementations (auth, commerce, search, content, etc.).

```typescript
interface AuthAdapter {
  login(input: LoginInput): Promise<Result<Session>>
  register(input: RegisterInput): Promise<Result<Session>>
  logout(): Promise<Result<true>>
}
```

### Installer Pattern
Function that registers your adapter layers with the gateway.

```typescript
export const installXxxAdapter = createAdapterInstaller(
  createXxxTransport,
  { auth: createXxxAuthAdapter, commerce: createXxxCommerceAdapter }
)
```

**Why?** One call to installXxxAdapter() sets up all layers automatically.

### Gateway Pattern
Generic composition functions that work with any swapped adapter.

```typescript
// Works with Directus, Magento, Postgres, anything!
const { readItem } = useContent()
const item = await readItem('products', 123)
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│           App Code (provider-neutral)    │
│  useAuth(), useContent(), useCommerce() │
└────────────────┬────────────────────────┘
                 │
                 │ (registers at startup)
                 ▼
┌─────────────────────────────────────────┐
│    Adapter Registry (setAuthAdapter)    │
│  (one adapter per layer, swappable)     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│   Layer Adapters (AuthAdapter, etc.) │
│  + Error Handling + Normalization     │
└────────────────┬─────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│      TransportAdapter (HTTP)         │
│  (generic fetch-based abstraction)    │
└────────────────┬─────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│  Backend SDK (Directus, Magento, etc)│
│  OR Raw HTTP (fetch/axios)           │
└──────────────────────────────────────┘
```

---

## Compliance Checklist

Use this to verify an adapter follows the pattern:

- [ ] Has `createAdapterTransport(config)` function
- [ ] Has `createAdapter[Layer]Adapter(transport)` factory functions
- [ ] Has `installAdapterName = createAdapterInstaller(...)` export
- [ ] Implements one or more standard layer interfaces
- [ ] Takes configuration as constructor/function options (not env vars)
- [ ] Registers via `setAuthAdapter()`, `setCommerceAdapter()`, etc.
- [ ] Returns `Result<T>` or `Result<T, E>` from all methods
- [ ] Handles errors consistently
- [ ] Has comprehensive types in `types.ts`
- [ ] Works in Nuxt and Node.js (not framework-specific)
- [ ] Can be swapped for another adapter with zero app code changes

---

## Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| **ADAPTER_PATTERN_AUDIT.md** | Current state analysis | Architects, leads |
| **ADAPTER_DEVELOPMENT_GUIDE.md** | How to create adapters | New adapter developers |
| **ADAPTER_MIGRATION_GUIDE.md** | How to refactor adapters | Team members refactoring |
| **ADAPTER_STANDARDS_SUMMARY.md** | This file | Everyone |

---

## FAQ

**Q: Do I need to refactor all adapters immediately?**  
A: No. Refactor in priority order as time allows. Use P1 adapters for new apps.

**Q: Will old code still work?**  
A: Yes. Provide backward compatibility shims during transition period.

**Q: What if my backend has unique requirements?**  
A: Implement what fits the standard layer interface; return error results for unsupported operations.

**Q: How do I test adapter swappability?**  
A: Write tests that install different adapters and verify identical behavior with same code.

**Q: Can I use multiple adapters in one app?**  
A: Yes. Install multiple adapters; they register to different layers (auth, commerce, search, etc.).

**Q: Is this breaking for existing users?**  
A: No. Maintain backward compatibility during transition. Major version bump when old exports removed.

---

## Next Actions

1. **Read:** [ADAPTER_PATTERN_AUDIT.md](ADAPTER_PATTERN_AUDIT.md) for detailed analysis
2. **For new adapters:** Follow [ADAPTER_DEVELOPMENT_GUIDE.md](ADAPTER_DEVELOPMENT_GUIDE.md)
3. **For refactoring:** Follow [ADAPTER_MIGRATION_GUIDE.md](ADAPTER_MIGRATION_GUIDE.md)
4. **Questions?** Ask architecture team or refer to adapter-starter implementation

---

**Version:** 1.0  
**Last Updated:** May 28, 2026  
**Owner:** Architecture Team

