<template>
    <div>
  <Comments
    :ondata="v => url.get(v)"
    :onchange="({ action, comment, id, originalValue: v }) =>
      url.path(v).save(action, comment, id)"
  />
    </div>
</template>

<script setup>
  import { RestURL } from "@svar-ui/lib-data-provider";
  import { Comments } from '@svar-ui/vue-comments';

  const url = new RestURL("https://some.com/api/comments");
</script>