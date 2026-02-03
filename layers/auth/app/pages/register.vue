<template>
	<div class="z-50 rounded-md rounded-t-none max-w-md">
		<v-toolbar>
			<v-toolbar-title class="text-lg md:text-xl">Sign Up</v-toolbar-title>
			<v-toolbar-subtitle>
				Enter your information to create an account
			</v-toolbar-subtitle>
		</v-toolbar>
		<v-card>
			<div class="grid gap-4">
				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<v-text-field
							id="first-name"
							placeholder="Max"
              label="First Name"
							required
							v-model="firstName"
						/>
					</div>
					<div class="grid gap-2">
						<v-text-field
							id="last-name"
							placeholder="Robinson"
              label="Last Name"
							required
							v-model="lastName"
						/>
					</div>
					<div class="grid gap-2">
						<v-text-field
							id="email"
							type="email"
							placeholder="m@example.com"
              label="Email"
							required
							v-model="email"
						/>
					</div>
					<div class="grid gap-2">
						<v-text-field
							id="password"
							type="password"
							placeholder="Password"
							autocomplete="new-password"
              label="Password"
							v-model="password"
						/>
					</div>
					<div class="grid gap-2">
						<v-text-field
							id="password_confirmation"
							type="password"
							autocomplete="new-password"
							placeholder="Confirm Password"
              label="Confirm Password"
							v-model="passwordConfirmation"
						/>
					</div>
					<div class="grid gap-2">
						<v-text-field
              label="Profile Image (optional)"
						/>
						<div class="flex items-end gap-4">
							<div v-if="imagePreview" class="relative w-16 h-16 rounded-sm overflow-hidden">
								<NuxtImg
									:src="imagePreview"
									alt="Profile preview"
									class="object-cover"
								/>
							</div>
							<div class="flex items-center gap-2 w-full">
								<v-text-field
									id="image"
									type="file"
									accept="image/*"
									@change="handleImageChange"
									class="w-full"
								/>
								<X
									class="cursor-pointer"
									@click="image = null; imagePreview = null"
								/>
							</div>
						</div>
					</div>
					<v-btn
						type="submit"
						class="w-full"
						:disabled="loading"
						@click="handleSignUp"
					>
						<Loader2 size="16" class="animate-spin" v-if="loading" />
						<span v-else>Create your account</span>
					</v-btn>
				</div>
			</div>
		</v-card>
	</div>
</template>


<script setup>
import { ref } from 'vue'
import { definePageMeta, useHead, useRouter } from '#imports'
import { useAuth } from '../composables/useAuth'

const { signUp } = useAuth();

definePageMeta({
  layout: false,
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
const image = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const loading = ref(false);

async function convertImageToBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

const handleSignUp = async () => {
	await signUp.email({
		email: email.value,
		password: password.value,
		name: `${firstName.value} ${lastName.value}`,
		image: image.value ? await convertImageToBase64(image.value) : "",
		callbackURL: "/dashboard",
		fetchOptions: {
			onResponse: () => {
				loading.value = false;
			},
			onRequest: () => {
				loading.value = true;
			},
			onError: (ctx) => {
				toast.error(ctx.error.message);
			},
			onSuccess: () => {
				router.push("/dashboard");
			},
		},
	})
};

const handleImageChange = (e) => {
	const file = (e.target)?.files?.[0];
	if (file) {
		image.value = file;
		const reader = new FileReader();
		reader.onloadend = () => {
			imagePreview.value = reader.result;
		};
		reader.readAsDataURL(file);
	}
};

useHead({
  title: 'Register'
});
</script>