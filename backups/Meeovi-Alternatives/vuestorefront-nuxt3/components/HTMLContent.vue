<template>
  <component
    :is="tag"
    v-html="$dompurify(content)"
  />
</template>
<script lang="ts">
import { defineComponent } from '#imports';

export default defineComponent({
  name: 'HTMLContent',
  props: {
    tag: {
      type: String,
      default: 'div',
    },
    content: {
      type: String,
      default: '',
    },
  },
});
</script>
