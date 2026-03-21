import type { ComponentInstance } from '#imports';

export type HTMLElementWithVue = HTMLElement & { __vue__: ComponentInstance };
