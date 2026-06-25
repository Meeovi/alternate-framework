import DOMPurify from 'dompurify'

export function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
}

export function sanitizeGrapesJson(data: any) {
  return JSON.parse(JSON.stringify(data))
}

export function sanitizeRichTextProps(project: any) {
  try {
    const pages = project.pages || []
    for (const page of pages) {
      const frames = page.frames || []
      for (const frame of frames) {
        const components = frame.components || []
        for (const cmp of components) {
          const attrs = cmp.attributes || cmp.props || {}
          if (typeof attrs.html === 'string') {
            attrs.html = sanitizeHtml(attrs.html)
          }
        }
      }
    }
  } catch {
    // fail‑safe: ignore but don’t crash
  }
  return project
}
