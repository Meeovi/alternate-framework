export const useSaved = () => {
    const { $directus } = useNuxtApp();
    const user = useSupabaseUser();
  
    const isSaved = async (productId) => {
      if (!user.value) return false;
  
      const lists = await $directus.items('lists').readItems({
        filter: { user: { _eq: user.value.id } },
        fields: ['id']
      });
  
      const listIds = lists.map((l) => l.id);
  
      if (listIds.length === 0) return false;
  
      const saved = await $directus.items('list_items').readItems({
        filter: {
          list: { _in: listIds },
          product: { _eq: productId }
        }
      });
  
      return saved.length > 0;
    };
  
    return { isSaved };
  };
  