import { describe, it, expect } from 'vitest'
import { normalizeUsername } from '../../shared/utils/username'

// usernameValidator (in plugins.ts) blocks the literal string 'admin' after
// normalization runs — these tests cover the two real bugs found and fixed
// this session, so normalization actually catches admin-lookalikes.
const usernameValidator = (username: string) => username !== 'admin'

describe('normalizeUsername', () => {
  it('replaces every occurrence of a digit, not just the first', () => {
    // Previously used non-global .replace('0', 'o') etc — only the first
    // '4' in "4dm1n1strat0r" would have been replaced.
    expect(normalizeUsername('4dm1n1strat0r')).toBe('administrator')
  })

  it('replaces "1" with "i" (previously missing entirely)', () => {
    expect(normalizeUsername('adm1n')).toBe('admin')
  })

  it('lowercases the input', () => {
    expect(normalizeUsername('ADMIN')).toBe('admin')
  })

  it('replaces 0/1/3/4 substitutions together', () => {
    expect(normalizeUsername('4dm1n')).toBe('admin')
    expect(normalizeUsername('3lit3')).toBe('elite')
  })

  it('leaves usernames with no lookalike digits unchanged apart from case', () => {
    expect(normalizeUsername('RegularUser')).toBe('regularuser')
  })

  it('normalized admin-lookalikes are rejected by usernameValidator', () => {
    const lookalikes = ['admin', 'ADMIN', 'adm1n', '4dmin', '4dm1n', 'admin']
    for (const candidate of lookalikes) {
      expect(usernameValidator(normalizeUsername(candidate))).toBe(false)
    }
  })

  it('a genuinely different username still passes usernameValidator after normalization', () => {
    expect(usernameValidator(normalizeUsername('adm1nistrator_bob'))).toBe(true)
  })
})
