import VueDOMPurifyHTML from 'vue-dompurify-html';

export default defineNuxtPlugin((nuxtApp) => {
	const existing = (nuxtApp.vueApp as any)?._context?.directives?.['dompurify-html']
	if (existing) {
		return
	}

	nuxtApp.vueApp.use(VueDOMPurifyHTML);
});