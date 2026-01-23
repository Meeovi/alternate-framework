// composables/createList.js
import { createItem } from '@directus/sdk';

export default async function createList(listData) {
    const { $directus } = useNuxtApp();
    const user = useSupabaseUser();

    const data = {
      name: listData.name,
      type: listData.type,
      status: listData.status,
      description: listData.description,
      image: listData.image,
      user: user.value.id,
    };

    try {
      const list = await $directus.request(createItem('lists', data));
      return list;
    } catch (error) {
      console.error('Error creating list:', error);
      throw error;
    }
  }
  