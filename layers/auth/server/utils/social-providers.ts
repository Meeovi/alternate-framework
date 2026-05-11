type SocialProviderConfig = Record<string, Record<string, any>>

const pickFirst = (...values: Array<string | undefined | null>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }
  return ''
}

const has = (...values: Array<string | undefined | null>) => values.every((value) => !!pickFirst(value))

export const getBetterAuthSocialProviders = (): SocialProviderConfig => {
  const providers: SocialProviderConfig = {}

  const githubClientId = pickFirst(
    process.env.GITHUB_CLIENT_ID,
    process.env.NUXT_GH_CLIENT_ID,
    process.env.GH_CLIENT_ID,
  )
  const githubClientSecret = pickFirst(
    process.env.GITHUB_CLIENT_SECRET,
    process.env.NUXT_GH_CLIENT_SECRET,
    process.env.GH_CLIENT_SECRET,
  )
  if (has(githubClientId, githubClientSecret)) {
    providers.github = {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    }
  }

  const googleClientId = pickFirst(process.env.GOOGLE_CLIENT_ID, process.env.NUXT_GOOGLE_CLIENT_ID)
  const googleClientSecret = pickFirst(
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NUXT_GOOGLE_CLIENT_SECRET,
  )
  if (has(googleClientId, googleClientSecret)) {
    providers.google = {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }
  }

  const microsoftClientId = pickFirst(process.env.MS_APP_ID, process.env.MICROSOFT_CLIENT_ID)
  const microsoftClientSecret = pickFirst(process.env.MS_CLIENT_SECRET, process.env.MICROSOFT_CLIENT_SECRET)
  const microsoftTenantId = pickFirst(process.env.MS_TENANT_ID, process.env.MICROSOFT_TENANT_ID)
  if (has(microsoftClientId, microsoftClientSecret, microsoftTenantId)) {
    providers.microsoft = {
      clientId: microsoftClientId,
      clientSecret: microsoftClientSecret,
      tenantId: microsoftTenantId,
    }
  }

  const twitterClientId = pickFirst(
    process.env.TWITTER_CLIENT_ID,
    process.env.X_CLIENT_ID,
    process.env.NUXT_TWITTER_CLIENT_ID,
  )
  const twitterClientSecret = pickFirst(
    process.env.TWITTER_CLIENT_SECRET,
    process.env.X_CLIENT_SECRET,
    process.env.NUXT_TWITTER_CLIENT_SECRET,
  )
  if (has(twitterClientId, twitterClientSecret)) {
    providers.twitter = {
      clientId: twitterClientId,
      clientSecret: twitterClientSecret,
    }
  }

  const discordClientId = pickFirst(process.env.DISCORD_CLIENT_ID, process.env.NUXT_DISCORD_CLIENT_ID)
  const discordClientSecret = pickFirst(
    process.env.DISCORD_CLIENT_SECRET,
    process.env.NUXT_DISCORD_CLIENT_SECRET,
  )
  if (has(discordClientId, discordClientSecret)) {
    providers.discord = {
      clientId: discordClientId,
      clientSecret: discordClientSecret,
    }
  }

  return providers
}

export const getSupportedSocialProviderIds = (): string[] => Object.keys(getBetterAuthSocialProviders())
