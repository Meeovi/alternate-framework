import type {
	CreatePostInputDTO,
	CreatePostOutputDTO,
	FollowInputDTO,
	FollowOutputDTO,
	GetFeedInputDTO,
	GetFeedOutputDTO,
	NormalizedSocialProviderFeedDTO,
	UnfollowInputDTO,
	UnfollowOutputDTO,
} from './social.dto'

export const SOCIAL_CONTRACT_INVARIANTS = [
	'Social actor and target IDs must be UUID strings.',
	'Social feed responses must include pagination metadata.',
	'Social post content must be sanitized and bounded.',
	'Social capability must enforce ACL checks before adapter calls.',
	'Social output must not include provider-specific fields.',
] as const

export interface SocialCapabilityContract {
	follow(input: FollowInputDTO): Promise<FollowOutputDTO>
	unfollow(input: UnfollowInputDTO): Promise<UnfollowOutputDTO>
	getFeed(input: GetFeedInputDTO): Promise<GetFeedOutputDTO>
	createPost(input: CreatePostInputDTO): Promise<CreatePostOutputDTO>
}

export interface SocialAdapterContract {
	readonly providerName: string
	follow(input: FollowInputDTO): Promise<FollowOutputDTO>
	unfollow(input: UnfollowInputDTO): Promise<UnfollowOutputDTO>
	getFeed(input: GetFeedInputDTO): Promise<NormalizedSocialProviderFeedDTO>
	createPost(input: CreatePostInputDTO): Promise<CreatePostOutputDTO>
}
