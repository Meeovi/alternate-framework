<template>
  <!-- 
    This empty div serves as a mounting point for the Novu Inbox.
    We use Vue's ref attribute to get direct access to this DOM element.
  -->
  <div ref="novuInbox"></div>
</template>
 
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { NovuUI } from "@novu/js/ui";
 
interface NovuOptions {
  options: {
    applicationIdentifier: string;
    subscriberId: string;
  };
}
 
// Create a reactive reference to hold the DOM element
const novuInbox = ref<HTMLElement | null>(null);
// Store the Novu instance for cleanup during unmount
let novuInstance: NovuUI | null = null;
 
onMounted(() => {
  // Ensure our div reference exists before proceeding
  if (!novuInbox.value) {
    console.error("Novu inbox container element not found");
    return;
  }
 
  try {
    // Initialize the Novu UI instance with required configuration
    const novu = new NovuUI({
      options: {
        applicationIdentifier: `${useRuntimeConfig().public.novuAppId}`,
        subscriberId: `${useRuntimeConfig().public.novuSubscriberId}`,
      },
    } as NovuOptions);
 
    // Mount the Inbox component to our div reference
    // This is where Novu creates and injects its Inbox UI
    novu.mountComponent({
      name: "Inbox",
      props: {},
      element: novuInbox.value, // The actual DOM element where Inbox will be mounted
    });
 
    // Store the instance for cleanup
    novuInstance = novu;
  } catch (error) {
    console.error("Failed to initialize Novu inbox:", error);
  }
});
 
// Clean up when the component is destroyed
onUnmounted(() => {
  if (novuInstance && novuInbox.value) {
    try {
      // Properly unmount the Novu component to prevent memory leaks
      novuInstance.unmountComponent(novuInbox.value);
    } catch (error) {
      console.error("Failed to unmount Novu inbox:", error);
    }
  }
});
</script>