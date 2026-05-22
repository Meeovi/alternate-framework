<template>
  <v-container fluid class="pa-0 profile-page bg-background">
    <v-sheet class="cover-wrap" color="surface-variant" rounded="0">
      <v-img
        :src="coverImage"
        class="cover-image"
        cover
        gradient="to bottom, rgba(0,0,0,.12), rgba(0,0,0,.45)"
      >
        <div class="cover-actions">
          <v-btn variant="tonal" color="white" prepend-icon="fas fa-gear" to="/u/settings">
            Edit Profile
          </v-btn>
        </div>
      </v-img>
    </v-sheet>

    <v-container class="profile-head px-4 px-md-8">
      <v-row align="end" class="ma-0">
        <v-avatar size="168" class="profile-avatar" border="lg">
          <v-img :src="avatarUrl" :alt="displayName" cover />
        </v-avatar>

        <div class="profile-meta ml-4 mb-3">
          <h1 class="text-h4 font-weight-bold mb-1">{{ displayName }}</h1>
          <div class="text-medium-emphasis">{{ userEmail }}</div>
          <div v-if="profileLoadError" class="text-caption text-error mt-1">{{ profileLoadError }}</div>
        </div>

        <v-spacer />

        <div class="mb-3 d-flex ga-2">
          <v-btn variant="tonal" prepend-icon="fas fa-circle-half-stroke" @click="toggleTheme">
            {{ isDark ? 'Dark' : 'Light' }} Mode
          </v-btn>
          <v-btn color="primary" prepend-icon="fas fa-user-pen" to="/u/settings">
            Update Profile
          </v-btn>
          <v-btn variant="outlined" prepend-icon="fas fa-right-from-bracket" @click="signOut">
            Logout
          </v-btn>
        </div>
      </v-row>

      <v-tabs v-model="tab" class="mt-4" color="primary" grow>
        <v-tab value="timeline">Timeline</v-tab>
        <v-tab value="about">About</v-tab>
        <v-tab value="commerce">Commerce</v-tab>
        <v-tab value="social">Social</v-tab>
      </v-tabs>
    </v-container>

    <v-container class="px-4 px-md-8 pb-8">
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="timeline">
          <v-row>
            <v-col cols="12" md="4">
              <v-card>
                <v-card-title>Intro</v-card-title>
                <v-card-text>
                  <div class="mb-2"><strong>Email:</strong> {{ userEmail }}</div>
                  <div class="mb-2"><strong>Member ID:</strong> {{ userId }}</div>
                  <div><strong>Role:</strong> {{ userRole }}</div>
                </v-card-text>
              </v-card>

              <v-card class="mt-4">
                <v-card-title>Manage</v-card-title>
                <v-card-text class="d-flex flex-column ga-2">
                  <v-btn variant="outlined" prepend-icon="fas fa-gift" to="/product/showcases">
                    Gift Cards
                  </v-btn>
                  <v-btn variant="outlined" prepend-icon="fas fa-repeat" to="/product/showcases">
                    Subscriptions
                  </v-btn>
                  <v-btn variant="outlined" prepend-icon="fas fa-pen" to="/connect/compose">
                    Create Post
                  </v-btn>
                  <v-btn variant="outlined" prepend-icon="fas fa-users" to="/connect">
                    Manage Spaces
                  </v-btn>
                  <v-btn variant="outlined" prepend-icon="fas fa-hashtag" to="/connect/hashtags">
                    Hashtags
                  </v-btn>
                  <v-btn variant="outlined" prepend-icon="fas fa-calendar" to="/connect">
                    Events
                  </v-btn>
                  <v-btn v-if="isSeller" variant="outlined" prepend-icon="fas fa-store" to="/shops">
                    My Shop
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="8">
              <v-card>
                <v-card-title>Create Post</v-card-title>
                <v-card-text>
                  <v-textarea
                    v-model="composerText"
                    rows="3"
                    placeholder="What's on your mind?"
                    variant="solo-filled"
                    hide-details
                    readonly
                    @click="navigateTo('/connect/compose')"
                  />

                  <div class="d-flex flex-wrap ga-2 mt-3">
                    <v-btn color="primary" prepend-icon="fas fa-pen" to="/connect/compose">Write Post</v-btn>
                    <v-btn variant="tonal" prepend-icon="fas fa-users" to="/connect">Create/Manage Space</v-btn>
                    <v-btn variant="tonal" prepend-icon="fas fa-table-list" to="/connect">Open Timeline</v-btn>
                  </div>
                </v-card-text>
              </v-card>

              <v-card class="mt-4">
                <v-card-title>Recent Posts</v-card-title>
                <v-card-text>
                  <template v-if="socialPostsAvailable && socialPosts.length">
                    <v-list density="comfortable">
                      <v-list-item
                        v-for="post in socialPosts"
                        :key="post.id"
                        :title="post.title || post.name || `Post #${post.id}`"
                        :subtitle="post.slug || post.date_created || ''"
                        prepend-icon="fas fa-pen"
                        :to="post.slug ? `/connect/post/${post.slug}` : '/connect'"
                      />
                    </v-list>
                  </template>
                  <template v-else>
                    <div class="text-medium-emphasis">{{ socialPostsMessage }}</div>
                  </template>
                </v-card-text>
              </v-card>

              <v-row class="mt-1">
                <v-col cols="12" md="6">
                  <v-card>
                    <v-card-title class="d-flex align-center justify-space-between">
                      <span>My Spaces</span>
                      <v-btn size="small" variant="text" to="/connect">See all</v-btn>
                    </v-card-title>
                    <v-card-text>
                      <template v-if="spacesAvailable && spaces.length">
                        <v-list density="comfortable">
                          <v-list-item
                            v-for="space in spaces.slice(0, 3)"
                            :key="space.id"
                            :title="space.title || space.name || `Space #${space.id}`"
                            :subtitle="space.slug || space.date_created || ''"
                            prepend-icon="fas fa-users"
                            :to="space.slug ? `/connect/space/${space.slug}` : '/connect'"
                          />
                        </v-list>
                      </template>
                      <template v-else>
                        <div class="text-medium-emphasis">{{ spacesMessage }}</div>
                      </template>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card>
                    <v-card-title class="d-flex align-center justify-space-between">
                      <span>Hashtags</span>
                      <v-btn size="small" variant="text" to="/connect/hashtags">See all</v-btn>
                    </v-card-title>
                    <v-card-text>
                      <template v-if="hashtagsAvailable && hashtags.length">
                        <v-list density="comfortable">
                          <v-list-item
                            v-for="tag in hashtags.slice(0, 4)"
                            :key="tag.id || tag.slug || tag.name"
                            :title="tag.name || tag.slug || 'Hashtag'"
                            :subtitle="tag.description || ''"
                            prepend-icon="fas fa-hashtag"
                            :to="tag.slug ? `/connect/hashtag/${tag.slug}` : '/connect/hashtags'"
                          />
                        </v-list>
                      </template>
                      <template v-else>
                        <div class="text-medium-emphasis">{{ hashtagsMessage }}</div>
                      </template>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-row class="mt-1">
                <v-col cols="12" md="6">
                  <v-card>
                    <v-card-title class="d-flex align-center justify-space-between">
                      <span>Events</span>
                      <v-btn size="small" variant="text" to="/connect">See all</v-btn>
                    </v-card-title>
                    <v-card-text>
                      <template v-if="eventsAvailable && events.length">
                        <v-list density="comfortable">
                          <v-list-item
                            v-for="event in events.slice(0, 4)"
                            :key="event.id || event.slug || event.name"
                            :title="event.name || event.title || `Event #${event.id}`"
                            :subtitle="event.slug || event.date_created || ''"
                            prepend-icon="fas fa-calendar"
                            :to="event.slug ? `/connect/event/${event.slug}` : '/connect'"
                          />
                        </v-list>
                      </template>
                      <template v-else>
                        <div class="text-medium-emphasis">{{ eventsMessage }}</div>
                      </template>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col v-if="isSeller" cols="12" md="6">
                  <v-card>
                    <v-card-title class="d-flex align-center justify-space-between">
                      <span>Shop</span>
                      <v-btn size="small" variant="text" to="/shops">Open Shop Hub</v-btn>
                    </v-card-title>
                    <v-card-text>
                      <template v-if="isSeller && shopsAvailable && shops.length">
                        <v-list density="comfortable">
                          <v-list-item
                            v-for="shop in shops.slice(0, 3)"
                            :key="shop.id || shop.slug || shop.name"
                            :title="shop.name || `Shop #${shop.id}`"
                            :subtitle="shop.slug || shop.date_created || ''"
                            prepend-icon="fas fa-store"
                            :to="shop.slug ? `/shop/${shop.slug}` : '/shops'"
                          />
                        </v-list>
                      </template>
                      <template v-else-if="isSeller">
                        <div class="text-medium-emphasis">{{ shopsMessage }}</div>
                        <v-btn class="mt-3" color="primary" prepend-icon="fas fa-store" to="/shops">Create / Manage Shop</v-btn>
                      </template>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-tabs-window-item>

        <v-tabs-window-item value="about">
          <v-card>
            <v-card-title>About {{ displayName }}</v-card-title>
            <v-card-text>
              <v-list lines="two" density="comfortable">
                <v-list-item title="Full Name" :subtitle="displayName" prepend-icon="fas fa-id-badge" />
                <v-list-item title="Email" :subtitle="userEmail" prepend-icon="fas fa-envelope" />
                <v-list-item title="Role" :subtitle="userRole" prepend-icon="fas fa-shield" />
              </v-list>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>

        <v-tabs-window-item value="commerce">
          <v-row>
            <v-col cols="12" md="6">
              <v-card>
                <v-card-title class="d-flex align-center justify-space-between">
                  <span>Gift Cards</span>
                  <v-chip size="small" :color="giftCardsAvailable ? 'success' : 'warning'" variant="tonal">
                    {{ giftCardsAvailable ? 'Available' : 'Unavailable' }}
                  </v-chip>
                </v-card-title>
                <v-card-text>
                  <div class="d-flex ga-2 mb-3">
                    <v-btn variant="outlined" prepend-icon="fas fa-gift" to="/product/showcases">Browse Gift Cards</v-btn>
                  </div>
                  <template v-if="giftCardsAvailable && giftCards.length">
                    <v-list density="comfortable">
                      <v-list-item
                        v-for="card in giftCards"
                        :key="card.code || card.id"
                        :title="card.code || 'Gift Card'"
                        :subtitle="card.balanceLabel || card.balance || '-'"
                        prepend-icon="fas fa-gift"
                        to="/product/showcases"
                      />
                    </v-list>
                  </template>
                  <template v-else>
                    <div class="text-medium-emphasis">{{ giftCardsMessage }}</div>
                  </template>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card>
                <v-card-title class="d-flex align-center justify-space-between">
                  <span>Subscriptions</span>
                  <v-chip size="small" :color="subscriptionsAvailable ? 'success' : 'warning'" variant="tonal">
                    {{ subscriptionsAvailable ? 'Available' : 'Unavailable' }}
                  </v-chip>
                </v-card-title>
                <v-card-text>
                  <div class="d-flex ga-2 mb-3">
                    <v-btn variant="outlined" prepend-icon="fas fa-repeat" to="/product/showcases">View Plans</v-btn>
                  </div>
                  <template v-if="subscriptionsAvailable && subscriptions.length">
                    <v-list density="comfortable">
                      <v-list-item
                        v-for="sub in subscriptions"
                        :key="sub.id || sub.reference"
                        :title="sub.name || sub.plan || `Subscription #${sub.id || '-'}`"
                        :subtitle="sub.status || 'Active'"
                        prepend-icon="fas fa-repeat"
                        :to="sub.id ? `/subscription/${sub.id}` : '/product/showcases'"
                      />
                    </v-list>
                  </template>
                  <template v-else>
                    <div class="text-medium-emphasis">{{ subscriptionsMessage }}</div>
                  </template>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-tabs-window-item>

        <v-tabs-window-item value="social">
          <v-row>
            <v-col cols="12" md="6">
              <v-card>
                <v-card-title class="d-flex align-center justify-space-between">
                  <span>My Posts</span>
                  <v-chip size="small" :color="socialPostsAvailable ? 'success' : 'warning'" variant="tonal">
                    {{ socialPostsAvailable ? 'Available' : 'Unavailable' }}
                  </v-chip>
                </v-card-title>
                <v-card-text>
                  <div class="d-flex ga-2 mb-3">
                    <v-btn variant="outlined" prepend-icon="fas fa-pen" to="/connect/compose">Add Post</v-btn>
                    <v-btn variant="outlined" prepend-icon="fas fa-table-list" to="/connect">Timeline</v-btn>
                  </div>
                  <template v-if="socialPostsAvailable && socialPosts.length">
                    <v-list density="comfortable">
                      <v-list-item
                        v-for="post in socialPosts"
                        :key="post.id"
                        :title="post.title || post.name || `Post #${post.id}`"
                        :subtitle="post.slug || post.date_created || ''"
                        prepend-icon="fas fa-pen"
                        :to="post.slug ? `/connect/post/${post.slug}` : '/connect'"
                      />
                    </v-list>
                  </template>
                  <template v-else>
                    <div class="text-medium-emphasis">{{ socialPostsMessage }}</div>
                  </template>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card>
                <v-card-title class="d-flex align-center justify-space-between">
                  <span>My Spaces</span>
                  <v-chip size="small" :color="spacesAvailable ? 'success' : 'warning'" variant="tonal">
                    {{ spacesAvailable ? 'Available' : 'Unavailable' }}
                  </v-chip>
                </v-card-title>
                <v-card-text>
                  <div class="d-flex ga-2 mb-3">
                    <v-btn variant="outlined" prepend-icon="fas fa-users" to="/connect">Browse Spaces</v-btn>
                  </div>
                  <template v-if="spacesAvailable && spaces.length">
                    <v-list density="comfortable">
                      <v-list-item
                        v-for="space in spaces"
                        :key="space.id"
                        :title="space.title || space.name || `Space #${space.id}`"
                        :subtitle="space.slug || space.date_created || ''"
                        prepend-icon="fas fa-users"
                        :to="space.slug ? `/connect/space/${space.slug}` : '/connect'"
                      />
                    </v-list>
                  </template>
                  <template v-else>
                    <div class="text-medium-emphasis">{{ spacesMessage }}</div>
                  </template>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'

const runtimeUseAuth = (globalThis as any).useAuth as (() => any) | undefined
const auth = runtimeUseAuth
  ? runtimeUseAuth()
  : {
      user: useState<any>('social:user', () => null),
      fetchSession: async () => null,
      signOut: async () => null,
    }
const { user, fetchSession, signOut: authSignOut } = auth
const loading = ref(false)
const theme = useTheme()
const nuxtApp = useNuxtApp()
const config = useRuntimeConfig()
const authConfig = (config.public as any)?.auth ?? {}
const token = useCookie<string | null>(authConfig?.cookieName || 'auth-token')

const tab = ref('timeline')
const composerText = ref('')

const profileStorageKey = computed(() => `meeovi:user-profile:${(user.value as any)?.id || 'guest'}`)
const THEME_STORAGE_KEY = 'elite-theme'
const isDark = computed(() => theme.global.name.value === 'dark')

const storedProfile = ref<any>(null)
const customerFallback = ref<any>(null)
const profileLoadError = ref('')

const giftCards = ref<any[]>([])
const subscriptions = ref<any[]>([])
const socialPosts = ref<any[]>([])
const spaces = ref<any[]>([])
const hashtags = ref<any[]>([])
const events = ref<any[]>([])
const shops = ref<any[]>([])

const giftCardsAvailable = ref(false)
const subscriptionsAvailable = ref(false)
const socialPostsAvailable = ref(false)
const spacesAvailable = ref(false)
const hashtagsAvailable = ref(false)
const eventsAvailable = ref(false)
const shopsAvailable = ref(false)

const giftCardsMessage = ref('Gift card data is not exposed by the commerce API.')
const subscriptionsMessage = ref('Subscription data is not exposed by the commerce API.')
const socialPostsMessage = ref('Post data is not available from the content adapter.')
const spacesMessage = ref('Space data is not available from the content adapter.')
const hashtagsMessage = ref('Hashtag data is not available from the content adapter.')
const eventsMessage = ref('Event data is not available from the content adapter.')
const shopsMessage = ref('No shops found for this seller account.')

const isSeller = computed(() => {
  const source = user.value || customerFallback.value || {}
  return Boolean((source as any)?.isSeller || storedProfile.value?.isSeller)
})

watchEffect(() => {
  if (!process.client) return
  const raw = localStorage.getItem(profileStorageKey.value)
  if (!raw) {
    storedProfile.value = null
    return
  }

  try {
    storedProfile.value = JSON.parse(raw)
  } catch {
    storedProfile.value = null
  }
})

const displayName = computed(() => {
  const source = user.value || customerFallback.value || {}
  const first = (source as any)?.firstName || (source as any)?.firstname || ''
  const last = (source as any)?.lastName || (source as any)?.lastname || ''
  const name = (source as any)?.name || ''
  return [first, last].filter(Boolean).join(' ').trim() || name || 'My Profile'
})

const userEmail = computed(() => ((user.value as any)?.email || (customerFallback.value as any)?.email || 'No email'))
const userId = computed(() => ((user.value as any)?.id || (customerFallback.value as any)?.id || '-'))
const userRole = computed(() => ((user.value as any)?.role || 'Customer'))

const avatarUrl = computed(() => {
  const img = (user.value as any)?.profilePicture
    || (user.value as any)?.avatar
    || (user.value as any)?.image
    || storedProfile.value?.avatarUrl
  if (img) return img
  const seed = encodeURIComponent(displayName.value || userEmail.value || 'User')
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`
})

const coverImage = computed(() => {
  return (user.value as any)?.coverImage
    || storedProfile.value?.coverUrl
    || 'https://images.unsplash.com/photo-1496345966270-d173adcbdd0f?auto=format&fit=crop&w=2000&q=80'
})

const loadCustomerFallback = async () => {
  if (!token.value) return

  const response = await $fetch<{ data?: { customer?: any }, errors?: Array<{ message?: string }> }>('/api/graphql', {
    method: 'POST',
    body: {
      query: `
        query ProfileCustomer {
          customer {
            id
            firstname
            lastname
            email
          }
        }
      `,
    },
  }).catch(() => ({ data: null, errors: [{ message: 'Unable to load customer profile' }] }))

  if (response.errors?.length) {
    profileLoadError.value = response.errors[0]?.message || 'Unable to load profile details from customer API'
    return
  }

  customerFallback.value = response.data?.customer || null
  if (customerFallback.value?.id && user.value) {
    user.value.email = user.value.email || customerFallback.value.email || null
    user.value.firstName = user.value.firstName || customerFallback.value.firstname || null
    user.value.lastName = user.value.lastName || customerFallback.value.lastname || null
  }
}

const loadCommerceFeatures = async () => {
  if (!token.value) return

  const giftResponse = await $fetch<{ data?: any, errors?: Array<{ message?: string }> }>('/api/graphql', {
    method: 'POST',
    body: {
      query: `
        query CustomerGiftCards {
          customer {
            gift_cards {
              id
              code
              balance
              balanceLabel
            }
          }
        }
      `,
    },
  }).catch(() => ({ data: null, errors: [{ message: 'Gift cards endpoint unavailable' }] }))

  if (!giftResponse.errors?.length && Array.isArray(giftResponse.data?.customer?.gift_cards)) {
    giftCards.value = giftResponse.data.customer.gift_cards
    giftCardsAvailable.value = true
    giftCardsMessage.value = giftCards.value.length ? '' : 'No gift cards available.'
  }

  const subscriptionResponse = await $fetch<{ data?: any, errors?: Array<{ message?: string }> }>('/api/graphql', {
    method: 'POST',
    body: {
      query: `
        query CustomerSubscriptions {
          customer {
            subscriptions {
              id
              status
              name
              reference
            }
          }
        }
      `,
    },
  }).catch(() => ({ data: null, errors: [{ message: 'Subscriptions endpoint unavailable' }] }))

  if (!subscriptionResponse.errors?.length && Array.isArray(subscriptionResponse.data?.customer?.subscriptions)) {
    subscriptions.value = subscriptionResponse.data.customer.subscriptions
    subscriptionsAvailable.value = true
    subscriptionsMessage.value = subscriptions.value.length ? '' : 'No subscriptions found.'
  }
}

const loadSocialFeatures = async () => {
  const { readItems } = useSdkContentAdapter()

  const currentId = String((user.value as any)?.id || (customerFallback.value as any)?.id || '')
  const currentEmail = String((user.value as any)?.email || (customerFallback.value as any)?.email || '').toLowerCase()

  const collectIdentityValues = (entry: any, depth = 0): string[] => {
    if (entry == null || depth > 2) return []
    if (typeof entry !== 'object') return [String(entry || '').toLowerCase()]

    const values: string[] = []
    const direct = [entry?.id, entry?.email, entry?.username, entry?.user_id, entry?.author, entry?.owner, entry?.created_by, entry?.account]
      .map((value: any) => String(value || '').toLowerCase())
      .filter(Boolean)

    values.push(...direct)

    for (const nested of Object.values(entry)) {
      values.push(...collectIdentityValues(nested, depth + 1))
    }

    return values
  }

  const matchCurrentUser = (entry: any) => {
    const candidates = [
      entry?.user,
      entry?.user_id,
      entry?.author,
      entry?.owner,
      entry?.created_by,
      entry?.email,
      entry?.username,
      entry?.account,
    ]
      .flatMap((value: any) => {
        if (value == null) return []
        return collectIdentityValues(value)
      })
      .map((value: any) => String(value || '').toLowerCase())

    if (!candidates.length) return true
    return candidates.includes(currentId.toLowerCase()) || (currentEmail && candidates.includes(currentEmail))
  }

  const fetchCollection = async (collection: string) => {
    const res = await readItems(collection, {
      limit: 5,
      sort: ['-date_created'],
    })
    return res?.data || res || []
  }

  const fetchEvents = async () => {
    const res = await readItems('products', {
      limit: 8,
      sort: ['-date_created'],
      fields: ['*', { '*': ['*'] }],
      filter: {
        product_type: {
          product_types_id: {
            name: {
              _eq: 'Event',
            },
          },
        },
      },
    })
    const items = res?.data || res || []
    return items.filter((item: any) => {
      const typeName = item?.product_type?.product_types_id?.name || item?.type?.name || item?.type
      return String(typeName || '').toLowerCase() === 'event'
    })
  }

  try {
    const postsData = await fetchCollection('posts')
    const normalized = Array.isArray(postsData) ? postsData : []
    socialPosts.value = normalized.filter(matchCurrentUser)
    socialPostsAvailable.value = true
    socialPostsMessage.value = socialPosts.value.length ? '' : 'No posts found.'
  } catch {
    socialPostsAvailable.value = false
  }

  try {
    const spacesData = await fetchCollection('spaces')
    const normalized = Array.isArray(spacesData) ? spacesData : []
    spaces.value = normalized.filter(matchCurrentUser)
    spacesAvailable.value = true
    spacesMessage.value = spaces.value.length ? '' : 'No spaces found.'
  } catch {
    spacesAvailable.value = false
  }

  try {
    const tagsData = await fetchCollection('hashtags')
    hashtags.value = Array.isArray(tagsData) ? tagsData : []
    hashtagsAvailable.value = true
    hashtagsMessage.value = hashtags.value.length ? '' : 'No hashtags found.'
  } catch {
    hashtagsAvailable.value = false
  }

  try {
    const eventsData = await fetchEvents()
    events.value = Array.isArray(eventsData) ? eventsData : []
    eventsAvailable.value = true
    eventsMessage.value = events.value.length ? '' : 'No events found.'
  } catch {
    eventsAvailable.value = false
  }

  try {
    const shopsData = await fetchCollection('shops')
    const normalized = Array.isArray(shopsData) ? shopsData : []
    shops.value = normalized.filter(matchCurrentUser)
    shopsAvailable.value = true
    shopsMessage.value = shops.value.length ? '' : 'No shops found for your account.'
  } catch {
    shopsAvailable.value = false
  }
}

watchEffect(async () => {
  if (!token.value) {
    await navigateTo('/auth/login')
    return
  }

  if (!user.value?.id && !loading.value) {
    await fetchSession()
  }

  if (!user.value?.email || !user.value?.firstName || !user.value?.lastName) {
    if (!customerFallback.value?.id) {
      await loadCustomerFallback()
    }
  }
})

onMounted(async () => {
  if (!token.value) return
  if (!user.value?.id || !user.value?.email) {
    await loadCustomerFallback()
  }
  await loadCommerceFeatures()
  await loadSocialFeatures()
})

const signOut = async () => {
  await authSignOut({ redirectTo: '/auth/login' })
}

const toggleTheme = () => {
  const next = isDark.value ? 'light' : 'dark'
  theme.change(next)
  if (process.client) {
    localStorage.setItem(THEME_STORAGE_KEY, next)
  }
}

definePageMeta({
  layout: 'nolive',
})
</script>

<style scoped>
.profile-page {
  background: rgb(var(--v-theme-background));
  min-height: 100vh;
}

.cover-wrap {
  width: 100%;
}

.cover-image {
  height: 360px;
}

.cover-actions {
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 20px;
}

.profile-head {
  margin-top: -74px;
  position: relative;
}

.profile-avatar {
  border: 4px solid white;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14);
  background: white;
}

@media (max-width: 960px) {
  .cover-image {
    height: 240px;
  }

  .profile-head {
    margin-top: -54px;
  }

  .profile-avatar {
    width: 120px !important;
    height: 120px !important;
  }
}
</style>
