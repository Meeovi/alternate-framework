export const useBookmarks = () => {
    
    const getBookmarks = async () => {
        const response = await fetch('/api/bookmarks', {
            method: 'GET'
        })
        return await response.json()
    }

    const getBookmarkById = async (id: string) => {
        const response = await fetch(`/api/bookmarks/${id}`, {
            method: 'GET'
        })
        return await response.json()
    }

    const createBookmark = async (bookmark: any) => {
        const response = await fetch('/api/bookmarks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookmark)
        })
        return await response.json()
    }

    const updateBookmark = async (id: string, bookmark: any) => {
        const response = await fetch(`/api/bookmarks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookmark)
        })
        return await response.json()
    }

    const deleteBookmark = async (id: string) => {
        const response = await fetch(`/api/bookmarks/${id}`, {
            method: 'DELETE'
        })
        return await response.json()
    }

    return {
        getBookmarks,
        getBookmarkById,
        createBookmark,
        updateBookmark,
        deleteBookmark
    }
}