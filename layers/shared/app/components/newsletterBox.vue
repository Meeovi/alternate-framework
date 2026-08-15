<template>
    <div class="relative">
        <v-sheet class="p-4 text-center bg-neutral-100 sm:p-10" rounded>
            <p class="my-2 mb-4 typography-text-sm sm:typography-text-base">
                Be aware of upcoming sales and events. Receive gifts and special offers!
            </p>
            <newsletter-form @subscribed="log" headerText="Cool Newsletter" buttonText="Subscribe to Newsletter"
                inputPlaceholder="Your email" class="mb-4 flex flex-col sm:flex-row gap-4 max-w-172 mx-auto">
            </newsletter-form>
        </v-sheet>
    </div>
</template>

<script setup>

</script>