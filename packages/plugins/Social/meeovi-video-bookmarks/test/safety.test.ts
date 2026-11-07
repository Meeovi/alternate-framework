import { describe, expect, it } from 'vitest'
import { checkUrl, isAdultHost, isAdultText, normalize } from '../runtime/server/safety'

describe('normalize', () => {
  it('undoes accents, look-alikes and spaced-out letters', () => {
    expect(normalize('Pörn  V1DEOS!')).toBe('porn videos')
    expect(normalize('p.o.r.n and n-s-f-w')).toBe('porn and nsfw')
    expect(normalize('S3X T4PE')).toBe('sex tape')
  })
})

describe('isAdultText', () => {
  it.each([
    'Best porn compilation', 'P0RNHUB clip', 'hentai episode 3', 'NSFW!!', 'n s f w version', 'my OnlyFans preview',
    'sex tape leaked', 'Nude beach day', 'erotic dance', 'XXX', '18+ only', 'Strictly +18 content', 'webcam girl live',
    'uncensored version', 'milf', 'r u l e 3 4',
  ])('refuses %j', (text) => expect(isAdultText(text)).toBe(true))

  it.each([
    'Sussex vs Essex cricket highlights', 'Data analysis in Python', 'Scunthorpe United goals', 'Graduated cum laude',
    'Ford Escort restoration', 'Blue tits at the bird feeder', 'Nude lipstick tutorial', 'The Naked Gun trailer',
    'Naked mole rats documentary', 'Pronunciation guide', 'Apron sewing tutorial', 'Jerome Powell press conference',
    'Motherless Brooklyn review', 'Top 10 ornaments', 'Sexual health education for teens', 'Me at the zoo', '2024 recap 1080p',
  ])('allows %j', (text) => expect(isAdultText(text)).toBe(false))

  it('takes extra terms from the site', () => {
    expect(isAdultText('a spicy clip', { terms: ['spicy'] })).toBe(true)
    expect(isAdultText('a mild clip', { terms: ['spicy'] })).toBe(false)
  })
})

describe('isAdultHost', () => {
  it.each(['pornhub.com', 'www.xvideos.com', 'sexcams.example', 'free-xxx-videos.net', 'anything.xxx', 'example.porn', 'motherless.com', 'm.erome.com', 'nsfw.tube'])(
    'refuses %s', (host) => expect(isAdultHost(host)).toBe(true))
  it.each(['youtube.com', 'essex.ac.uk', 'framatube.org', 'peertube.example.org', 'sussexcricket.co.uk', 'vimeo.com'])(
    'allows %s', (host) => expect(isAdultHost(host)).toBe(false))
  it('takes extra hosts, with their subdomains', () => {
    expect(isAdultHost('videos.bad.example', { hosts: ['bad.example'] })).toBe(true)
  })
})

describe('checkUrl', () => {
  it('reads the address path too', () => {
    expect(checkUrl(new URL('https://example.org/w/abc?title=hot-porn-clip')).ok).toBe(false)
    expect(checkUrl(new URL('https://www.youtube.com/watch?v=jNQXAC9IVRw')).ok).toBe(true)
  })
})
