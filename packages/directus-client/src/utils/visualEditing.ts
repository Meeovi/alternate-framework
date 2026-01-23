import { apply as applyVisualEditing, setAttr } from '@directus/visual-editing';
import type { PrimaryKey } from '@directus/types';

export interface VisualEditingOptions {
  enableVisualEditing?: boolean;
  directusUrl: string;
  query?: Record<string, string | undefined>;
}

export interface ApplyOptions {
  elements?: HTMLElement[] | HTMLElement;
  onSaved?: (data: {
    collection?: string;
    item?: PrimaryKey | null;
    payload?: Record<string, any>;
  }) => void;
  customClass?: string;
}

export function createVisualEditing(options: VisualEditingOptions) {
  const { enableVisualEditing = false, directusUrl, query = {} } = options;

  let isEnabled = false;

  // Determine if visual editing should be active
  if (query['visual-editing'] === 'true' && enableVisualEditing) {
    isEnabled = true;
  } else if (query['visual-editing'] === 'false') {
    isEnabled = false;
  }

  const apply = (opts: ApplyOptions) => {
    if (!isEnabled) return;

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
