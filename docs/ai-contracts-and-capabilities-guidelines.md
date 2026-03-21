# Meeovi Contracts & Capabilities Guidelines
This document defines what AI must include in every **Contract** and **Capability** file within the Meeovi architecture.  
These rules ensure consistency, backend-agnostic design, and production readiness.

AI must follow these instructions exactly when generating or modifying code.

---

# 1. CONTRACTS (packages/contracts)

Contracts define the **public API** of Meeovi’s internal architecture.  
They are the single source of truth for:

- capability interfaces  
- adapter interfaces  
- DTOs  
- Zod schemas  
- error types  

AI must never modify contracts unless explicitly instructed by the human architect.

---

## 1.1 What Every Contract Must Include

### A. **Interface Definition**
Each contract must define a clear TypeScript interface describing:

- method names  
- input types  
- output types  
- error types  
- invariants  

Example:
```ts
export interface AuthService {
  login(input: LoginInputDTO): Promise<LoginOutputDTO>;
  refresh(input: RefreshInputDTO): Promise<RefreshOutputDTO>;
  validateAccessToken(token: string): Promise<ValidatedUserDTO>;
}

B. DTO Definitions
Each contract must include DTOs for:

input

output

internal normalized shapes

DTOs must be:

explicit

fully typed

never optional unless required

never contain provider-specific fields

C. Zod Schemas
Each contract must include Zod schemas for:

input validation

output validation

provider response normalization (if needed)

Schemas must match DTOs exactly.

D. Error Types
Each contract must define:

domain-specific error classes

error codes

error messages

mapping rules

Errors must follow the MeeoviError format.

E. Invariants
Each contract must define invariants such as:

fields that must never be null

required fields

normalization rules

security constraints

Example:

Code
- Access tokens must always be strings.
- User IDs must always be UUIDs.
- Search results must always include pagination metadata.
2. CAPABILITIES (packages/capabilities)
Capabilities implement business logic.
They sit between the Gateway API and Adapters.

Capabilities must:

validate input

enforce invariants

apply business rules

call adapters

normalize output

sanitize errors

enforce ACLs

apply rate limits, timeouts, and safety rules

Capabilities must never contain provider-specific logic.

2.1 What Every Capability Must Include
A. Implementation of Contract Interface
Each capability must implement the interface defined in /contracts.

Example:

ts
export class AuthServiceImpl implements AuthService {
  constructor(private adapter: AuthAdapter) {}
}
B. Input Validation
Every public method must validate input using Zod schemas from /contracts.

Example:

ts
const parsed = LoginInputSchema.parse(input);
Capabilities must never trust raw input.

C. Business Logic
Capabilities must contain:

ACL checks

rate limiting

pagination rules

search sanitization

token lifecycle rules

domain-specific logic

Capabilities must not:

call databases directly

call providers directly

bypass adapters

D. Adapter Calls
Capabilities must call adapters through their interfaces only.

Example:

ts
const providerResult = await this.adapter.login(parsed);
Capabilities must wrap adapter errors in MeeoviError.

E. Output Normalization
Capabilities must:

convert provider responses into DTOs

enforce invariants

remove null/undefined fields

ensure consistent shapes

F. Error Normalization
Capabilities must:

catch all errors

map them to MeeoviError

never leak provider-specific messages

never expose stack traces

G. Logging & Metrics
Capabilities must log:

correlation ID

method name

provider used

latency

success/failure

Capabilities must emit metrics for:

throughput

latency

error rate

H. Security Enforcement
Capabilities must enforce:

ACLs

token validation

search query sanitization

pagination limits

rate limits

timeout rules

Adapters must not enforce these rules.

I. No Forbidden Patterns
Capabilities must never:

contain provider logic

bypass validation

bypass adapters

modify DTOs

change contract interfaces

return raw provider responses

3. AI Behavior Rules
AI must:

follow this file exactly

follow .meeovi-architecture.md

follow .ai-guidelines.md

follow .invariants.md

never invent new patterns

never modify public interfaces

never skip validation

never add business logic to adapters

If AI is unsure, it must ask for clarification.

This file defines the required structure and content for all Contracts and Capabilities in Meeovi.

Code

---

If you want, I can also generate:

### ✔ A matching **adapter‑generation guidelines file**  
### ✔ A **capability‑layer testing checklist**  
### ✔ A **contracts folder with empty files**  
### ✔ A **full starter‑template** with all folders + boilerplate  

Just tell me what you want next.