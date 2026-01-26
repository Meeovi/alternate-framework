import { RichText } from '@atproto/api'

// creating richtext
const rt = new RichText({
  text: 'Hello @alice.com, check out this link: https://example.com',
})
await rt.detectFacets(agent) // automatically detects mentions and links
const postRecord = {
  $type: 'app.bsky.feed.post',
  text: rt.text,
  facets: rt.facets,
  createdAt: new Date().toISOString(),
}

// rendering as markdown
let markdown = ''
for (const segment of rt.segments()) {
  if (segment.isLink()) {
    markdown += `[${segment.text}](${segment.link?.uri})`
  } else if (segment.isMention()) {
    markdown += `[${segment.text}](https://my-bsky-app.com/user/${segment.mention?.did})`
  } else {
    markdown += segment.text
  }
}

// calculating string lengths
const rt2 = new RichText({ text: 'Hello' })
console.log(rt2.length) // => 5
console.log(rt2.graphemeLength) // => 5
const rt3 = new RichText({ text: '👨‍👩‍👧‍👧' })
console.log(rt3.length) // => 25
console.log(rt3.graphemeLength) // => 1