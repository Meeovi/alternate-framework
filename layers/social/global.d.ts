// Layer-local global declarations that reference the canonical auto-import
// shims living in `@mframework/core`. This makes the shims visible to the
// `layers/social` TypeScript project without changing its tsconfig.
/// <reference path="../../packages/modules/core/src/shared-shims.d.ts" />
/// <reference path="../../packages/modules/core/src/auto-imports-shims.d.ts" />

export {}
