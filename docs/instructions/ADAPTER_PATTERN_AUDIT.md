# Adapter Pattern Audit Report

**Date:** May 28, 2026  
**Scope:** `/packages/adapters/` (7 adapters)  
**Goal:** Ensure all adapters follow provider-neutral swappable pattern from `adapter-starter`

---

## Executive Summary

**Current State:**
- ❌ Adapters are **NOT consistently structured** for swappability
- ⚠️ Each adapter uses different patterns, build systems, and export conventions
- ✅ `adapter-starter` provides the ideal standardized template

**Finding:** Only 1 of 7 adapters closely follows the ideal pattern. 6 adapters require refactoring.

**Impact:** Code cannot swap adapters without modifying app code because:
1. Export interfaces differ per adapter
2. Installation/registration patterns are inconsistent
3. Transport layer abstractions vary
4. Configuration approaches conflict

---

## Adapter Compliance Matrix

| Adapter | Build System | Export Pattern | Layers | Transport | Installer | Swappable? |
|---------|--------------|----------------|--------|-----------|-----------|-----------|
| **adapter-starter** | TypeScript | ✅ Standardized | auth, commerce, search | ✅ TransportAdapter | ✅ createAdapterInstaller | ✅ YES |
| **adapter-directus** | Nuxt Module | ❌ SDK + Vue/React bindings | content | ⚠️ Directus SDK client | Manual | ❌ NO |
| **adapter-federation** | TypeScript | ❌ Composables + runtime | auth (federation) | Various HTTP clients | Manual plugin | ❌ NO |
| **adapter-magento** | Nuxt Module | ❌ Magento-specific types | commerce, auth | Magento SDK | Manual plugin + handlers | ❌ NO |
| **adapter-opensearch** | TypeScript | ⚠️ Dual pattern (direct + starter) | search | ⚠️ OpenSearch client | Manual + class-based | ⚠️ PARTIAL |
| **adapter-prisma** | TypeScript + Prisma | ❌ Prisma-specific | database | Prisma SDK | Manual singleton | ❌ NO |
| **adapter-rocketchat** | TypeScript | ⚠️ Provider registration | chat | RocketChat SDK | Manual function | ⚠️ PARTIAL |

---

## Detailed Analysis

### ✅ adapter-starter (Reference Implementation)

**Status:** Ideal template for all adapters

**Strengths:**
- Clear separation: Transport → Layer Factories → Registry Installation
- `TransportAdapter` interface abstracts HTTP communication
- `defineAdapterLayerFactories()` + `createAdapterInstaller()` pattern is generic and reusable
- Layer factories implement standard contracts (AuthAdapter, CommerceAdapter, SearchAdapter)
- Registry system (setAuthAdapter, setCommerceAdapter, etc.) for swappability
- Consistent options pattern: adapters accept config objects at instantiation

**Key Files:**
- `index.ts` — Main class + exports
- `src/patterns.ts` — Installer pattern (reusable)
- `src/transport.ts` — Generic fetch-based HTTP transport
- `src/auth.ts`, `src/commerce.ts`, `src/search.ts` — Layer implementations
- `types.ts` — Contracts and interfaces

**Installation Pattern:**
```typescript
// Standardized registration
const installer = installStarterAdapter({ baseUrl: '...', apiKey: '...' })
// Registers to: setAuthAdapter, setCommerceAdapter, setSearchAdapter
```

**Recommendation:** Use as the canonical template. ALL other adapters should follow this structure.

---

### ❌ adapter-directus (Non-Compliant)

**Status:** Tightly coupled to Directus SDK; not swappable

**Current Structure:**
- Nuxt module-based (`nuxt-module-build`)
- Exports Directus SDK directly (`@directus/sdk`) + Vue/React bindings
- No transport abstraction
- Runtime: `src/runtime/index.ts` contains custom DirectusAdapter class with normalization

**Issues:**
1. **SDK Lock-in:** Uses `@directus/sdk` directly; no abstraction for swapping
2. **Vue/React Specific:** Exports framework-specific bindings (DirectusVueProvider, useDirectus)
3. **No Installer Pattern:** Manual plugin registration only
4. **Incompatible Exports:** Exports raw SDK methods (readItem, createItem, etc.)
5. **Config Pattern:** Uses Nuxt runtime config directly; not flexible for non-Nuxt usage

**What Needs Changing:**
- [ ] Refactor DirectusAdapter to implement a standard ContentAdapter interface
- [ ] Create TransportAdapter abstraction over Directus SDK
- [ ] Remove Vue/React specific bindings from main exports
- [ ] Implement createAdapterInstaller() pattern
- [ ] Normalize exports to: { installDirectusAdapter, DirectusAdapter }

**Impact on Current Code:**
- ⚠️ Migration path exists but breaking change: need adapter-registry integration

---

### ❌ adapter-federation (Non-Compliant)

**Status:** Standalone protocol adapter; not swappable with other auth/social adapters

**Current Structure:**
- Exports ActivityPub composables, providers, and runtime tools
- Standalone plugins and composables (not layer-based)
- No transport abstraction
- Nuxt module registration (`src/module.ts`)

**Issues:**
1. **Protocol-Specific:** Designed for ActivityPub/ATProto only; not a generalized auth adapter
2. **Composable-Heavy:** Uses composables for all operations (useActivitypub, useRelationship, etc.)
3. **No Adapter Interface:** Doesn't implement any standard adapter contract
4. **Manual Registration:** Plugin-based, not registry-based

**What Needs Changing:**
- [ ] Define SocialAdapter interface (extend AuthAdapter with federation-specific methods)
- [ ] Wrap composables in adapter factory pattern
- [ ] Create TransportAdapter over HTTP federation calls
- [ ] Implement installer pattern for federation layer
- [ ] Consider: Is this a first-class adapter or specialized plugin?

**Impact on Current Code:**
- ⚠️ High refactoring effort; may stay as specialized layer rather than general adapter

---

### ❌ adapter-magento (Non-Compliant)

**Status:** Magento-specific module; not swappable with other commerce adapters

**Current Structure:**
- Nuxt module with server handlers (`/api/magento/*` routes)
- Commerce-specific but tightly coupled to Magento API
- Runtime plugin + server API routes
- Magento SDK dependency

**Issues:**
1. **API Route Lock-in:** Commerce operations hardcoded to `/api/magento` routes
2. **SDK Dependency:** Uses Magento SDK directly without abstraction
3. **Server Handler Pattern:** Not composable; requires specific route handlers
4. **No Swappable Interface:** Can't replace with different commerce backend without code changes

**What Needs Changing:**
- [ ] Create CommerceAdapter interface + implementation
- [ ] Abstract HTTP calls via TransportAdapter over Magento SDK
- [ ] Implement createAdapterInstaller() pattern
- [ ] Remove hardcoded `/api/magento/` routes; use registry-based resolution
- [ ] Support dynamic commerce backend via configuration

**Impact on Current Code:**
- ⚠️ Requires gateway registry integration; Magento-specific routes would become optional/plugin-based

---

### ⚠️ adapter-opensearch (Partial Compliance)

**Status:** Dual implementation; partial starter pattern adoption

**Current Structure:**
- Two export patterns:
  1. Direct: `createOpenSearchAdapter()` → OpenSearchAdapter class
  2. Starter-style: `createGatewayAdapterBindings()` → registry compatible
- TypeScript build; straightforward exports

**Issues:**
1. **Dual Patterns:** Two different installation methods cause confusion
2. **Incomplete Starter Pattern:** `createGatewayAdapterBindings()` returns raw object, not using generic installer
3. **Naming Inconsistency:** OpenSearchAdapter vs SearchAdapter naming

**What Needs Changing:**
- [ ] Remove direct class export; use only installer pattern
- [ ] Implement full `createAdapterInstaller(transport, factories)` pattern
- [ ] Create TransportAdapter over OpenSearch client
- [ ] Single, clear installation method

**Impact on Current Code:**
- ✅ Low effort; mostly cleanup and simplification

---

### ⚠️ adapter-rocketchat (Partial Compliance)

**Status:** Chat-specific adapter; partial registry pattern adoption

**Current Structure:**
- TypeScript with Nuxt kit imports
- `registerRocketChat()` function for runtime registration
- Runtime composables and provider factory
- RocketChat SDK dependency

**Issues:**
1. **Chat-Layer Specific:** Not a general adapter; integrates with chat layer only
2. **Incomplete Installer:** Manual registerRocketChat() function, not factory pattern
3. **Options Pattern:** Basic but inconsistent with starter pattern
4. **SDK Dependency:** Uses RocketChat SDK without transport abstraction

**What Needs Changing:**
- [ ] Create ChatAdapter interface (if not already exists)
- [ ] Implement createAdapterInstaller(transport, factories) with chat factories
- [ ] Create TransportAdapter over RocketChat SDK
- [ ] Align options pattern with standard (config object at install time)

**Impact on Current Code:**
- ✅ Medium effort; align with standard installer pattern

---

### ❌ adapter-prisma (Non-Compliant)

**Status:** Database driver adapter; unique use case; not swappable in traditional sense

**Current Structure:**
- Manages Prisma client singleton
- Adapter registry for different database providers (PostgreSQL, MySQL, MongoDB, etc.)
- Complex environment and configuration loading
- Not Nuxt-module based; CLI integration (db:migrate, db:generate)

**Issues:**
1. **Singleton Pattern:** Prisma client is globally managed; not composable in standard adapter sense
2. **Different Layer:** This is a database abstraction layer, not a gateway adapter
3. **Configuration Complex:** Loads from .env, datasourceUrl, driverAdapter
4. **Not Installer-Compatible:** Requires special handling for Prisma schema migrations

**Assessment:**
- ⚠️ This adapter may be intentionally different; Prisma is a database ORM, not a backend API
- Not directly comparable to other adapters (which are API abstraction layers)

**What Needs Changing (if generalizing):**
- Consider: Is Prisma adapter part of the same ecosystem?
- If yes: Define DatabaseAdapter interface, implement installer pattern
- If no: Document as separate toolchain; not subject to swappability rules

**Impact on Current Code:**
- ⚠️ Architectural decision needed; likely stays specialized

---

## Standardization Template (adapter-starter Pattern)

### Essential Structure for All Adapters

```
adapter-xxx/
├── package.json                    # Standard exports
├── tsconfig.json
├── src/
│   ├── index.ts                   # Main exports (adapter class + installer)
│   ├── patterns.ts                # Use from adapter-starter or create adapter-specific
│   ├── transport.ts               # TransportAdapter implementation
│   ├── auth.ts                    # AuthAdapter layer (if applicable)
│   ├── commerce.ts                # CommerceAdapter layer (if applicable)
│   ├── search.ts                  # SearchAdapter layer (if applicable)
│   ├── [custom-layer].ts          # Additional layer-specific adapters
│   ├── utils.ts                   # Helper functions (error handling, normalizers)
│   └── [module.ts]                # (Optional) Nuxt module for convenience
├── types.ts                        # Type definitions and contracts
└── dist/                           # Compiled output
```

### package.json Export Pattern

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

### index.ts Pattern

```typescript
// 1. Define adapter-specific configuration type
export interface XxxAdapterOptions {
  baseUrl: string
  apiKey?: string
  // ... other options
}

// 2. Create transport
export const createXxxTransport = (config: XxxAdapterOptions): TransportAdapter => {
  // Implementation using adapter-starter transport pattern
}

// 3. Create layer factories
export const createXxxAuthAdapter = (transport: TransportAdapter): AuthAdapter => {
  // Implementation
}

export const createXxxCommerceAdapter = (transport: TransportAdapter): CommerceAdapter => {
  // Implementation
}

// 4. Define installer
const xxxLayerFactories = defineAdapterLayerFactories({
  auth: createXxxAuthAdapter,
  commerce: createXxxCommerceAdapter,
  // ... other layers
})

export const installXxxAdapter = createAdapterInstaller(
  createXxxTransport,
  xxxLayerFactories,
)

// 5. (Optional) Main adapter class for direct instantiation
export class XxxAdapter {
  // Wrapper class for class-based pattern (if preferred)
}
```

### Usage Pattern (App Code)

```typescript
// Should be identical across ALL adapters
import { installXxxAdapter } from '@mframework/adapter-xxx'

// Install and register
installXxxAdapter({
  baseUrl: 'https://...',
  apiKey: 'xxx'
})

// Use generic gateway
import { useContent } from '@mframework/gateway'
const { readItems, createItem } = useContent()
```

---

## Migration Roadmap

### Phase 1: Refactor Core Adapters (for immediate swappability)

**Priority 1 - Quick Wins:**
1. [ ] **adapter-opensearch** → Remove dual pattern, simplify to full installer pattern
2. [ ] **adapter-rocketchat** → Align with standard installer, create ChatAdapter interface

**Priority 2 - Medium Effort:**
3. [ ] **adapter-directus** → Refactor to ContentAdapter + TransportAdapter abstraction
4. [ ] **adapter-magento** → Implement CommerceAdapter, remove hardcoded routes

**Priority 3 - High Effort:**
5. [ ] **adapter-federation** → Define SocialAdapter interface, implement factory pattern
6. [ ] **adapter-prisma** → Assess if truly comparable; may stay specialized

### Phase 2: Documentation & Templates

7. [ ] Create ADAPTER_TEMPLATE.md (this structure)
8. [ ] Create ADAPTER_MIGRATION_GUIDE.md
9. [ ] Add to adapter-starter: example of complex layer implementation
10. [ ] Document test patterns for adapters

### Phase 3: Validation

11. [ ] Test swappability: can you swap adapter-xxx for adapter-yyy with zero app code changes?
12. [ ] Create example apps that use multiple adapters
13. [ ] Ensure all adapters export consistent type contracts

---

## Swappability Checklist

For an adapter to be truly swappable (zero app code changes), it must:

- [ ] **Use standardized installer pattern** from adapter-starter (createAdapterInstaller + defineAdapterLayerFactories)
- [ ] **Implement one or more standard layer interfaces** (AuthAdapter, CommerceAdapter, SearchAdapter, etc.)
- [ ] **Have TransportAdapter abstraction** (no direct SDK usage in layer implementations)
- [ ] **Support configuration via options object** at install time (not environment-specific)
- [ ] **Export single entry point** with consistent naming: install{AdapterName}Adapter
- [ ] **Use registry system** (setAuthAdapter, setCommerceAdapter, etc.) not manual injection
- [ ] **Have comprehensive type contracts** in types.ts or interfaces file
- [ ] **Support error handling** via standard Result<T> / Result<T, E> pattern
- [ ] **Document layer coverage** (which layers this adapter implements)

---

## Example: Refactoring adapter-directus

**Current:**
```typescript
// app code
import { directus } from '@mframework/adapter-directus'
import { readItem } from '@directus/sdk'

const item = await readItem(...)
```

**After Refactoring:**
```typescript
// Installation (done once at app startup)
import { installDirectusAdapter } from '@mframework/adapter-directus'

installDirectusAdapter({
  baseUrl: 'https://directus.example.com',
  apiKey: 'token...'
})

// App code (provider-neutral)
import { useContent } from '@mframework/gateway'

const { readItem } = useContent()
const item = await readItem('collection', 123)
```

**Advantage:** Same app code works with adapter-postgres, adapter-mongodb, adapter-fauna, etc. without changes.

---

## Next Steps

1. **Immediate:** Share this audit with team; decide on timeline for standardization
2. **Week 1:** Refactor adapter-opensearch and adapter-rocketchat (quick wins)
3. **Week 2-3:** Plan adapter-directus and adapter-magento refactoring sprints
4. **Ongoing:** Create comprehensive adapter development guide using adapter-starter as template

---

## Questions for Team

1. **Prisma Adapter:** Should it follow the same pattern as API adapters, or is it intentionally separate?
2. **Federation Adapter:** Is this a first-class adapter (auth + social), or a specialized plugin layer?
3. **Timeline:** When should adapters be standardized? (impacts any new features using adapters)
4. **Breaking Changes:** Is it acceptable to refactor adapters if it improves swappability?
5. **Nuxt-Only:** Should adapters support non-Nuxt usage, or is Nuxt the primary target?

