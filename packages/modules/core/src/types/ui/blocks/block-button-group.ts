import type { BlockButton } from './block-button.js';

export interface BlockButtonGroup {
	id: string;
	buttons: (string | BlockButton)[] | null;
	alignment: 'left' | 'center' | null;
}
