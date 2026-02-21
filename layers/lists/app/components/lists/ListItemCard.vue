<template>
  <UCard class="list-item-card" :class="`item-type-${item.content.type}`">
    <!-- Media Item -->
    <div v-if="item.content.type === 'media'">
      <v-img
        :src="item.content.thumbnail || '/default-media.png'"
        height="200"
        cover
      >
        <div class="d-flex align-end fill-height">
          <v-chip color="primary" size="small" class="ma-2">
            {{ item.content.media_type }}
          </v-chip>
        </div>
      </v-img>
      
      <UCard-title class="text-truncate">{{ item.content.title }}</template>
      <UCard-subtitle v-if="item.content.metadata?.artist">
        {{ item.content.metadata.artist }}
      </v-card-subtitle>
    </div>

    <!-- Bookmark Item -->
    <div v-else-if="item.content.type === 'bookmark'">
      <UCard-title class="d-flex align-center">
        <v-img
          :src="item.content.favicon || '/default-favicon.png'"
          width="16"
          height="16"
          class="me-2"
        />
        <span class="text-truncate">{{ item.content.title }}</span>
      </template>
      
      <template #header>
        <p class="text-body-2 text-truncate">{{ item.content.description }}</p>
        <div class="d-flex align-center mt-2">
          <v-chip
            v-for="tag in item.content.tags?.slice(0, 2)"
            :key="tag"
            size="x-small"
            class="me-1"
          >
            {{ tag }}
          </v-chip>
          <v-chip
            v-if="item.content.read"
            color="success"
            size="x-small"
            variant="outlined"
          >
            Read
          </v-chip>
        </div>
      </template>
    </div>

    <!-- Product/Wishlist Item -->
    <div v-else-if="item.content.type === 'product'">
      <v-img
        :src="item.content.image || '/default-product.png'"
        height="200"
        cover
      >
        <div class="d-flex align-end fill-height">
          <v-chip
            :color="getPriorityColor(item.content.priority)"
            size="small"
            class="ma-2"
          >
            {{ item.content.priority }}
          </v-chip>
        </div>
      </v-img>
      
      <UCard-title class="text-truncate">{{ item.content.title }}</template>
      <UCard-subtitle v-if="item.content.price">
        ${{ item.content.price }}
      </v-card-subtitle>
    </div>

    <!-- Default Item -->
    <div v-else>
      <v-img
        v-if="item.content.image"
        :src="item.content.image"
        height="200"
        cover
      />
      
      <UCard-title class="text-truncate">{{ item.content.title }}</template>
      <UCard-text v-if="item.content.description">
        <p class="text-body-2">{{ item.content.description }}</p>
      </template>
    </div>

    <!-- Actions -->
    <template>
      <UButton
        v-if="item.content.url"
        :href="item.content.url"
        target="_blank"
        variant="text"
        size="small"
        prepend-icon="mdi-open-in-new"
      >
        Open
      </UButton>
      
      <v-spacer />
      
      <v-menu>
        <template v-slot:activator="{ props }">
          <UButton
            icon="mdi-dots-vertical"
            variant="text"
            size="small"
            v-bind="props"
          />
        </template>
        
        <v-list>
          <v-list-item @click="$emit('edit', item)">
            <template v-slot:prepend>
              <UIcon icon="mdi-pencil" />
            </template>
            <v-list-item-title>Edit</v-list-item-title>
          </v-list-item>
          
          <v-divider />
          
          <v-list-item @click="$emit('delete', item.id)" class="text-error">
            <template v-slot:prepend>
              <UIcon icon="mdi-delete" color="error" />
            </template>
            <v-list-item-title>Delete</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </UCard>
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