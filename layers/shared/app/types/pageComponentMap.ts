// types/pageComponentMap.ts
// Typed mapping for page name/slug -> async component loader
export type PageComponentLoader = () => Promise<any>

const socialFeeds = () => import('../../../social/app/pages/connect/feeds.vue')

export const pageComponentMap: Record<string, PageComponentLoader> = {
	birthdays: () => import('../../../social/app/pages/connect/birthdays.vue'),
	socialbirthdays: () => import('../../../social/app/pages/connect/birthdays.vue'),
	channels: socialFeeds,
	socialchannels: socialFeeds,
	chat: socialFeeds,
	socialchat: socialFeeds,
	directory: socialFeeds,
	socialdirectory: socialFeeds,
	events: () => import('../../../social/app/pages/connect/events.vue'),
	socialevents: () => import('../../../social/app/pages/connect/events.vue'),
	feeds: socialFeeds,
	socialfeeds: socialFeeds,
	friends: () => import('../../../social/app/pages/connect/friends.vue'),
	socialfriends: () => import('../../../social/app/pages/connect/friends.vue'),
	hashtags: () => import('../../../social/app/pages/connect/hashtags.vue'),
	socialhashtags: () => import('../../../social/app/pages/connect/hashtags.vue'),
	invites: socialFeeds,
	socialinvites: socialFeeds,
	media: () => import('../../../social/app/pages/connect/media.vue'),
	socialmedia: () => import('../../../social/app/pages/connect/media.vue'),
	members: () => import('../../../social/app/pages/connect/members.vue'),
	socialmembers: () => import('../../../social/app/pages/connect/members.vue'),
	memories: () => import('../../../social/app/pages/connect/memories.vue'),
	socialmemories: () => import('../../../social/app/pages/connect/memories.vue'),
	messages: socialFeeds,
	socialmessages: socialFeeds,
	radio: () => import('../../../social/app/pages/connect/radio.vue'),
	socialradio: () => import('../../../social/app/pages/connect/radio.vue'),
	rooms: socialFeeds,
	socialrooms: socialFeeds,
	spaces: () => import('../../../social/app/pages/connect/spaces.vue'),
	socialspaces: () => import('../../../social/app/pages/connect/spaces.vue'),
	teams: socialFeeds,
	socialteams: socialFeeds,
	vibez: () => import('../../../social/app/pages/connect/vibez.vue'),
	socialvibez: () => import('../../../social/app/pages/connect/vibez.vue'),
}

export default pageComponentMap
