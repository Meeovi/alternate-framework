<template>
  <section class="pa-4 max-w-md mx-auto">
    <h2 class="text-h5 mb-4">Authorize Your Device</h2>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      {{ error }}
    </v-alert>

    <v-form @submit.prevent="handleSubmit">
      <v-text-field
        v-model="userCode"
        label="Enter device code"
        placeholder="ABCD-1234"
        maxlength="12"
        variant="outlined"
        class="mb-4"
      />

      <v-btn
        type="submit"
        color="primary"
        :loading="loading"
      >
        Continue
      </v-btn>
    </v-form>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "#app";
import { authClient } from "../../../../lib/auth-client";

const route = useRoute();
const router = useRouter();

const { data: sessionData } = await useAuth().useSession(useFetch)
const session = (sessionData as any).value

const userCode = ref(route.query.user_code?.toString() || "");
const error = ref<string | null>(null);
const loading = ref(false);

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  try {
    const formattedCode = userCode.value.trim().replace(/-/g, "").toUpperCase();

    if (!formattedCode) {
      error.value = "Please enter a valid device code";
      loading.value = false;
      return;
    }

    const approvalPath = `/device/approve?user_code=${encodeURIComponent(formattedCode)}`;

    // FIXED: Correct session access
    const user = session.value?.data?.user;

    if (!user) {
      const verificationPath = `/device?user_code=${encodeURIComponent(formattedCode)}`;
      router.push(`/login?redirect=${encodeURIComponent(verificationPath)}`);
      return;
    }

    const response = await authClient.device({
      query: { user_code: formattedCode },
    });

    if (response.data) {
      router.push(approvalPath);
      return;
    }

    error.value = "Invalid or expired code";
  } catch (err) {
    error.value = "Invalid or expired code";
  } finally {
    loading.value = false;
  }
};
</script>
