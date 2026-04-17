#!/usr/bin/env node
import { writeFile } from 'node:fs/promises'

const baseUrl = process.env.FEED_BASE_URL || 'http://localhost:5314'
const feedPath = process.env.FEED_PATH || '/feed.xml'
const outputFile = process.env.FEED_OUTPUT_FILE || 'feed.xml'

async function run() {
  const url = new URL(feedPath, baseUrl).toString()
  const response = await fetch(url, {
    headers: {
      accept: 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.1',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }

  const xml = await response.text()
  if (!xml.trim().startsWith('<?xml')) {
    throw new Error(`Response from ${url} does not look like XML`)
  }

  await writeFile(outputFile, xml, 'utf8')
  console.log(`Wrote ${outputFile} from ${url}`)
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
