// composables/updatePost.js
import useAdapterRequest from '~/composables/useAdapterRequest'

export default async function updatePost(postId, postData) {
    const { updateItem } = useAdapterRequest()

    try {
      const post = await updateItem('posts', postId, postData)
      return post;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
}
  