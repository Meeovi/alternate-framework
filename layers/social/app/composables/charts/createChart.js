// composables/createPost.js

export default async function createPost(chartData) {
    const route = useRoute();
    const id = route.params.id;
    const { $createItem } = useNuxtApp()

    try {
      const chart = await createItem('musicchart', {
          name: chartData.name,
          description: chartData.description,
          status: chartData.status,
          type: chartData.type,
          image: chartData.image,
          media: chartData.media,
          video: chartData.video,
          document: chartData.document,
          color: chartData.color,
          coverFile: null,
          avatarFile: null,
          creator: chartData.creator,
      })
      return chart;
    } catch (error) {
      console.error('Error creating chart:', error);
      throw error;
    }
}
  