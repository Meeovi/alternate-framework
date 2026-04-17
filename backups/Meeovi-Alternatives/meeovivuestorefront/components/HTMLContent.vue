<template>
  <component
    :is="tag"
    v-dompurify-html="$dompurify(content)"
  />
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';

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
