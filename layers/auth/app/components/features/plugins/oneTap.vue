<template>
    <div>
        <div id="google-signin-button"></div>
    </div>
</template>

<script setup>
    import {
        ref
    } from "vue";
    import {
        authClient
    } from "../../../../lib/auth-client";

    // Call oneTap with button configuration
    await authClient.oneTap({
        button: {
            container: "#google-signin-button", // CSS selector or HTMLElement
            config: {
                theme: "outline",
                size: "large",
                type: "standard",
                text: "signin_with"
            }
        },
        fetchOptions: {
            onSuccess: () => {
                // For example, use a router to navigate without a full reload:
                router.push("/");
            }
        }
    });
</script>