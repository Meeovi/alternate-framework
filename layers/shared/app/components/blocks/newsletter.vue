<template>
    <div>
        <newsletter-form @subscribed="log" headerText="Cool Newsletter" buttonText="Subscribe!"
            inputPlaceholder="Your email">
            <template #description>
                <p>My Newsletter Description</p>
            </template>
            <template #button-icon>
                <!-- icon component -->
            </template>
        </newsletter-form>
    </div>
</template>

<script setup>
    const result = await useNewsletterSubscribe(email.value)

    console.log(result) // Email ${email} added to subscribers
</script>