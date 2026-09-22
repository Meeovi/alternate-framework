## Vibe coding security cheat sheet
The checklist below focuses on practical, runtime-focused checks that can be applied regardless of the language, framework, or AI coding tool used.

## Authentication and access control
Authentication failures remain one of the most common and impactful issues in AI-generated applications. Main things to check for:
Enforce authentication before any sensitive application logic executes.
Ensure unauthenticated requests cannot reach backend endpoints directly.
Validate authentication behavior at runtime, not just in generated code.
Test for exposed or forgotten endpoints that bypass login flows.

## Authorization and data access
Authorization logic is especially vulnerable to hallucinations and partial implementations. To prevent unauthorized access and data exposure:
Verify role-based access control for every endpoint.
Test for broken object-level authorization (BOLA).
Confirm users cannot access peer or administrative data.
Validate authorization consistently across APIs and internal services.
Endpoint and API exposure
Vibe coding makes it easy to (intentionally or not) create, modify, and abandon features, including API endpoints. To mitigate this:
Inventory all active endpoints and APIs.
Identify undocumented, legacy, or prompt-generated endpoints.
Test APIs independently of UI logic.
Ensure that removed UI features do not leave active endpoints behind.

## Injection and code execution risks
User input handling is a risk point in any app, but with vibe coding, it should be treated as suspicious by default. To minimize injection risk:

Test for SQL injection and ORM misuse.
Validate protection against OS command injection.
Identify paths that could lead to remote code execution.
Assume all AI-generated input validation is incomplete until proven otherwise.

## Secrets and sensitive data
Invicti research into vibe-coded applications shows that secrets reuse and leakage is a recurring and systemic issue, not an anomaly. To avoid data exposure and authentication failures:

Check your code for common shared secrets, as identified by Invicti research.
Scan for exposed API keys, tokens, and credentials.
Ensure secrets are never returned in application responses.
Validate that server-side keys cannot reach the frontend.
Test third-party integrations for unintended data leakage.

## Third-party dependencies
AI coding tools frequently introduce libraries without explaining why they were chosen. To minimize risk from those external dependencies:

Identify all libraries and frameworks added by AI prompts.
Monitor dependencies for known vulnerabilities.
Validate the runtime behavior of third-party code.
Avoid assuming that popular libraries are secure by default.

## Transport and configuration security
Misconfigurations are easy to introduce when environments are spun up quickly and code is created without operational context. To minimize operational risks:

Enforce HTTPS across all application components.
Validate security headers.
Ensure no debug or development settings are exposed.
Confirm that environment-specific configurations are correctly applied.
Runtime behavior validation
Unexpected inputs and error conditions often reveal the most serious issues, especially for AI-generated code that’s more likely to be inconsistent across data flows. To cut down on runtime security gaps:

Check at least every deployable build using a DAST scanner.
Test application behavior under malformed or unexpected input.
Validate that error handling does not expose sensitive data.
Confirm logs do not leak secrets, tokens, or internal details.

## Continuous testing and change management
With vibe coding, every subsequent prompt can materially change the application compared to the previous build. To maintain security coverage:

Re-test applications after every AI-generated change.
Integrate security testing into CI/CD pipelines.
Treat every deployment as a new risk event.
Don’t rely on point-in-time security reviews that assume stability.