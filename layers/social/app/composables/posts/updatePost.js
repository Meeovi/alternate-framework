// composables/updatePost.js

export default async function updatePost(postId, postData) {
    const { $updateItem } = useNuxtApp()

    try {
      const post = await updateItem('posts', postId, postData)
      return post;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
}
  