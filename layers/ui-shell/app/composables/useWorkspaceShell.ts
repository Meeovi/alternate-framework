import { computed } from 'vue'
import { useTheme } from 'vuetify'

// State and theme for the `workspace` layout (the Berry admin chrome used by
// apps/ecosystem/meeovi-workspace). Replaces the template's pinia
// `customizer` store so the layer doesn't need pinia.

export const WORKSPACE_THEME = 'workspace'

export function useWorkspaceCustomizer() {
  // Open by default; VerticalSidebar renders SSR as desktop and only applies
  // its `lg` mobile breakpoint after mount, so on small screens Vuetify flips
  // the drawer to temporary and closes it.
  const sidebarDrawer = useState('workspace:sidebar-drawer', () => true)
  const customizerDrawer = useState('workspace:customizer-drawer', () => false)
  const miniSidebar = useState('workspace:mini-sidebar', () => false)
  const fontTheme = useState('workspace:font-theme', () => 'Roboto')
  const inputBg = useState('workspace:input-bg', () => false)

  return { sidebarDrawer, customizerDrawer, miniSidebar, fontTheme, inputBg }
}

// ui-shell's vuetify plugin only defines `light`/`dark`; add Berry's palette
// as its own theme so other apps are untouched. Vuetify merges it over
// `light`, so only Berry's colours/variables need listing.
export function useWorkspaceTheme() {
  const theme = useTheme()
  if (!theme.themes.value[WORKSPACE_THEME]) {
    theme.themes.value[WORKSPACE_THEME] = {
      dark: false,
      variables: {
        'border-color': '#1e88e5',
        'carousel-control-size': 10,
      },
      colors: {
        primary: '#1e88e5',
        secondary: '#5e35b1',
        info: '#03c9d7',
        success: '#00c853',
        accent: '#FFAB91',
        warning: '#ffc107',
        error: '#f44336',
        lightprimary: '#eef2f6',
        lightsecondary: '#ede7f6',
        lightsuccess: '#b9f6ca',
        lighterror: '#f9d8d8',
        lightwarning: '#fff8e1',
        darkText: '#212121',
        lightText: '#616161',
        darkprimary: '#1565c0',
        darksecondary: '#4527a0',
        borderLight: '#d0d0d0',
        inputBorder: '#787878',
        containerBg: '#eef2f6',
        surface: '#fff',
        'on-surface-variant': '#fff',
        facebook: '#4267b2',
        twitter: '#1da1f2',
        linkedin: '#0e76a8',
        gray100: '#fafafa',
        primary200: '#90caf9',
        secondary200: '#b39ddb',
      },
    } as any
  }
  return WORKSPACE_THEME
}

// Sidebar entry for the workspace layout's VerticalSidebar.
export interface WorkspaceMenu {
  header?: string
  title?: string
  /** Vuetify icon string, e.g. 'fas fa-gauge' */
  icon?: string
  to?: string
  divider?: boolean
  chip?: string
  chipColor?: string
  chipVariant?: 'flat' | 'text' | 'elevated' | 'tonal' | 'outlined' | 'plain'
  chipIcon?: string
  children?: WorkspaceMenu[]
  disabled?: boolean
  type?: 'external'
  subCaption?: string
}

// The bits of the better-auth session user the workspace header shows.
export interface WorkspaceUser {
  id?: string
  name?: string
  username?: string
  email?: string
  image?: string
}

/**
 * Signed-in user for the workspace header, via a relative request-aware fetch
 * (forwards the cookie on SSR) — the same approach as layers/auth's route
 * middleware. Call it from the layout, not from a component inside <v-app>:
 * a pending useAsyncData defers that component's SSR render past its
 * siblings, so Vuetify layout items inside it (app bar, drawer) register too
 * late and <v-main> is rendered without their offsets.
 */
export function useWorkspaceSession() {
  const { data } = useAsyncData('workspace:session', () =>
    useRequestFetch()<{ user?: WorkspaceUser } | null>('/api/auth/get-session').catch(() => null)
  )
  return computed(() => data.value?.user ?? null)
}
