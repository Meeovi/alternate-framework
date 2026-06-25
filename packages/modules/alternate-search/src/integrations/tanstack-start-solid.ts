// ---------------------------------------------------------------------------
// TanStack Start + SolidJS integration for alternate-search
// ---------------------------------------------------------------------------
//
// Create an API route at:
//   app/routes/api/search.$index.ts
//
// Usage:
//   import { createAPIFileRoute } from "@tanstack/solid-start/api";
//   import { search } from "~/lib/server/search";
//   import { toTanStackSolidHandler } from "alternate-search/integrations/tanstack-start-solid";
//
//   const { GET, POST, DELETE, OPTIONS } = toTanStackSolidHandler(search);
//
//   export const Route = createAPIFileRoute("/api/search/$index")({
//     GET, POST, DELETE, OPTIONS,
//   });
//
// The server-side API surface is identical to the React variant — both
// @tanstack/react-start and @tanstack/solid-start use Web-standard
// Request / Response for their API routes.  This module re-exports
// `toTanStackHandler` under the Solid-specific name so that imports stay
// semantically clear in Solid projects.
// ---------------------------------------------------------------------------

export {
  toTanStackHandler as toTanStackSolidHandler,
} from "./tanstack-start";

export type {
  SearchTanStackHandlerOptions as SearchTanStackSolidHandlerOptions,
} from "./tanstack-start";
