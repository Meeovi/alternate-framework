<template>
	<div class="register-form">
		<v-card class="register-card" elevation="0">
			<v-card-title>Create Account</v-card-title>
			<v-card-subtitle>Enter your information to create an account</v-card-subtitle>

			<v-card-text>
				<v-form class="space-y-4" @submit.prevent="signUp">
					<div class="d-flex gap-4">
						<v-text-field v-model="firstName" label="First Name" placeholder="Max" required
							variant="outlined" class="grow" />
						<v-text-field v-model="lastName" label="Last Name" placeholder="Robinson" required
							variant="outlined" class="grow" />
					</div>

					<v-text-field v-model="email" label="Email" type="email" placeholder="m@example.com" required
						variant="outlined" />

					<v-text-field v-model="password" label="Password" type="password"
						placeholder="Enter a secure password" autocomplete="new-password" required variant="outlined" />

					<v-text-field v-model="passwordConfirmation" label="Confirm Password" type="password"
						placeholder="Confirm your password" autocomplete="new-password" required variant="outlined" />

					<div>
						<v-label class="mb-2 d-block">Profile Image (optional)</v-label>
						<v-file-input v-model="imageFile" accept="image/*" label="Select an image" variant="outlined"
							prepend-icon="fas fa-camera" @update:model-value="handleImageChange" />
						<v-img v-if="imagePreview" :src="imagePreview" alt="Profile preview" class="mt-3"
							max-width="150" max-height="150" />
					</div>

					<v-checkbox v-model="becomeSeller" label="I want to sell on the marketplace"
						messages="You'll get access to the seller dashboard once your account is created."
						hide-details="auto" density="comfortable" />

					<v-btn type="submit" block color="primary" :disabled="loading" :loading="loading" size="large">
						{{ loading ? 'Creating account...' : 'Create Account' }}
					</v-btn>
				</v-form>

				<v-divider class="my-4" />

				<v-expansion-panels variant="accordion">
					<v-expansion-panel title="Create a Bluesky / AT Protocol account instead">
						<v-expansion-panel-text>
							<AtprotoAuth mode="sign-up" />
						</v-expansion-panel-text>
					</v-expansion-panel>
				</v-expansion-panels>

				<div class="text-center text-caption mt-4">
					Already have an account?
					<NuxtLink to="/login" class="text-decoration-none font-weight-bold">
						Sign In
					</NuxtLink>
				</div>
			</v-card-text>
		</v-card>
	</div>
</template>


<script setup>
	import {
		ref
	} from '#imports'
	import {
		definePageMeta,
		useHead,
		useRouter,
		useRuntimeConfig
	} from '#imports'
import {
	useAuth
} from '../composables/useAuth'
import {
	useToast
} from '../composables/useSnackbar';
import AtprotoAuth from '../components/features/plugins/atproto.vue'

	const auth = useAuth();

	definePageMeta({
		layout: 'auth',
		auth: {
			only: 'guest'
		}
	})

	const router = useRouter();
	const toast = useToast();

	const firstName = ref("");
	const lastName = ref("");
	const email = ref("");
	const password = ref("");
	const passwordConfirmation = ref("");
	const imageFile = ref(null);
	const imagePreview = ref(null);
	const becomeSeller = ref(false);
	const loading = ref(false);

	async function convertImageToBase64(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	async function signUp() {
		if (loading.value) return
		if (password.value !== passwordConfirmation.value) {
			toast.add({ title: 'Error', description: 'Passwords do not match', color: 'error' });
			return;
		}
		loading.value = true
		const {
			error
		} = await auth.signUp.email({
			email: email.value,
			password: password.value,
			name: `${firstName.value} ${lastName.value}`,
			image: imageFile.value ? await convertImageToBase64(imageFile.value) : undefined,
			// Read server-side by the user.create.after hook (audits.ts),
			// which appends the "seller" role and best-effort registers a
			// matching Webkul seller record via the Magento adapter — see
			// additionalFields.becomeSeller in server/utils/auth.ts.
			becomeSeller: becomeSeller.value,
			// Where better-auth sends the user once the verification link is
			// clicked. See emailVerification config in server/utils/auth.ts.
			callbackURL: '/login?verified=1',
		})
		if (error) {
			toast.add({ title: 'Error', description: error.message, color: 'error' });
			loading.value = false
			return
		}
		// Account created but not yet usable — no session is issued until the
		// email is confirmed. Send the user to the "check your inbox" page.
		await navigateTo({ path: '/verify-email', query: { email: email.value } })
	}

	const handleImageChange = (files) => {
		if (files && files.length > 0) {
			const file = files[0];
			imageFile.value = file;
			const reader = new FileReader();
			reader.onloadend = () => {
				imagePreview.value = reader.result;
			};
			reader.readAsDataURL(file);
		}
	};

	// titleTemplate '%s - <site name>' is applied app-wide by nuxt.config —
	// only the page part belongs here or the site name doubles.
	useHead({
		title: 'Register',
	});
</script>