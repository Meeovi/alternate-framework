import { beforeEach, describe, expect, it, vi } from 'vitest'

// Directus in memory: readItems()/createItem()/… become plain commands
// the fake client answers from these rows.
let tables: Record<string, Record<string, any>[]>
let nextId = 1
let clock = 0
vi.stubGlobal('createError', (e: { statusCode: number, statusMessage: string }) => Object.assign(new Error(e.statusMessage), e))
vi.useFakeTimers()

const matches = (row: Record<string, any>, filter: Record<string, any> = {}) =>
  Object.entries(filter).every(([field, cond]) => String(row[field]) === String((cond as any)._eq))

vi.mock('@directus/sdk', () => ({
  createDirectus: () => ({
    with() { return this },
    request: async (cmd: any) => {
      const rows = (tables[cmd.collection] ??= [])
      if (cmd.op === 'read') {
        let out = rows.filter((r) => matches(r, cmd.query.filter))
        if (cmd.query.sort?.[0] === '-played_at') out = [...out].sort((a, b) => b.played_at.localeCompare(a.played_at))
        out = out.slice(cmd.query.offset ?? 0)
        if (cmd.query.limit > 0) out = out.slice(0, cmd.query.limit)
        return out
      }
      if (cmd.op === 'create') { rows.push({ id: nextId++, ...cmd.data }); return null }
      if (cmd.op === 'update') { Object.assign(rows.find((r) => r.id === cmd.key)!, cmd.data); return null }
      if (cmd.op === 'delete') { tables[cmd.collection] = rows.filter((r) => !cmd.keys.includes(r.id)); return null }
    },
  }),
  rest: () => ({}),
  staticToken: () => ({}),
  readItems: (collection: string, query: any) => ({ op: 'read', collection, query }),
  createItem: (collection: string, data: any) => ({ op: 'create', collection, data }),
  updateItem: (collection: string, key: any, data: any) => ({ op: 'update', collection, key, data }),
  deleteItems: (collection: string, keys: any[]) => ({ op: 'delete', collection, keys }),
}))

const { KEEP, forgetPlay, historyIds, readItemId, readKind, recordPlay } = await import('../../server/utils/playHistory')

const play = async (user: string, kind: 'watch' | 'listen', id: string) => {
  vi.setSystemTime(new Date(Date.UTC(2026, 9, 26, 12, 0, clock++)))
  await recordPlay(user, kind, id)
}

beforeEach(() => {
  nextId = 1
  clock = 0
  tables = {
    shorts: Array.from({ length: 60 }, (_, i) => ({ id: i + 1 })),
    radios: [{ id: 7 }],
    play_history: [],
  }
})

describe('input', () => {
  it('accepts only watch and listen, and plain ids', () => {
    expect(readKind('watch')).toBe('watch')
    expect(() => readKind('read')).toThrow('kind must be watch or listen')
    expect(readItemId(46)).toBe('46')
    expect(() => readItemId('../x')).toThrow('Invalid item id')
  })
})

describe('recordPlay', () => {
  it('puts the latest play first, and a replay moves an item instead of adding a row', async () => {
    await play('ann', 'watch', '1')
    await play('ann', 'watch', '2')
    await play('ann', 'watch', '1')
    expect(await historyIds('ann', 'watch')).toEqual(['1', '2'])
    expect(tables.play_history).toHaveLength(2)
  })

  it(`keeps only the newest ${KEEP} per kind`, async () => {
    for (let i = 1; i <= KEEP + 3; i++) await play('ann', 'watch', String(i))
    expect(tables.play_history).toHaveLength(KEEP)
    expect((await historyIds('ann', 'watch', 100)).at(-1)).toBe('4')
  })

  it('refuses an item that does not exist', async () => {
    await expect(recordPlay('ann', 'listen', '999')).rejects.toMatchObject({ statusCode: 404 })
    expect(tables.play_history).toHaveLength(0)
  })

  it("keeps each user's and each kind's history apart", async () => {
    await play('ann', 'watch', '1')
    await play('bob', 'watch', '2')
    await play('ann', 'listen', '7')
    expect(await historyIds('ann', 'watch')).toEqual(['1'])
    expect(await historyIds('ann', 'listen')).toEqual(['7'])
    expect(await historyIds('bob', 'watch')).toEqual(['2'])
  })
})

describe('forgetPlay', () => {
  it("removes one item from that user's history only", async () => {
    await play('ann', 'watch', '1')
    await play('bob', 'watch', '1')
    await forgetPlay('ann', 'watch', '1')
    expect(await historyIds('ann', 'watch')).toEqual([])
    expect(await historyIds('bob', 'watch')).toEqual(['1'])
  })
})
