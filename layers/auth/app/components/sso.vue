<template>
	<section v-if="shouldRender" class="space-y-3">
		<h2 class="font-medium">Single Sign-On</h2>

		<p v-if="!isSupported" class="text-sm text-muted">
			SSO is not available for the current auth backend ({{ backendLabel }}).
		</p>

		<div v-else class="space-y-2">
			<p class="text-sm text-muted">
				Start an SSO flow with one of the configured identity providers.
			</p>
			<v-btn
				v-for="provider in providers"
				:key="provider"
				variant="text"
				:loading="loadingProvider === provider"
				@click="startSso(provider)">
				Continue with {{ formatProvider(provider) }}
			</v-btn>
		</div>

		<UAlert v-if="error" color="error" variant="soft" :description="error" />
	</section>
</template>

<script setup lang="ts">
	import { useAuthCapabilities } from '../composables/useAuthCapabilities'

	const props = withDefaults(defineProps<{
		enabled?: boolean;
		showUnsupportedState?: boolean;
		providers?: string[];
		callbackURL?: string;
	}>(), {
		enabled: true,
		showUnsupportedState: false,
		providers: () => ['google'],
		callbackURL: '/',
	})

	const auth = useAuth()
	const { backend, hasSso } = useAuthCapabilities()
	const isSupported = computed(() => hasSso.value)
	const backendLabel = computed(() => backend.value)
	const shouldRender = computed(() => props.enabled && (isSupported.value || props.showUnsupportedState))

	const loadingProvider = ref<string | null>(null)
	const error = ref('')

	function formatProvider(provider: string) {
		return provider.charAt(0).toUpperCase() + provider.slice(1)
	}

	async function startSso(provider: string) {
		if (!isSupported.value) {
			error.value = 'SSO is not supported by the current auth backend'
			return
		}

		loadingProvider.value = provider
		error.value = ''
		try {
			await (auth.signIn as any).social({ provider, callbackURL: props.callbackURL })
		} catch (err: any) {
			error.value = err?.message || `Failed to start SSO with ${provider}`
		} finally {
			loadingProvider.value = null
		}
	}
</script>
