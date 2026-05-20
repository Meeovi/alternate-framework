// composables/deletePost.js
import { useSdkContentAdapter } from '#imports'
export default async function deletePost(postId) {
    const { deleteItem } = useSdkContentAdapter()

    try {
      await deleteItem('posts', postId)
      console.log('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
}
  