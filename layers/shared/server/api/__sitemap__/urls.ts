import type { SitemapUrl } from '@nuxtjs/sitemap'

export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.siteUrl
  const i18n = config.public.i18n as { locales: { code: string; iso: string }[] }
  const locales = i18n.locales.map((locale: { code: any }) => locale.code)
  const isoLocales = Object.fromEntries(
    i18n.locales.map((locale: { code: any; iso: any }) => ([locale.code, locale.iso]))
  )

  // Example: Fetch data for each locale
  const apiQueries = locales.map((locale: any) =>
    $fetch(`${config.public.apiEndpoint}/sitemap/${locale}/products`)
  )

  const sitemaps = await Promise.all(apiQueries) as any[]

  return sitemaps.flat().map((entry: { locale: string | number; url: any; alternates: any[] }) => ({
    // explicit sitemap mapping
    _sitemap: isoLocales[entry.locale],
    loc: `${baseUrl}/${entry.locale}/product/${entry.url}`,
    alternatives: entry.alternates?.map((alt: { locale: string | number; url: any }) => ({
      hreflang: isoLocales[alt.locale],
      href: `${baseUrl}/${alt.locale}/product/${alt.url}`
    }))
  } satisfies SitemapUrl))
})
