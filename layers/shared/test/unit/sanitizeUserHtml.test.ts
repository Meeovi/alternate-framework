import { describe, expect, test } from 'vitest'
import { sanitizeUserHtml } from '../../app/utils/sanitizeUserHtml'

const clean = (html: string) => sanitizeUserHtml(html)
// No executable bit survives in any *real* tag (escaped text like
// `&lt;svg onload=…&gt;` is inert — the browser shows it as text).
const inert = (out: string) => (out.match(/<[a-z][^>]*>/gi) ?? []).every((tag) =>
  !/^<(script|svg|math|object|embed|form|style)\b|\son[a-z]+\s*=|javascript:|data:text\/html|srcdoc/i.test(tag))

describe('sanitizeUserHtml', () => {
  test.each([
    '<img src=x onerror=alert(1)>',
    '<img src="x" onerror="alert(1)">',
    '<a href="javascript:alert(1)">x</a>',
    '<a href="  JaVaScRiPt:alert(1)">x</a>',
    '<a href="&#106;avascript:alert(1)">x</a>',
    '<svg onload=alert(1)><circle/></svg>',
    '<script>alert(1)</script>',
    '<scr<script>ipt>alert(1)</script>',
    '<iframe src="javascript:alert(1)"></iframe>',
    '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
    '<iframe src="https://evil.example/x"></iframe>',
    '<object data="x.swf"></object>',
    '<form action="https://evil.example"><input name=p></form>',
    '<div style="background:url(javascript:alert(1))">x</div>',
    '<math><mi xlink:href="javascript:alert(1)">x</mi></math>',
    '<details open ontoggle=alert(1)>',
    '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">x</a>',
  ])('neutralises %s', (html) => {
    expect(inert(clean(html))).toBe(true)
  })

  test('keeps ordinary CMS formatting', () => {
    const html = '<section id="about" class="cid-x"><h2 class="title">Hi</h2>'
      + '<p class="mbr-text">Text <strong>bold</strong> <a href="https://meeovi.com/a" class="link">link</a></p>'
      + '<ol start="3" type="a"><li style="list-style-type: disc">one</li></ol>'
      + '<img src="https://app.pixanomy.com/s/x/download" alt="pic"></section>'
    const out = clean(html)
    for (const kept of ['<section id="about" class="cid-x">', '<h2 class="title">', '<strong>bold</strong>',
      'href="https://meeovi.com/a"', 'start="3"', 'alt="pic"', 'src="https://app.pixanomy.com/s/x/download"']) {
      expect(out).toContain(kept)
    }
  })

  test('allows embeds only from known hosts, over https', () => {
    expect(clean('<iframe src="https://www.meteoblue.com/en/weather/widget"></iframe>')).toContain('src="https://www.meteoblue.com/')
    expect(clean('<iframe src="https://www.youtube.com/embed/abc"></iframe>')).toContain('src="https://www.youtube.com/embed/abc"')
    expect(clean('<iframe src="http://www.youtube.com/embed/abc"></iframe>')).not.toContain('src=')
    expect(clean('<iframe src="https://youtube.com.evil.example/x"></iframe>')).not.toContain('src=')
  })

  test('new-tab links cannot reach window.opener', () => {
    expect(clean('<a href="https://x.example" target="_blank">x</a>')).toContain('rel="noopener noreferrer"')
  })

  test('handles empty values', () => {
    expect(clean(null as unknown as string)).toBe('')
    expect(sanitizeUserHtml(undefined)).toBe('')
  })
})
