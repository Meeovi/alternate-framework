<template>
	<section v-if="shouldRender" class="space-y-3">
		<h2 class="font-medium">Social Sign-In</h2>

		<p v-if="!isSupported" class="text-sm text-muted">
			Social sign-in is not available for the current auth backend ({{ backendLabel }}).
		</p>

		<div v-else class="grid gap-2 sm:grid-cols-2">
			<v-btn
				v-for="provider in providers"
				:key="provider"
				:loading="loadingProvider === provider"
				variant="text"
				@click="signInWithProvider(provider)">
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
		providers: () => ['google', 'github'],
		callbackURL: '/',
	})

	const auth = useAuth()
	const { backend, hasSocial } = useAuthCapabilities()
	const isSupported = computed(() => hasSocial.value)
	const backendLabel = computed(() => backend.value)
	const shouldRender = computed(() => props.enabled && (isSupported.value || props.showUnsupportedState))

	const loadingProvider = ref<string | null>(null)
	const error = ref('')

	function formatProvider(provider: string) {
		return provider.charAt(0).toUpperCase() + provider.slice(1)
	}

	async function signInWithProvider(provider: string) {
		if (!isSupported.value) {
			error.value = 'Social sign-in is not supported by the current auth backend'
			return
		}

		loadingProvider.value = provider
		error.value = ''
		try {
			await (auth.signIn as any).social({ provider, callbackURL: props.callbackURL })
		} catch (err: any) {
			error.value = err?.message || `Failed to sign in with ${provider}`
		} finally {
			loadingProvider.value = null
		}
	}
</script>
