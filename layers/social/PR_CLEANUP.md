**Build Status**: ✅ Full production `npx nuxt build` completed successfully with PWA enabled.

**Overview**
- **Purpose**: list temporary stubs/placeholders added to unblock builds and recommended actions before merging.

**Temporary Files & Stubs**
- **`layers/social/app/composables/useAuth.ts`**: temporary auth shim — Replace with real auth composable that integrates app auth and session handling. See [layers/social/app/composables/useAuth.ts](layers/social/app/composables/useAuth.ts#L1)
- **`layers/social/app/composables/useLocalePath.ts`**: locale path resolver stub — Replace with proper locale routing logic. See [layers/social/app/composables/useLocalePath.ts](layers/social/app/composables/useLocalePath.ts#L1)
- **`layers/social/app/composables/media/useVideojs.ts`**: video.js shim — Restore real `useVideojs` implementation and add runtime dependency handling if needed. See [layers/social/app/composables/media/useVideojs.ts](layers/social/app/composables/media/useVideojs.ts#L1)
- **`layers/social/app/components/list/AccountSearchResult.vue`**: placeholder component — Implement a proper search result UI or remove if unused. See [layers/social/app/components/list/AccountSearchResult.vue](layers/social/app/components/list/AccountSearchResult.vue#L1)
- **Placeholder images**:
  - **`layers/social/app/assets/images/mbr-1920x1893.png`** — Replace with production artwork. See [layers/social/app/assets/images/mbr-1920x1893.png](layers/social/app/assets/images/mbr-1920x1893.png#L1)
  - **`layers/lists/app/assets/images/layers.png`**, **`layers/lists/app/assets/images/layers-2x.png`**, **`layers/lists/app/assets/images/marker-icon.png`** — Replace with final assets or update CSS referencing them. See [layers/lists/app/assets/images](layers/lists/app/assets/images)
- **`packages/modules/core/dist/index.js`**: temporary placeholder `module.exports = {}` — Produce and commit a real `dist` build for this package or adjust imports to use source or published package. See [packages/modules/core/dist/index.js](packages/modules/core/dist/index.js#L1)

**Code Fixes Applied During Unblocking (already committed)**
- Closed unbalanced Vue template tags in multiple components (e.g. `SettingsFontSize.vue`, `SettingsProfileMetadata.vue`, `CommonCheckbox.vue`, `CommonRadio.vue`, `PublishLanguagePicker.vue`).
- Hardened `layers/social/scripts/prepare.ts` to resolve hoisted packages and avoid ENOENT during install.
- Copied real locale JSONs into `layers/social/locales` to satisfy PWA manifest i18n generation.

**Known Remaining Items / Risks**
- PWA manifest localization: verify all locale `pwa` entries are complete (icons, name, short_name, screenshots) to avoid runtime fallbacks.
- Replace the temporary auth and video shims to restore full runtime features and remove potential security/logic gaps.
- Replace placeholder images with real assets and verify responsive images and webmanifest screenshots.
- Ensure `packages/modules/core` is built/published so server-side imports don't rely on placeholders.

**Suggested PR/Commit Title**
- chore(social): unblock build — add temporary shims & placeholders + build fixes

**Suggested Next Steps**
- Replace each stub above progressively and verify `npx nuxt build` after each replacement.
- Run full integration preview: `node .output/server/index.mjs` and manually smoke-test core flows (auth, media playback, PWA install).
- Once real implementations are restored, remove placeholders and update this doc before merging.

**Contact / Notes**
- If you want, I can: open a branch, commit these cleanup notes, and optionally create a PR with the current changes.
