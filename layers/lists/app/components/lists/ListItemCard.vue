<template>
  <div class="list-item-card-placeholder">ListItemCard</div>
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  listType: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])

const content = useContentAdapter()

const getPriorityColor = (priority) => {
  const colors = {
    low: 'blue',
    medium: 'orange',
    high: 'red'
  }
  return colors[priority] || 'grey'
}
</script>

<style scoped>
.list-item-card {
  height: 100%;
  transition: all 0.2s ease;
}

.list-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.item-type-media {
  border-left: 4px solid rgb(var(--v-theme-purple));
}

.item-type-bookmark {
  border-left: 4px solid rgb(var(--v-theme-orange));
}

.item-type-product {
  border-left: 4px solid rgb(var(--v-theme-pink));
}
</style>