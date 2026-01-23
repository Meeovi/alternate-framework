export const useBookmarks = () => {
  const { createList, addToList, getUserLists, removeFromList } = useLists()

  const createBookmarkList = async (name = 'Bookmarks', description = '') => {
    return await createList({
      name,
      description,
      type: 'bookmarks',
      visibility: 'private'
    })
  }

  const addBookmark = async (listId, bookmarkData) => {
    const { url, title, description, tags, favicon } = bookmarkData
    
    return await addToList(listId, {
      type: 'bookmark',
      title,
      url,
      description,
      favicon,
      tags: tags || [],
      date_added: new Date().toISOString(),
      read: false,
      archived: false
    })
  }

  const getUserBookmarkLists = async () => {
    return await getUserLists('bookmarks')
  }

  const removeBookmark = async (itemId) => {
    return await removeFromList(itemId)
  }

  const markAsRead = async (itemId) => {
    const { updateListItem } = useLists()
    return await updateListItem(itemId, { 
      'content.read': true,
      'content.date_read': new Date().toISOString()
    })
  }

  const archiveBookmark = async (itemId) => {
    const { updateListItem } = useLists()
    return await updateListItem(itemId, { 
      'content.archived': true,
      'content.date_archived': new Date().toISOString()
    })
  }

  const addTagsToBookmark = async (itemId, newTags) => {
    const { updateListItem } = useLists()
    return await updateListItem(itemId, { 
      'content.tags': newTags
    })
  }

  return {
    createBookmarkList,
    addBookmark,
    getUserBookmarkLists,
    removeBookmark,
    markAsRead,
    archiveBookmark,
    addTagsToBookmark
  }
}