export interface SocialProfile {
  id: string | number
  first_name?: string
  last_name?: string
  name?: string
  email?: string
  avatar?: string
  avatar_url?: string
  title?: string
  language?: string
  location?: string
  username?: string
  roles?: string[]
}

export interface FriendRequest {
  id: string | number
  requester: SocialProfile
  addressee: SocialProfile
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  created_at?: string
  updated_at?: string
  message?: string
}

export interface FriendSuggestion {
  id: string | number
  profile: SocialProfile
  mutual_friends?: number
  reason?: string
  score?: number
}

export interface Member {
  id: string | number
  profile: SocialProfile
  role?: string
  joined_at?: string
  status?: 'active' | 'inactive' | 'pending'
}

export interface FriendBarConfig {
  name: string
  color: string
  colortext: string
  menus: Array<{ name: string; value: string }>
}
