import { setHeader, defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
  const runtimeConfig = useRuntimeConfig()
  const publicConfig = runtimeConfig.public as any

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <OpenSearchDescription xmlns="http://a9.com">
      <ShortName>${publicConfig.siteName || 'MyNuxtApp'}</ShortName>
      <Description>Search ${publicConfig.siteName || 'MyNuxtApp'} content</Description>
      <InputEncoding>UTF-8</InputEncoding>
      <Url type="text/html" method="get" template="${publicConfig.siteUrl}/search?q={searchTerms}"/>
    </OpenSearchDescription>`

  setHeader(event, 'Content-Type', 'application/xml')
  return xml
})
