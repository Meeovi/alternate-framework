export default function useLocalePath() {
  // Minimal shim for auth pages; returns identity path.
  return (to?: string) => (to ?? '/')
}
