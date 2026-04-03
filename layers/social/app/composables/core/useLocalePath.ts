export default function useLocalePath() {
  // Minimal shim for social pages; returns identity path.
  return (to?: string) => (to ?? '/')
}
