import type { SitemapUrl } from '@nuxtjs/sitemap'
import { useLocalizationAdapter } from 'alternate-sdk/localization'

export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.siteUrl
  const localization = useLocalizationAdapter()
  const localeDefinitions = await localization.getLocales()
  const locales = localeDefinitions.map((locale: { code: string }) => locale.code)
  const isoLocales = Object.fromEntries(
    localeDefinitions.map((locale: { code: string; iso?: string }) => ([locale.code, locale.iso || locale.code]))
  ) as Record<string, string>

  // Example: Fetch data for each locale
  const apiQueries = locales.map((locale: any) =>
    $fetch(`${config.public.apiEndpoint}/sitemap/${locale}/products`)
  )

  const sitemaps = await Promise.all(apiQueries) as any[]

  return sitemaps.flat().map((entry: { locale: string | number; url: any; alternates: any[] }) => ({
    // explicit sitemap mapping
    _sitemap: isoLocales[String(entry.locale)],
    loc: `${baseUrl}/${entry.locale}/product/${entry.url}`,
    alternatives: entry.alternates?.map((alt: { locale: string | number; url: any }) => ({
      hreflang: isoLocales[String(alt.locale)] || String(alt.locale),
      href: `${baseUrl}/${alt.locale}/product/${alt.url}`
    }))
  } satisfies SitemapUrl))
})
