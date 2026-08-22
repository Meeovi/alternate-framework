declare module "#app" {
  interface NuxtApp {
    $socket: ReturnType<typeof import("socket.io-client").io>
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $socket: ReturnType<typeof import("socket.io-client").io>
  }
}

// Without a real top-level import/export, this file is a global ambient
// script rather than a module — TypeScript then treats the `declare
// module "vue" { ... }` block above as fully redeclaring 'vue' rather than
// safely augmenting it, which drops every real export (ref, computed,
// onMounted, ...) from 'vue' project-wide wherever this file gets
// included. `export {}` forces module mode so the augmentation merges
// instead of replacing.
export {}
