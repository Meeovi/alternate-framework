// composables/updatePost.js
import { useSdkContentAdapter } from '#imports'
export default async function updatePost(postId, postData) {
    const { updateItem } = useSdkContentAdapter()

    try {
      const post = await updateItem('posts', postId, postData)
      return post;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
}
  