// composables/updatePost.js
import useContent from '#shared/app/composables/content/useContent'
export default async function updatePost(postId, postData) {
    const { updateItem } = useContent()

    try {
      const post = await updateItem('posts', postId, postData)
      return post;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
}
  