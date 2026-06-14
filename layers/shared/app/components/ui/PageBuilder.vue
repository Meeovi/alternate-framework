<script setup lang="ts">

// Define types locally since module resolution has issues
interface Page {
	id?: string;
	permalink?: string;
	blocks?: PageBlock[];
	[key: string]: any;
}

interface OsProposal {
	id?: string;
	blocks?: any[];
	[key: string]: any;
}

interface PageBlock {
	collection?: BlockType | null;
	id?: string;
	item?: any;
	hide_block?: boolean | null;
}

type BlockType =
	| 'block_hero'
	| 'block_faqs'
	| 'block_richtext'
	| 'block_testimonials'
	| 'block_quote'
	| 'block_cta'
	| 'block_form'
	| 'block_logocloud'
	| 'block_team'
	| 'block_html'
	| 'block_video'
	| 'block_gallery'
	| 'block_steps'
	| 'block_columns'
	| 'block_divider';

// Use component name strings so Vue resolves them at render/setup time
const componentMap: Record<BlockType, string> = {
	block_hero: 'BlocksHero',
	block_faqs: 'BlocksFaqs',
	block_richtext: 'BlocksRichText',
	block_testimonials: 'BlocksTestimonials',
	block_quote: 'BlocksQuote',
	block_cta: 'BlocksCta',
	block_form: 'BlocksForm',
	block_logocloud: 'BlocksLogoCloud',
	block_team: 'BlocksTeam',
	block_html: 'BlocksRawHtml',
	block_video: 'BlocksVideo',
	block_gallery: 'BlocksGallery',
	block_steps: 'BlocksSteps',
	block_columns: 'BlocksColumns',
	block_divider: 'BlocksDivider',
};

const props = defineProps<{
	page: Page | OsProposal;
}>();

const blocks = computed(() => {
	const blocks = unref(props.page as Page)?.blocks as PageBlock[];
	return blocks?.filter((block) => {
		return block.hide_block !== true;
	});
});

// Helper to safely resolve components
const getComponent = (componentName: string | null | undefined) => {
	if (!componentName) return undefined;
	try {
		return resolveComponent(componentName);
	} catch {
		console.warn(`Component ${componentName} not found`);
		return undefined;
	}
};

// Compute resolved components for each block
const resolvedBlocks = computed(() => {
	return blocks.value.map((block: PageBlock) => {
		const componentName = block.collection ? componentMap[block.collection as BlockType] : null;
		return {
			...block,
			component: componentName ? getComponent(componentName) : undefined,
		};
	});
});
</script>
<template>
	<div id="content" class="mx-auto">
		<template v-for="block in resolvedBlocks" :key="block.id">
			<component :is="block.component" v-if="block && block.component" :data="block.item" />
		</template>
	</div>
</template>
