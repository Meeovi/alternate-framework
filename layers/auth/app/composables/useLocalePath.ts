export default function useLocalePath() {
  // Minimal framework-agnostic shim for `useLocalePath`.
  // Returns an identity function for paths. Consumers can provide
  // a runtime adapter if they need locale-aware routing.
  return (to?: string) => (to ?? '/')
}
