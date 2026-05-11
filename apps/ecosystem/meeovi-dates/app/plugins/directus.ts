  createDirectus,
  rest,
  readItem,
  readItems,
  createItem,
  deleteItem,
  updateItem,
  uploadFiles,
  readSingleton
} from '@mframework/adapter-directus';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const directus = createDirectus(`${config.public.directus.url}`).with(rest());

  return {
    provide: {
      directus,
      readItem,
      readItems,
      createItem,
      updateItem, // 👈 Add this
      deleteItem,
      uploadFiles,
      readSingleton,
    },
  };
});
