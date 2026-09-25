import { ref, type Ref } from 'vue'
import type { mastodon } from '../../clients/mastodon'

export interface RelationshipToolsDeps {
  currentUser: { value: unknown }
  useFederationClient: () => mastodon.rest.Client
  useFederation: () => { client: { value: mastodon.rest.Client } }
  openConfirmDialog: (options: Record<string, unknown>) => Promise<{ choice: string, extraOptions?: any }>
  t: (key: string, params?: any[]) => string
  getServerName: (account: mastodon.v1.Account) => string
}

export interface RelationshipTools {
  useRelationship: (account: mastodon.v1.Account) => Ref<mastodon.v1.Relationship | undefined>
  toggleFollowAccount: (relationship: mastodon.v1.Relationship, account: mastodon.v1.Account) => Promise<void>
  toggleMuteAccount: (relationship: mastodon.v1.Relationship, account: mastodon.v1.Account) => Promise<void>
  toggleBlockAccount: (relationship: mastodon.v1.Relationship, account: mastodon.v1.Account) => Promise<void>
  toggleBlockDomain: (relationship: mastodon.v1.Relationship, account: mastodon.v1.Account) => Promise<void>
}

export function createRelationshipTools(deps: RelationshipToolsDeps): RelationshipTools {
  const requestedRelationships = new Map<string, Ref<mastodon.v1.Relationship | undefined>>()
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined

  async function fetchRelationships() {
    const requested = Array.from(requestedRelationships.entries()).filter(([, relationshipRef]) => !relationshipRef.value)
    const ids = requested.map(([id]) => id)
    if (!ids.length)
      return

    const relationships = await deps.useFederationClient().v1.accounts.relationships.fetch({ id: ids })
    for (const relationship of relationships) {
      const requestedToUpdate = requested.find(([id]) => id === relationship.id)
      if (!requestedToUpdate)
        continue
      requestedToUpdate[1].value = relationship
    }
  }

  function useRelationship(account: mastodon.v1.Account): Ref<mastodon.v1.Relationship | undefined> {
    if (!deps.currentUser.value)
      return ref()

    const existing = requestedRelationships.get(account.id)
    if (existing)
      return existing

    const relationship = ref<mastodon.v1.Relationship | undefined>()
    requestedRelationships.set(account.id, relationship)

    if (timeoutHandle)
      clearTimeout(timeoutHandle)

    timeoutHandle = setTimeout(() => {
      timeoutHandle = undefined
      fetchRelationships().catch(() => {})
    }, 100)

    return relationship
  }

  async function toggleFollowAccount(relationship: mastodon.v1.Relationship, account: mastodon.v1.Account) {
    const { client } = deps.useFederation()

    const unfollow = relationship.following || relationship.requested

    if (unfollow) {
      const confirmUnfollow = await deps.openConfirmDialog({
        title: deps.t('confirm.unfollow.title'),
        description: deps.t('confirm.unfollow.description', [`@${account.acct}`]),
        confirm: deps.t('confirm.unfollow.confirm'),
        cancel: deps.t('confirm.unfollow.cancel'),
      })
      if (confirmUnfollow.choice !== 'confirm')
        return
    }

    if (unfollow) {
      relationship.following = false
      relationship.requested = false
    }
    else if (account.locked) {
      relationship.requested = true
    }
    else {
      relationship.following = true
    }

    await client.value.v1.accounts.$select(account.id)[unfollow ? 'unfollow' : 'follow']()
  }

  async function toggleMuteAccount(relationship: mastodon.v1.Relationship, account: mastodon.v1.Account) {
    const { client } = deps.useFederation()

    let duration = 0
    let notifications = true

    if (!relationship.muting) {
      const confirmMute = await deps.openConfirmDialog({
        title: deps.t('confirm.mute_account.title'),
        description: deps.t('confirm.mute_account.description', [account.acct]),
        confirm: deps.t('confirm.mute_account.confirm'),
        cancel: deps.t('confirm.mute_account.cancel'),
        extraOptionType: 'mute',
      })
      if (confirmMute.choice !== 'confirm')
        return

      duration = confirmMute.extraOptions?.mute?.duration ?? 0
      notifications = confirmMute.extraOptions?.mute?.notifications ?? true
    }

    relationship.muting = !relationship.muting
    if (relationship.muting) {
      await client.value.v1.accounts.$select(account.id).mute({ duration, notifications })
    }
    else {
      await client.value.v1.accounts.$select(account.id).unmute()
    }
  }

  async function toggleBlockAccount(relationship: mastodon.v1.Relationship, account: mastodon.v1.Account) {
    const { client } = deps.useFederation()

    if (!relationship.blocking) {
      const confirmBlock = await deps.openConfirmDialog({
        title: deps.t('confirm.block_account.title'),
        description: deps.t('confirm.block_account.description', [account.acct]),
        confirm: deps.t('confirm.block_account.confirm'),
        cancel: deps.t('confirm.block_account.cancel'),
      })
      if (confirmBlock.choice !== 'confirm')
        return
    }

    relationship.blocking = !relationship.blocking
    await client.value.v1.accounts.$select(account.id)[relationship.blocking ? 'block' : 'unblock']()
  }

  async function toggleBlockDomain(relationship: mastodon.v1.Relationship, account: mastodon.v1.Account) {
    const { client } = deps.useFederation()
    const domain = deps.getServerName(account)

    if (!relationship.domainBlocking) {
      const confirmDomainBlock = await deps.openConfirmDialog({
        title: deps.t('confirm.block_domain.title'),
        description: deps.t('confirm.block_domain.description', [domain]),
        confirm: deps.t('confirm.block_domain.confirm'),
        cancel: deps.t('confirm.block_domain.cancel'),
        extraOptionType: 'block_domain',
        domainToBlock: domain,
      })
      if (confirmDomainBlock.choice !== 'confirm')
        return
    }

    relationship.domainBlocking = !relationship.domainBlocking
    await client.value.v1.domainBlocks[relationship.domainBlocking ? 'create' : 'remove']({ domain: domain || '' })
  }

  return {
    useRelationship,
    toggleFollowAccount,
    toggleMuteAccount,
    toggleBlockAccount,
    toggleBlockDomain,
  }
}
