import { describe, it, expect } from 'vitest'
import {
  stripHTML,
  truncateHTML,
  truncateString,
  maybePluralize,
  toTitleCase,
  snakeToCamel,
  snakeToKebab,
  convertIconName,
  slugify,
  deslugify,
  getDomainNameFromEmail,
  calculateReadTime,
} from '../../app/utils/strings'

describe('stripHTML', () => {
  it('removes tags but keeps text content', () => {
    expect(stripHTML('<p>Hello <strong>world</strong></p>')).toBe('Hello world')
  })

  it('returns undefined for undefined input', () => {
    expect(stripHTML(undefined)).toBeUndefined()
  })
})

describe('truncateString', () => {
  it('leaves short strings untouched', () => {
    expect(truncateString('hi', 10)).toBe('hi')
  })

  it('truncates and appends an ellipsis when over length', () => {
    expect(truncateString('hello world', 5)).toBe('hello...')
  })
})

describe('truncateHTML', () => {
  it('strips tags before truncating', () => {
    expect(truncateHTML('<p>hello world</p>', 5)).toBe('hello...')
  })
})

describe('maybePluralize', () => {
  it('does not pluralize a count of exactly 1', () => {
    expect(maybePluralize(1, 'item')).toBe('item')
  })

  it('pluralizes any other count', () => {
    expect(maybePluralize(0, 'item')).toBe('items')
    expect(maybePluralize(2, 'item')).toBe('items')
  })

  it('supports a custom suffix', () => {
    expect(maybePluralize(2, 'box', 'es')).toBe('boxes')
  })
})

describe('toTitleCase', () => {
  it('capitalizes the first letter of each word', () => {
    expect(toTitleCase('hello world')).toBe('Hello World')
  })
})

describe('snakeToCamel', () => {
  it('converts snake_case to camelCase', () => {
    expect(snakeToCamel('account_circle_icon')).toBe('accountCircleIcon')
  })
})

describe('snakeToKebab', () => {
  it('converts snake_case to kebab-case', () => {
    expect(snakeToKebab('account_circle_icon')).toBe('account-circle-icon')
  })
})

describe('convertIconName', () => {
  it('prefixes with material-symbols and converts snake_case to kebab-case', () => {
    expect(convertIconName('account_circle')).toBe('material-symbols:account-circle')
  })

  it('returns falsy for an empty name', () => {
    expect(convertIconName('')).toBeFalsy()
  })
})

describe('slugify', () => {
  it('lowercases, trims, and hyphenates spaces', () => {
    expect(slugify('  Hello World!  ')).toBe('hello-world')
  })
})

describe('deslugify', () => {
  it('converts hyphens/underscores to spaces and title-cases', () => {
    expect(deslugify('hello-world_example')).toBe('Hello World Example')
  })
})

describe('getDomainNameFromEmail', () => {
  it('extracts the domain label before the TLD', () => {
    expect(getDomainNameFromEmail('user@example.com')).toBe('example')
  })
})

describe('calculateReadTime', () => {
  it('strips HTML and estimates minutes at the given words-per-minute rate', () => {
    const words = new Array(200).fill('word').join(' ')
    expect(calculateReadTime(`<p>${words}</p>`, 200)).toBe('1 min read')
  })

  it('rounds up partial minutes', () => {
    const words = new Array(201).fill('word').join(' ')
    expect(calculateReadTime(words, 200)).toBe('2 min read')
  })
})
