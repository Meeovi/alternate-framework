import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseCurrentEvents, portalTitle, renderInline } from '../runtime/parse'

const day = readFileSync(new URL('./fixtures/2026_October_28.wikitext', import.meta.url), 'utf8')

describe('Current events parsing', () => {
  const items = parseCurrentEvents(day, '2026-10-28')

  it('finds every event on the day, in its section', () => {
    expect(items).toHaveLength(14)
    expect(new Set(items.map((i) => i.category))).toEqual(new Set([
      'Armed conflicts and attacks', 'Business and economy', 'Disasters and accidents',
      'International relations', 'Law and crime', 'Politics and elections', 'Sports',
    ]))
  })

  it('titles an event with its nearest topic, and keeps its sources', () => {
    const train = items.find((i) => i.title === '2026 Toledo train collision')!
    expect(train.text).toMatch(/^At least 68 people are killed/)
    expect(train.sources).toEqual([expect.objectContaining({ name: 'Sky News', url: expect.stringMatching(/^https:\/\/news\.sky\.com\//) })])
    expect(train.html).toContain('<a href="https://en.wikipedia.org/wiki/Province_of_Toledo"')
    expect(train.topicArticles).toEqual(['2026 Toledo train collision'])
  })

  it('treats a sourceless line with events under it as a topic', () => {
    const brazil = items.filter((i) => i.title === 'Aftermath of the 2026 Brazilian general election')
    expect(brazil).toHaveLength(2)
    expect(brazil.every((i) => i.sources.length > 0)).toBe(true)
  })

  it('titles an event without a topic from its own sentence, cut at a word', () => {
    const robinson = items.find((i) => i.text.startsWith('British far-right activist'))!
    expect(robinson.topics).toEqual([])
    expect(robinson.title.length).toBeLessThanOrEqual(90)
    expect(robinson.title.endsWith('…')).toBe(true)
  })

  it('drops italics, references and comments, and escapes text', () => {
    expect(renderInline("''Sudan Tribune'' <b>&</b> [[A|B]]").html).toBe('Sudan Tribune &lt;b&gt;&amp;&lt;/b&gt; <a href="https://en.wikipedia.org/wiki/A" target="_blank" rel="noopener">B</a>')
    const [only] = parseCurrentEvents("'''Sports'''\n*Team wins.<ref>x</ref><!-- note --> [https://example.com/a (Ex)]", '2026-01-01')
    expect(only).toMatchObject({ text: 'Team wins.', sources: [{ url: 'https://example.com/a', name: 'Ex' }] })
  })

  it('names the portal page for a day (in UTC)', () => {
    expect(portalTitle(new Date('2026-10-28T23:30:00Z'))).toBe('Portal:Current_events/2026_October_28')
  })
})
