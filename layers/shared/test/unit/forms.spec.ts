import { describe, it, expect } from 'vitest'
import { transformSchema } from '../../app/utils/forms'

describe('transformSchema', () => {
  it('wraps each Directus form field as a FormKit $cmp node', () => {
    const [node] = transformSchema([{ field: 'email', name: 'email', width: '50' }])
    expect(node.$cmp).toBe('FormKit')
    expect(node.props.id).toBe('email')
  })

  it('uses the field\'s own $el as the component when present', () => {
    const [node] = transformSchema([{ field: 'divider', name: 'divider', $el: 'hr' }])
    expect(node.$cmp).toBe('hr')
  })

  it('maps Directus field widths to Tailwind column-span classes', () => {
    const widths: Record<string, string> = { '33': 'md:col-span-2', '50': 'md:col-span-3', '67': 'md:col-span-4', '100': 'md:col-span-6' }
    for (const [width, expected] of Object.entries(widths)) {
      const [node] = transformSchema([{ field: 'f', name: 'f', width }])
      expect(node.props.outerClass).toBe(expected)
    }
  })

  it('defaults to full width when no width is specified', () => {
    const [node] = transformSchema([{ field: 'f', name: 'f' }])
    expect(node.props.outerClass).toBe('md:col-span-6')
  })

  it('passes children through unchanged', () => {
    const children = [{ field: 'child' }]
    const [node] = transformSchema([{ field: 'parent', name: 'parent', children }])
    expect(node.children).toBe(children)
  })
})
