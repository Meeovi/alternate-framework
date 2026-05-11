<template>
	<div class="register-form">
		<v-card class="register-card" elevation="0">
			<v-card-title>Create Account</v-card-title>
			<v-card-subtitle>Enter your information to create an account</v-card-subtitle>

			<v-card-text>
				<v-form class="space-y-4">
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
							prepend-icon="mdi-camera" @update:model-value="handleImageChange" />
						<v-img v-if="imagePreview" :src="imagePreview" alt="Profile preview" class="mt-3"
							max-width="150" max-height="150" />
					</div>

					<v-btn type="submit" block color="primary" :disabled="loading" :loading="loading" @click="signUp" size="large">
						{{ loading ? 'Creating account...' : 'Create Account' }}
					</v-btn>
				</v-form>

				<v-divider class="my-4" />

				<div class="text-center text-caption">
					Already have an account?
					<NuxtLink :to="localePath('/login')" class="text-decoration-none font-weight-bold">
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
	import useAppLocalePath from '../utils/useAppLocalePath'
	import {
		useAlert
	} from '../composables/useAlert';

	const auth = useAuth();
	const localePath = useAppLocalePath();

	definePageMeta({
		layout: 'auth',
		auth: {
			only: 'guest'
		}
	})

	const router = useRouter();
	const alert = useAlert();
	const runtimeConfig = useRuntimeConfig();

	const firstName = ref("");
	const lastName = ref("");
	const email = ref("");
	const password = ref("");
	const passwordConfirmation = ref("");
	const imageFile = ref(null);
	const imagePreview = ref(null);
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
			alert.error('Passwords do not match');
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
		})
		if (error) {
			alert.error(error.message);
		} else {
			alert.success('You have been signed up!');
			await navigateTo('/login')
		}
		loading.value = false
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

	useHead({
		title: `Register - ${String(runtimeConfig.public?.siteName || runtimeConfig.public?.appName || 'Meeovi')}`,
	});
</script>

<style scoped>
	.register-form {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.register-card {
		width: 100%;
		background: white !important;
		border-radius: 12px;
	}
</style>