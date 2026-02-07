// composables/deletePost.js
import useAdapterRequest from '~/composables/useAdapterRequest'

export default async function deletePost(postId) {
    const { deleteItem } = useAdapterRequest()

    try {
      await deleteItem('posts', postId)
      console.log('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
}
  