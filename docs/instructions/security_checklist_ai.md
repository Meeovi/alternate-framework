# AI Implementation Guide: Social Marketplace Security Checklist

This document is a structured markdown specification designed for AI coding agents (e.g., Cursor, Claude Engineer, Auto-GPT) to parse, generate, and verify security protocols for a social marketplace platform.

---

## SYSTEM CONFIGURATION & BASELINE RULES
The following constraints must be strictly enforced across the codebase.
- **No Raw SQL Concatenation:** All database queries must use parameterized interfaces or ORM abstractions.
- **Fail Closed:** By default, all API endpoints require authentication and specific permission grants unless explicitly whitelisted (e.g., public catalog views).
- **Strict Data Validation:** Reject inputs containing structural mismatches immediately at the gateway layer.

---

## IMPLEMENTATION TIMELINE

### PHASE 1: Schema Setup, Cryptography & Validation Foundations
#### [ ] Objective 1.1: Cryptographic User Hashing
- **Task:** Implement password storage utilizing the **Argon2id** hashing algorithm.
- **Specifications:**
  - Salt length: 16 bytes minimum.
  - Iterations (Time Cost): $\ge 3$.
  - Memory Cost: $64 \text{ MB}$ ($65536 \text{ KB}$).
  - Parallelism: 4 threads.

#### [ ] Objective 1.2: Input Validation Schemas
- **Task:** Implement rigorous structural validation on all API input parameters using a schema library (e.g., Zod, Pydantic, Joi).
- **Specifications:**
  - Block all unexpected payload parameters (strict structural typing).
  - Explicitly sanitize string inputs against cross-site scripting (XSS) vectors.

---

### PHASE 2: Identity, Access Management (IAM) & API Hardening
#### [ ] Objective 2.1: Stateless Session Management with Token Rotation
- **Task:** Build an authentication engine utilizing short-lived access JWTs combined with high-security refresh token rotation.
- **Specifications:**
  - **Access Token:** Lifetime of 15 minutes. Contains user ID and active roles.
  - **Refresh Token:** Stored in an HTTP-only, SameSite=Strict, Secure cookie.
  - **Rotation Engine:** Store active refresh tokens in a fast-access cache (e.g., Redis). If a client attempts to reuse a revoked or already consumed refresh token, immediately invalidate the entire session chain and force re-authentication.

#### [ ] Objective 2.2: Layered API Gateways & Rate Limiting
- **Task:** Introduce adaptive rate-limiting middleware differentiated by endpoint exposure risk.
- **Specifications:**
  - **Auth Rate Limit (`/login`, `/register`, `/reset-password`):** Maximum 5 requests per 60 seconds per IP.
  - **Standard API Access (`/items`, `/search`):** Maximum 60 requests per 60 seconds per IP.
  - Return HTTP status code `429 Too Many Requests` with a descriptive `Retry-After` header when thresholds are violated.

#### [ ] Objective 2.3: Horizontal & Vertical Access Middleware (RBAC)
- **Task:** Write robust evaluation layers separating permissions for `Buyer`, `Seller`, and `Admin`.
- **Specifications:**
  - Validate that the requesting user's identity precisely matches the object owner identity ($User_{\text{ID}} == Resource_{\text{OwnerID}}$) for all object updates or mutations.

---

### PHASE 3: Tokenized Financial Processing & Escrow Ledger
#### [ ] Objective 3.1: PCI-DSS Compliant Payment Flow
- **Task:** Integrate an external third-party payment provider SDK (such as Stripe or Adyen).
- **Specifications:**
  - Raw cardholder data must never hit application memory, storage, or runtime files. Use secure hosted fields or server-side token handlers.

#### [ ] Objective 3.2: Mutation Idempotency Engine
- **Task:** Enforce strict transactional isolation to protect users against duplicate payment processing blocks.
- **Specifications:**
  - Require a unique `Idempotency-Key` string header on all critical transaction endpoints (`POST /v1/charges`).
  - Cache results in an in-memory datastore for 24 hours. Replay identical responses for duplicate incoming identifiers without invoking downstream execution blocks.

#### [ ] Objective 3.3: Two-Phase Ledger Architecture (Escrow)
- **Task:** Program a relational billing engine to separate transaction collection from distribution.
- **Specifications:**
  - Upon successful buyer authorization, route funds directly into a locked escrow status ledger.
  - Restrict release execution triggers until a valid buyer confirmation message or mediated dispute resolution clears the hold windows.

---

### PHASE 4: Communications Integrity & Automated Anti-Fraud Guardrails
#### [ ] Objective 4.1: Dynamic PII Leakage Interceptor
- **Task:** Create real-time text analysis patterns to scrub or intercept transactions moving off-platform.
- **Specifications:**
  - Execute algorithmic regular expression scanning on peer-to-peer message channels.
  - Intercept, flag, and mask telephone string patterns, email blocks, external payment links, and unverified social links.

#### [ ] Objective 4.2: Real-time Visual & Text Content Auditing
- **Task:** Wire asynchronous processing channels to pass all user-uploaded images and marketplace descriptions through automated safety check APIs.
- **Specifications:**
  - Block illegal catalog items, weapon sales, graphic violence, and explicit content ahead of public platform indexing.

#### [ ] Objective 4.3: Location & Velocity Anomalous Detection
- **Task:** Create server-side evaluation listeners targeting anomalous multi-point updates.
- **Specifications:**
  - Raise fraud flags or force immediate Multi-Factor Authentication (MFA) prompts if an authenticated profile updates an explicit listing sequence from an IP block geographically detached from its historical login fingerprint.
  - Track rate patterns: Flag new profiles attempting to list more than 5 separate products within the initial 60 minutes following account registration.

#### [ ] Objective 4.4: Append-Only Audit Logging
- **Task:** Establish a system activity log framework.
- **Specifications:**
  - Document all permission overrides, payment parameter modifications, and explicit bans to an immutable, write-once ledger database configuration.
