# Adapter Standardization Implementation Plan

**Concrete action items, timeline, and resources for standardizing all adapters**

---

## Goal

Enable provider-neutral adapter swappability so app code doesn't change when swapping backends.

**Success Criteria:**
- All 6+ adapters follow adapter-starter pattern
- Any adapter can be swapped for another with zero app code changes
- Clear documentation for creating future adapters
- Backward compatibility maintained during transition

---

## Current State

| Adapter | Pattern | Refactor? |
|---------|---------|-----------|
| adapter-starter | ✅ Ideal | No (template) |
| adapter-opensearch | ⚠️ Partial | Yes (small) |
| adapter-rocketchat | ⚠️ Partial | Yes (medium) |
| adapter-directus | ❌ None | Yes (large) |
| adapter-magento | ❌ None | Yes (large) |
| adapter-federation | ❌ None | Yes (very large) |
| adapter-prisma | ⚠️ Unique | Decide |

---

## Phase 1: Quick Wins (Week 1)

**Goal:** Refactor 2 adapters to full compliance; establish pattern.

### Task 1.1: Refactor adapter-opensearch
- **Owner:** TBD
- **Effort:** 8 hours
- **Steps:**
  1. [ ] Create `src/transport.ts` from adapter-starter template
  2. [ ] Create `src/search.ts` with SearchAdapter implementation
  3. [ ] Update `src/index.ts` to use createAdapterInstaller
  4. [ ] Remove dual-pattern exports
  5. [ ] Update package.json exports
  6. [ ] Write tests for swappability
  7. [ ] Update README with new installation pattern

**Deliverable:** `packages/adapters/adapter-opensearch/` fully compliant

### Task 1.2: Refactor adapter-rocketchat
- **Owner:** TBD
- **Effort:** 12 hours
- **Steps:**
  1. [ ] Create `src/transport.ts` from adapter-starter template
  2. [ ] Define ChatAdapter interface (or use existing)
  3. [ ] Create `src/chat.ts` with ChatAdapter implementation
  4. [ ] Update `src/index.ts` to use createAdapterInstaller
  5. [ ] Refactor registerRocketChat() to use installer pattern
  6. [ ] Update all imports in consumer code
  7. [ ] Write integration tests

**Deliverable:** `packages/adapters/adapter-rocketchat/` fully compliant

### Task 1.3: Create Documentation (parallel to 1.1 & 1.2)
- **Owner:** TBD
- **Effort:** 8 hours
- **Deliverables:**
  - [ ] ADAPTER_PATTERN_AUDIT.md ✅ (Done)
  - [ ] ADAPTER_DEVELOPMENT_GUIDE.md ✅ (Done)
  - [ ] ADAPTER_MIGRATION_GUIDE.md ✅ (Done)
  - [ ] ADAPTER_STANDARDS_SUMMARY.md ✅ (Done)
  - [ ] Create IMPLEMENTATION_CHECKLIST.md (this document)
  - [ ] Update adapter-starter README with clear template instructions

**Timeline:** 2 business days  
**Total Effort:** 28 hours (3-4 person-days)

---

## Phase 2: Core Adapters (Weeks 2-3)

**Goal:** Refactor 2 major backend adapters to full compliance.

### Task 2.1: Refactor adapter-directus
- **Owner:** TBD
- **Effort:** 24 hours
- **Precondition:** adapter-opensearch, adapter-rocketchat completed
- **Steps:**
  1. [ ] Analyze current Directus SDK integration
  2. [ ] Create `src/transport.ts` abstracting Directus SDK
  3. [ ] Create `src/content.ts` with ContentAdapter implementation
  4. [ ] Create `src/auth.ts` if authentication is used
  5. [ ] Update `src/index.ts` for installer pattern
  6. [ ] Remove Vue/React bindings from main exports
  7. [ ] Add backward compatibility shims for old exports
  8. [ ] Update package.json exports
  9. [ ] Create comprehensive test suite
  10. [ ] Update documentation
  11. [ ] Test with meeovi-frontend app (actual usage)
  12. [ ] Release as v0.1.0 (minor version bump for compatibility)

**Testing:**
```bash
# Verify old code still works
import { readItem } from '@mframework/adapter-directus' # deprecated but works

# Verify new code works
import { installDirectusAdapter } from '@mframework/adapter-directus'
installDirectusAdapter({ url: '...', token: '...' })
const { readItem } = useContent()
```

**Deliverable:** adapter-directus fully compliant, backward compatible

### Task 2.2: Refactor adapter-magento
- **Owner:** TBD
- **Effort:** 24 hours
- **Steps:**
  1. [ ] Analyze current Magento integration patterns
  2. [ ] Create `src/transport.ts` abstracting Magento REST API
  3. [ ] Create `src/commerce.ts` with CommerceAdapter
  4. [ ] Create `src/auth.ts` for customer authentication
  5. [ ] Update `src/index.ts` for installer pattern
  6. [ ] Remove hardcoded `/api/magento/*` routes requirement
  7. [ ] Update package.json exports
  8. [ ] Create test suite with mock Magento API
  9. [ ] Update documentation and examples
  10. [ ] Test swappability with test app
  11. [ ] Release as v0.1.0

**Testing:**
```typescript
// Before: Magento-specific routes
GET /api/magento/cart
GET /api/magento/customer/login

// After: Provider-neutral
import { installMagentoAdapter } from '@mframework/adapter-magento'
const { getCart, login } = useCommerce()
```

**Deliverable:** adapter-magento fully compliant

**Timeline:** 2 weeks (4-5 person-days)  
**Total Effort:** 48 hours

---

## Phase 3: Complex Adapter (Week 4)

**Goal:** Evaluate and plan federation adapter refactoring.

### Task 3.1: adapter-federation Architectural Analysis
- **Owner:** TBD
- **Effort:** 4 hours
- **Questions to Answer:**
  1. [ ] Is federation a first-class adapter (like auth, commerce)?
  2. [ ] Should it implement AuthAdapter or a custom SocialAdapter?
  3. [ ] Which composables are essential vs. optional?
  4. [ ] What's the minimum viable interface?
  5. [ ] Is ActivityPub-only or does it need ATProto/Bluesky too?

**Deliverable:** RFC document with recommendations

### Task 3.2: adapter-federation Refactoring (conditional on 3.1)
- **Owner:** TBD
- **Effort:** 32 hours (if approved)
- **Steps:** (Pending decision on 3.1)
  1. [ ] Define SocialAdapter interface
  2. [ ] Create factory pattern for federation
  3. [ ] Refactor composables to use adapter pattern
  4. [ ] Update installations and tests
  5. [ ] Full documentation

**Timeline:** 1 week (if approved)  
**Total Effort:** 32+ hours

---

## Phase 4: Special Cases (Ongoing)

### Task 4.1: adapter-prisma Evaluation
- **Owner:** TBD
- **Effort:** 2 hours
- **Question:** Is Prisma adapter part of same ecosystem or separate toolchain?
- **Outcome:** Document decision and rationale

**Timeline:** 1 business day  
**Total Effort:** 2 hours

### Task 4.2: Create Future Adapter Template
- **Owner:** TBD
- **Effort:** 4 hours
- **Deliverable:**
  - [ ] Cookiecutter or generator script for new adapters
  - [ ] Boilerplate in adapter-starter with clear markers
  - [ ] Example: create-adapter CLI tool

**Timeline:** 1 business day  
**Total Effort:** 4 hours

---

## Phase 5: Validation & Testing (Week 5)

**Goal:** Verify all adapters work correctly and are swappable.

### Task 5.1: Integration Testing
- **Owner:** TBD
- **Effort:** 8 hours
- **Tests:**
  - [ ] Test each refactored adapter independently
  - [ ] Create swappability test suite (same code, different adapters)
  - [ ] Test with meeovi-frontend, elitenovels apps
  - [ ] Verify backward compatibility

**Timeline:** 1-2 days  
**Total Effort:** 8 hours

### Task 5.2: Documentation & Knowledge Transfer
- **Owner:** TBD
- **Effort:** 6 hours
- **Deliverables:**
  - [ ] Update main README with adapter information
  - [ ] Create adapter troubleshooting guide
  - [ ] Record video walkthrough of creating/refactoring adapters
  - [ ] Team documentation session

**Timeline:** 1 day  
**Total Effort:** 6 hours

---

## Overall Timeline & Allocation

```
Week 1 (Mon-Fri)
├─ Mon-Tue: Tasks 1.1, 1.2 in parallel (2 developers)
├─ Mon-Fri: Task 1.3 in parallel (1 doc writer)
└─ Fri: Review & QA

Week 2-3 (Mon-Fri x 2)
├─ Week 2 (Mon-Wed): Task 2.1 (1 developer)
├─ Week 2 (Mon-Fri): Task 2.2 (1 developer, in parallel)
├─ Week 3 (Mon-Fri): Integration & testing
└─ Fri: Review & release v0.1.0

Week 4
├─ Mon-Tue: Task 3.1 (architecture decision)
├─ Wed-Fri: Task 3.2 planning (if approved)

Week 5
├─ Mon-Tue: Task 5.1 (integration testing)
├─ Wed-Fri: Task 5.2 (documentation)
└─ Fri: Retrospective & lessons learned

Total: 5 weeks
Ideal Team: 3-4 people
```

---

## Resource Requirements

### Personnel
- **1-2 Backend/Adapter Developers** — Refactor adapters
- **1 Documentation/DX Owner** — Guides, examples, videos
- **1 QA/Testing Lead** — Integration tests, swappability verification

### Tools & Setup
- Test adapters: unit tests, integration tests, mock backends
- CI/CD: automated testing on all adapter PRs
- Metrics: track adapter usage, swappability tests

### Dependencies
- Existing: adapter-starter pattern, gateway registry system
- Needed: Standard Result<T> error handling, comprehensive types

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Breaking existing apps | High | Maintain backward compatibility for 2 minor versions |
| Incomplete refactoring | Medium | Use checklists; code review for compliance |
| Poor documentation | Medium | Assign dedicated doc owner; create multiple formats |
| Underestimated effort | Medium | Build 20% buffer into timeline; reassess after P1 |
| Team context loss | Low | Record decisions, video walkthrough, in-code comments |

---

## Success Metrics

After completion, verify:

- [ ] All 7 adapters follow adapter-starter pattern
- [ ] Zero breaking changes for deployed apps (backward compatible)
- [ ] New app can be created in 1 hour using template
- [ ] Adapter can be swapped with <5 line config change
- [ ] 90%+ of app code is provider-neutral (no adapter-specific imports)
- [ ] All new adapters created use template pattern
- [ ] Team can explain adapter pattern in 5 minutes
- [ ] Automated swappability tests pass
- [ ] Documentation complete and clear

---

## Approval & Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Architecture Lead | ___ | __ | ⬜ |
| Engineering Manager | ___ | __ | ⬜ |
| Product Manager | ___ | __ | ⬜ |

---

## Appendix: Detailed Checklists

### Adapter Refactoring Checklist (per adapter)

```markdown
### adapter-name

- [ ] **Planning**
  - [ ] Current implementation analyzed
  - [ ] Dependencies documented
  - [ ] Consumer code identified

- [ ] **Implementation**
  - [ ] src/transport.ts created
  - [ ] src/[layer].ts adapters created
  - [ ] src/index.ts installer implemented
  - [ ] types.ts updated with contracts
  - [ ] package.json exports updated
  - [ ] Build tested and working

- [ ] **Backward Compatibility**
  - [ ] Old exports available (with deprecation warning)
  - [ ] Existing tests still pass
  - [ ] Migration path documented

- [ ] **Testing**
  - [ ] Unit tests pass
  - [ ] Integration tests pass
  - [ ] Swappability tests created and pass
  - [ ] Manual testing with consumer app
  - [ ] Performance verified (no regressions)

- [ ] **Documentation**
  - [ ] README updated with new pattern
  - [ ] Migration guide created for consumers
  - [ ] Examples updated
  - [ ] API documentation complete

- [ ] **Deployment**
  - [ ] Version bumped appropriately
  - [ ] Changelog updated
  - [ ] Released to npm
  - [ ] Consumers notified

- [ ] **Post-Release**
  - [ ] Monitor for issues
  - [ ] Gather feedback
  - [ ] Plan major version (old exports removed)
```

### Test Swappability Checklist

```typescript
// tests/swappability.test.ts

describe('Adapter Swappability', () => {
  // Install first adapter
  before(() => {
    installAdapterA({ url: '...', token: '...' })
  })

  it('should work with adapter A', async () => {
    const { readItem } = useContent()
    const item = await readItem('products', 1)
    expect(item).toHaveProperty('id')
    expect(item.id).toBe(1)
  })

  // Swap to second adapter
  it('should work identically with adapter B', async () => {
    // Uninstall A, install B
    installAdapterB({ url: '...', token: '...' })
    
    // Same code!
    const { readItem } = useContent()
    const item = await readItem('products', 1)
    
    // Same structure
    expect(item).toHaveProperty('id')
    expect(item.id).toBe(1)
  })
})
```

---

## Questions?

- **Architecture:** See ADAPTER_PATTERN_AUDIT.md
- **Creating New:** See ADAPTER_DEVELOPMENT_GUIDE.md
- **Refactoring:** See ADAPTER_MIGRATION_GUIDE.md
- **Quick Ref:** See ADAPTER_STANDARDS_SUMMARY.md
- **This Plan:** See ADAPTER_IMPLEMENTATION_PLAN.md (this doc)

---

**Created:** May 28, 2026  
**Version:** 1.0  
**Status:** Ready for approval

