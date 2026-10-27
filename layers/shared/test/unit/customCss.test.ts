import { describe, expect, it } from 'vitest'
import { MAX_CUSTOM_CSS, sanitizeCustomCss } from '../../shared/customCss'

describe('custom CSS', () => {
  it('passes ordinary CSS through unchanged', () => {
    const css = '.v-app-bar { background: #0b2a6f !important; }\n.btn::before { content: "\\201C" "\\"" ; background: url(/images/x.png) }'
    expect(sanitizeCustomCss(css)).toEqual({ css, refused: null })
  })

  it('treats empty or missing CSS as nothing', () => {
    expect(sanitizeCustomCss(null)).toEqual({ css: '', refused: null })
    expect(sanitizeCustomCss('   ')).toEqual({ css: '', refused: null })
  })

  it.each([
    ['@import url(https://evil.example/x.css);', '@import'],
    ['a { width: expression(alert(1)) }', 'expression()'],
    ['a { behavior: url(x.htc) }', 'behavior:'],
    ['a { -moz-binding: url(x.xml#xss) }', '-moz-binding'],
    ['a { background: url(javascript:alert(1)) }', 'script: URLs'],
    ['</style><script>alert(1)</script>', '<style>'],
  ])('refuses %s', (css, reason) => {
    expect(sanitizeCustomCss(css)).toEqual({ css: '', refused: `contains ${reason}` })
  })

  it('sees through escapes and comments', () => {
    expect(sanitizeCustomCss('a { width: \\65 xpression(alert(1)) }').refused).toBe('contains expression()')
    expect(sanitizeCustomCss('a { width: expr/**/ession(alert(1)) }').refused).toBe('contains expression()')
    expect(sanitizeCustomCss('a { background: url(java\\script:alert(1)) }').refused).toBe('contains script: URLs')
    expect(sanitizeCustomCss('@\\69 mport "x.css";').refused).toBe('contains @import')
  })

  it('refuses CSS that is too long', () => {
    expect(sanitizeCustomCss('a{}'.repeat(MAX_CUSTOM_CSS)).refused).toMatch(/longer than/)
  })
})
