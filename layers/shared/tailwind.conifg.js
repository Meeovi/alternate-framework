/** @type {import('tailwindcss').Config} */
export default {
  content: [], // Nuxt will inject its own paths

  theme: {
    extend: {
      colors: {
        primary: 'var(--m-primary)',
        secondary: 'var(--m-secondary)',
        accent: 'var(--m-accent)',
        muted: 'var(--m-muted)',
        surface: 'var(--m-surface)',
        border: 'var(--m-border)'
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif']
      },

      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px'
      },

      spacing: {
        '1/2': '50%',
        'full': '100%'
      },

      boxShadow: {
        soft: '0 2px 8px rgba(0,0,0,0.06)',
        medium: '0 4px 16px rgba(0,0,0,0.08)',
        strong: '0 8px 24px rgba(0,0,0,0.12)'
      }
    }
  },

  plugins: []
}