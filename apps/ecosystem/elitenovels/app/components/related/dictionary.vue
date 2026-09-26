<template>
  <div>
    <v-dialog max-width="500">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn v-bind="activatorProps" color="surface-variant" :text="dictionary?.name" variant="flat"
          title="Click to open"></v-btn>
      </template>

      <template v-slot:default="{ isActive }">
        <v-card :title="dictionary?.name">
          <v-card-text>
            <p class="text-h4 font-weight-black">{{ dictionary?.pronunction }}</p>

            <div>Type: <p v-html="dictionary?.type"></p></div>

            <div>Status: <p class="text-h6">{{ dictionary?.status }}</p></div>

            <div>Definition: <p v-html="dictionary?.description"></p></div>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn text="Close Definition" @click="isActive.value = false"></v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </div>
</template>

<script setup>
  import {
    ref
  } from 'vue'

  const props = defineProps({
    dictionary: {
      type: Object,
      required: true,
    },
  });
  const {
    dictionary
  } = props;
</script>