import type { ComputedRef, Ref } from 'vue'
import type {
  SocialProfile,
  FriendRequest,
  FriendSuggestion,
  Member,
  FriendBarConfig
} from './types'

type UseFriendsPageDataResult = {
  friendBar: Ref<FriendBarConfig | null | undefined>
  friendsPage: Ref<any>
  followers: Ref<SocialProfile[] | undefined>
  friendRequests: Ref<FriendRequest[] | undefined>
  suggestions: Ref<FriendSuggestion[] | undefined>
  members: Ref<Member[] | undefined>
  reloadData: () => Promise<void>
}

const defaultFriendBar: FriendBarConfig = {
  name: 'Friend Center',
  color: '#2b5db7',
  colortext: '#ffffff',
  menus: [
    { name: 'Followers', value: 'followers' },
    { name: 'Requests', value: 'requests' },
    { name: 'Suggestions', value: 'suggestions' },
    { name: 'Members', value: 'members' },
  ],
}

export default function useFriendsPageData(): UseFriendsPageDataResult {
  const { $sdk } = useNuxtApp()
  const readItems = $sdk.content.readItems.bind($sdk.content)

  const { data: friendBar, refresh: refreshBar } = useAsyncData<FriendBarConfig | null>('friends:bar', async () => {
    try {
      const rows = await readItems('navigation', {
        filter: { id: { _eq: '77' } },
        fields: ['*', { menus: ['*'] }],
        limit: 1,
      })
      const row = rows?.[0]
      if (!row || !Array.isArray(row.menus)) return defaultFriendBar
      return {
        name: row.name ?? defaultFriendBar.name,
        color: row.color ?? defaultFriendBar.color,
        colortext: row.colortext ?? defaultFriendBar.colortext,
        menus: (row.menus as any[]).map((m: any) => ({
          name: m.name,
          value: m.value,
        })),
      }
    } catch {
      return defaultFriendBar
    }
  })

  const { data: friendsPage, refresh: refreshPage } = useAsyncData<any>('friends:page', async () => {
    try {
      const rows = await readItems('pages', {
        filter: { slug: { _eq: 'friends' } },
        fields: ['*'],
        limit: 1,
      })
      return rows?.[0] || null
    } catch {
      return null
    }
  })

  const { data: followers, refresh: refreshFollowers } = useAsyncData<SocialProfile[] | undefined>('friends:followers', async () => {
    try {
      const rows = await readItems('profiles', {
        fields: ['*', { followers_id: ['*'] }],
        sort: ['-date_created'],
        limit: 50,
      })
      if (!Array.isArray(rows)) return []
      return rows.map((item: any) => {
        const profile = item.followers_id || item.user || item.profile || {}
        return {
          id: profile.id || item.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar,
          title: profile.title,
          language: profile.language,
          location: profile.location,
          username: profile.username,
          roles: profile.roles,
        }
      })
    } catch {
      return []
    }
  })

  const { data: friendRequests, refresh: refreshRequests } = useAsyncData<FriendRequest[] | undefined>('friends:requests', async () => {
    try {
      const rows = await readItems('friend_requests', {
        fields: ['*', { requester: ['*'], addressee: ['*'] }],
        sort: ['-date_created'],
        limit: 50,
      })
      if (!Array.isArray(rows)) return []
      return rows.map((item: any) => {
        const requester = item.requester || item.requester_id || {}
        const addressee = item.addressee || item.addressee_id || {}
        return {
          id: item.id,
          requester: {
            id: requester.id,
            first_name: requester.first_name,
            last_name: requester.last_name,
            name: requester.name,
            email: requester.email,
            avatar: requester.avatar,
            title: requester.title,
            language: requester.language,
            location: requester.location,
            username: requester.username,
            roles: requester.roles,
          },
          addressee: {
            id: addressee.id,
            first_name: addressee.first_name,
            last_name: addressee.last_name,
            name: addressee.name,
            email: addressee.email,
            avatar: addressee.avatar,
            title: addressee.title,
            language: addressee.language,
            location: addressee.location,
            username: addressee.username,
            roles: addressee.roles,
          },
          status: item.status || 'pending',
          created_at: item.date_created,
          updated_at: item.date_updated,
          message: item.message,
        }
      })
    } catch {
      return []
    }
  })

  const { data: suggestions, refresh: refreshSuggestions } = useAsyncData<FriendSuggestion[] | undefined>('friends:suggestions', async () => {
    try {
      const rows = await readItems('friend_suggestions', {
        fields: ['*', { profile: ['*'] }],
        limit: 20,
      })
      if (!Array.isArray(rows)) return []
      return rows.map((item: any) => {
        const profile = item.profile || item.profiles_id || item.user || {}
        return {
          id: item.id,
          profile: {
            id: profile.id,
            first_name: profile.first_name,
            last_name: profile.last_name,
            name: profile.name,
            email: profile.email,
            avatar: profile.avatar,
            title: profile.title,
            language: profile.language,
            location: profile.location,
            username: profile.username,
            roles: profile.roles,
          },
          mutual_friends: item.mutual_friends,
          reason: item.reason,
          score: item.score,
        }
      })
    } catch {
      return []
    }
  })

  const { data: members, refresh: refreshMembers } = useAsyncData<Member[] | undefined>('friends:members', async () => {
    try {
      const rows = await readItems('profiles', {
        fields: ['*', { '*': ['*'] }],
        limit: 50,
      })
      if (!Array.isArray(rows)) return []
      return rows.map((item: any) => {
        const user = item.directus_users_id || item.user || item
        return {
          id: item.id || user.id,
          profile: {
            id: user.id || item.id,
            first_name: user.first_name || item.first_name,
            last_name: user.last_name || item.last_name,
            name: user.name || item.name,
            email: user.email || item.email,
            avatar: user.avatar || item.avatar,
            title: user.title || item.title,
            language: user.language || item.language,
            location: user.location || item.location,
            username: user.username || item.username,
            roles: user.roles || item.roles,
          },
          role: item.role || user.roles?.[0] || 'member',
          joined_at: item.date_created,
          status: item.status || 'active',
        }
      })
    } catch {
      return []
    }
  })

  const reloadData = async () => {
    await Promise.all([refreshBar(), refreshPage(), refreshFollowers(), refreshRequests(), refreshSuggestions(), refreshMembers()])
  }

  return {
    friendBar,
    friendsPage,
    followers,
    friendRequests,
    suggestions,
    members,
    reloadData,
  }
}