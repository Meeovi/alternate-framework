import type { App, Plugin } from 'vue'
import * as storefrontExports from '@storefront-ui/vue'
import './styles.css'

export const storefrontRootClass = 'sfui'

export interface AlternateStorefrontUIOptions {
	prefix?: string
	include?: string[]
	exclude?: string[]
}

const storefrontComponents = Object.fromEntries(
	Object.entries(storefrontExports).filter(([name]) => name.startsWith('Sf')),
) as Record<string, unknown>

export function registerStorefrontUI(
	app: App,
	options: AlternateStorefrontUIOptions = {},
): void {
	const include = options.include ? new Set(options.include) : null
	const exclude = new Set(options.exclude ?? [])

	for (const [name, component] of Object.entries(storefrontComponents)) {
		if (include && !include.has(name)) {
			continue
		}

		if (exclude.has(name)) {
			continue
		}

		const componentName = options.prefix
			? `${options.prefix}${name.replace(/^Sf/, '')}`
			: name

		app.component(componentName, component as any)
	}
}

export function createStorefrontUIPlugin(
	options: AlternateStorefrontUIOptions = {},
): Plugin {
	return {
		install(app: App) {
			registerStorefrontUI(app, options)
		},
	}
}

export function createStorefrontScope(rootClass: string = storefrontRootClass): string {
	return rootClass
}

export { storefrontComponents }
export * from '@storefront-ui/vue'