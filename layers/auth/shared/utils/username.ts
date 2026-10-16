// Shared by the username() plugin config (plugins.ts), the registration form
// and the server's emailAndPassword config, so client and server agree.
export const MIN_USERNAME_LENGTH = 3
export const MAX_USERNAME_LENGTH = 100
export const MIN_PASSWORD_LENGTH = 8
export const USERNAME_PATTERN = /^[a-z0-9_.]+$/i

// Extracted from the username() plugin config in plugins.ts so it's
// independently testable. Previously used non-global String.replace() calls
// (e.g. .replace('0', 'o')) which only replaced the FIRST digit occurrence
// per call, and never covered '1' at all — letting admin-lookalike usernames
// like "adm1n" slip past usernameValidator's block on the literal 'admin'.
//
// This folds lookalike digits for the 'admin' CHECK only — it must not be
// used as the plugin's usernameNormalization, which rewrites the username
// that gets stored and looked up (a sign-up as "max2024" was saved as
// "max2o2a", and signing in as "test1" searched for "testi").
export function normalizeUsername(username: string): string {
  return username
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
}

/** What a username is stored and looked up as. */
export function storedUsername(username: string): string {
  return username.toLowerCase()
}

/** Allowed characters, and not 'admin' or a lookalike of it ("adm1n", "4dm1n"). */
export function isAllowedUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username) && normalizeUsername(username) !== 'admin'
}
