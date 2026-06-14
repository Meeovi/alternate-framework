// composables/deletePost.js

export default async function deletePost(postId) {
    const { $deleteItem } = useNuxtApp()

    try {
      await deleteItem('posts', postId)
      console.log('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
}
  