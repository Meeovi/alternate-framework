import { apply as applyVisualEditing, setAttr } from '@directus/visual-editing';
export function createVisualEditing(options) {
    const { enableVisualEditing = false, directusUrl, query = {} } = options;
    let isEnabled = false;
    // Determine if visual editing should be active
    if (query['visual-editing'] === 'true' && enableVisualEditing) {
        isEnabled = true;
    }
    else if (query['visual-editing'] === 'false') {
        isEnabled = false;
    }
    const apply = (opts) => {
        if (!isEnabled)
            return;
        applyVisualEditing({
            ...opts,
            directusUrl,
        });
    };
    return {
        isEnabled,
        apply,
        setAttr,
    };
}
