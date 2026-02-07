import { useState, useRoute, useRuntimeConfig } from 'nuxt/app';

type PrimaryKey = string | number;
// Resolve the directus visual-editing adapter at runtime if present.
const _directusAdapter: any = (globalThis as any).__directusAdapter ?? undefined;
const setAttr = _directusAdapter?.setAttr as
	| ((el: HTMLElement, attr: string, value: string) => void)
	| undefined;

const applyVisualEditing = _directusAdapter?.apply as ((opts: any) => void) | undefined;

interface ApplyOptions {
	directusUrl: string;
	elements?: HTMLElement[] | HTMLElement;
	onSaved?: (data: { collection?: string; item?: PrimaryKey | null; payload?: Record<string, any> }) => void;
	customClass?: string;
}
export default function useVisualEditing() {
	// Use useState for state that persists across navigation
	const isVisualEditingEnabled = useState('visual-editing-enabled', () => false);
	const route = useRoute();
	const {
		public: { enableVisualEditing, directusUrl },
	} = useRuntimeConfig();

	// Check query param on composable initialization.
	if (route.query['visual-editing'] === 'true' && enableVisualEditing) {
		isVisualEditingEnabled.value = true;
	} else if (route.query['visual-editing'] === 'false') {
		isVisualEditingEnabled.value = false;
	}

	const apply = (options: Pick<ApplyOptions, 'elements' | 'onSaved' | 'customClass'>) => {
		if (!isVisualEditingEnabled.value) return;
		if (typeof applyVisualEditing === 'function') {
			applyVisualEditing({
				...options,
				directusUrl,
			});
		}
	};

	return {
		isVisualEditingEnabled,
		apply,
		setAttr,
	};
}
