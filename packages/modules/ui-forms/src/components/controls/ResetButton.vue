<template>
  <button type="button" @click="$emit('click')">
    <slot>Reset</slot>
  </button>
</template>
