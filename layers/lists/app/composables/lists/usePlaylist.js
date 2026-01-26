export const usePlaylist = () => {
  const { createList, addToList, getUserLists, getListById } = useLists()

  const createPlaylist = async (name, description = '', visibility = 'private') => {
    return await createList({
      name,
      description,
      type: 'playlist',
      visibility,
      settings: {
        autoplay: false,
        shuffle: false,
        repeat: 'none'
      }
    })
  }

  const addMediaToPlaylist = async (playlistId, mediaData) => {
    const { url, title, duration, type, thumbnail } = mediaData
    
    if (!['audio', 'video'].includes(type)) {
      throw new Error('Only audio and video files are supported in playlists')
    }

    return await addToList(playlistId, {
      type: 'media',
      title,
      url,
      media_type: type,
      duration,
      thumbnail,
      metadata: {
        artist: mediaData.artist || '',
        album: mediaData.album || '',
        genre: mediaData.genre || ''
      }
    })
  }

  const getUserPlaylists = async () => {
    return await getUserLists('playlist')
  }

  const getPlaylistWithMedia = async (playlistId) => {
    const playlist = await getListById(playlistId)
    if (playlist.type !== 'playlist') {
      throw new Error('Not a playlist')
    }
    return playlist
  }

  const updatePlaylistSettings = async (playlistId, settings) => {
    const { updateList } = useLists()
    return await updateList(playlistId, { settings })
  }

  return {
    createPlaylist,
    addMediaToPlaylist,
    getUserPlaylists,
    getPlaylistWithMedia,
    updatePlaylistSettings
  }
}