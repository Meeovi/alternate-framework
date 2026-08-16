// Extracted from the username() plugin config in plugins.ts so it's
// independently testable. Previously used non-global String.replace() calls
// (e.g. .replace('0', 'o')) which only replaced the FIRST digit occurrence
// per call, and never covered '1' at all — letting admin-lookalike usernames
// like "adm1n" slip past usernameValidator's block on the literal 'admin'.
export function normalizeUsername(username: string): string {
  return username
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
}
