export const useWishlist = () => {
  const { createList, addToList, getUserLists, removeFromList } = useLists()

  const createWishlist = async (name = 'My Wishlist', description = '') => {
    return await createList({
      name,
      description,
      type: 'wishlist',
      visibility: 'private'
    })
  }

  const addToWishlist = async (wishlistId, itemData) => {
    const { title, url, price, image, description, category } = itemData
    
    return await addToList(wishlistId, {
      type: 'product',
      title,
      url,
      price,
      image,
      description,
      category,
      date_added: new Date().toISOString(),
      priority: itemData.priority || 'medium'
    })
  }

  const getUserWishlists = async () => {
    return await getUserLists('wishlist')
  }

  const removeFromWishlist = async (itemId) => {
    return await removeFromList(itemId)
  }

  const updateWishlistItemPriority = async (itemId, priority) => {
    const { updateListItem } = useLists()
    return await updateListItem(itemId, { 
      'content.priority': priority 
    })
  }

  return {
    createWishlist,
    addToWishlist,
    getUserWishlists,
    removeFromWishlist,
    updateWishlistItemPriority
  }
}