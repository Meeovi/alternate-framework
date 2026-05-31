// composables/deletePost.js
import useContent from '#shared/app/composables/content/useContent'
export default async function deletePost(postId) {
    const { deleteItem } = useContent()

    try {
      await deleteItem('posts', postId)
      console.log('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
}
  