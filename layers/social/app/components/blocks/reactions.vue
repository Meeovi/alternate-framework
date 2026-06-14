<template>
  <div class="row">
    <Picker :data="emojiIndex" set="twitter" @select="addEmoji" />
  </div>

  <div class="row">
    <div>{{ emojisOutput }}</div>
  </div>
</template>

<script setup lang="ts">
import { useEmojiPicker } from "~/composables/content/useEmojiPicker"

const { emojiIndex, emojisOutput, addEmoji } = useEmojiPicker()
</script>

<style>
.row { display: flex; }
.row > * { margin: auto; }
</style>
