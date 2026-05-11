<template>
    <div class="relative">
        <v-sheet class="p-4 text-center bg-neutral-100 sm:p-10" rounded>
            <p class="font-bold typography-headline-4 sm:typography-headline-3">
                Subscribe and get discount on your first purchase!
            </p>
            <p class="my-2 mb-4 typography-text-sm sm:typography-text-base">
                Be aware of upcoming sales and events. Receive gifts and special offers!
            </p>
            <form class="mb-4 flex flex-col sm:flex-row gap-4 max-w-172 mx-auto"
                @submit.prevent="subscribeNewsletter(inputValue)">
                <v-text-field
                    v-model="inputValue"
                    type="email"
                    density="comfortable"
                    variant="outlined"
                    hide-details
                    class="grow"
                    placeholder="Type your email"
                />
                <v-btn type="submit" size="large" color="primary">Subscribe to Newsletter</v-btn>
            </form>
            <div class="typography-text-xs text-neutral-600">
                To learn how we process your data, visit our
                <a href="#" class="text-neutral-600 underline">Privacy Notice</a>.
                You can <a href="#" class="text-neutral-600 underline">unsubscribe</a> at any time without costs.
            </div>
        </v-sheet>
        <div class="absolute top-0 right-0 mx-2 mt-2 sm:mr-6">
            <v-alert
                v-model="showPositiveAlert"
                type="success"
                variant="tonal"
                density="comfortable"
                closable
                class="mb-2 max-w-[600px]"
                icon="mdi-check-circle"
            >
                Your email has been added to the newsletter subscription.
            </v-alert>
            <v-alert
                v-model="showErrorAlert"
                type="error"
                variant="tonal"
                density="comfortable"
                closable
                class="max-w-[600px]"
                icon="mdi-alert-circle"
            >
                This email is already subscribed for our newsletter.
            </v-alert>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import {
        ref,
        type Ref
    } from 'vue';

    const inputValue = ref('');
    const showPositiveAlert = ref(false);
    const showErrorAlert = ref(false);
    const emailDataBase: Ref<string[]> = ref([]);

    const checkEmailDataBase = (email: string) => emailDataBase.value.find((element) => element === email);

    const subscribeNewsletter = (email: string) => {
        if (!email) return;
        if (checkEmailDataBase(email)) {
            showErrorAlert.value = true;
            setTimeout(() => (showErrorAlert.value = false), 5000);
        } else {
            showPositiveAlert.value = true;
            emailDataBase.value.push(email);
            setTimeout(() => (showPositiveAlert.value = false), 5000);
        }
        console.log(email);
        inputValue.value = '';
    };
</script>