# @mframework/wikipedia-news

News for a Meeovi space, taken from Wikipedia's [Current events portal](https://en.wikipedia.org/wiki/Portal:Current_events). Each event listed there becomes a note in the space ("Meeovi News" by default):

- **Title:** the event's topic, such as "2026 Toledo train collision". An event listed without a topic gets the start of its sentence instead.
- **Text:** the event's sentence, with its links to Wikipedia articles.
- **Sources:** the news reports Wikipedia cites (AP, Reuters, BBC News…), linked.
- **Credit:** a line naming Wikipedia's Current events portal, with the day's page and the licence, CC BY-SA 4.0. The licence requires that credit, so don't remove it.
- **Picture:** the lead image of the topic's Wikipedia article, when it has one.
- **Tags:** its section ("Disasters and accidents", "Sports"…) and #news.

Running the import again adds only events it hasn't added before. An event is recognised by its day, topic and first source, which every imported note keeps in `link_preview`.

Each note gets a unique slug, `news-<day>-<hash>`. News titles repeat (the same topic on two days), so slugs made from titles would collide. Until 29 October 2026, the Directus flow "[Website] Slugify" replaced every new note's slug with one made from its title. It now keeps a slug it's given. The importer still checks each run's slugs at the end and puts back any that changed, in case such a flow comes back.

Wikinews was the first choice, but the Wikimedia Foundation closed it in spring 2026. Its archive still exists, but nothing new is published there.

## Set-up

1. The app registers the module by name: `modules: ['@mframework/wikipedia-news']`, plus the workspace dependency. meeovi-frontend does both.
2. The space must exist in Directus, with slug `meeovi-news` by default.
3. The app's Directus token (`runtimeConfig.directus.token`) must be able to:
   - read `spaces`;
   - read and create `posts` and `tags`;
   - create the posts' links to spaces and tags (`spaces_posts`, `tags_posts`).

## Running it

- **By hand (admins):** `POST /api/admin/wikipedia-news/import` with an optional body `{ "days": 2, "limit": 50 }`. It returns `{ added, skipped, days, errors }`. `days` counts back from today, today included, up to 14.
- **On a schedule:** set `NUXT_WIKIPEDIA_NEWS_INTERVAL_MINUTES` (or `WIKIPEDIA_NEWS_INTERVAL_MINUTES` at build time) to the number of minutes between runs, at least 15. The first run is a minute after start-up. **Turn it on for one site only.** The demo and meeovi.com share a Directus, so both would import at the same moment and could add an event twice.

## Options (`wikipediaNews` in nuxt.config)

| Option | Default | |
|---|---|---|
| `space` | `meeovi-news` (`WIKIPEDIA_NEWS_SPACE`) | Slug of the space the notes go in |
| `author` | `Meeovi News` | Name the notes are shown under |
| `days` | 2 | Days each run looks at |
| `limit` | 50 | Most notes one run adds |
| `intervalMinutes` | 0 (off) | Minutes between scheduled runs |
| `api` | `https://en.wikipedia.org/w/api.php` | Another language's Wikipedia works if its portal uses the same format |
| `userAgent` | Meeovi, with a contact | Wikimedia asks every API client to name itself |

## Tests

`npm test` runs the parser against a real day (`test/fixtures/2026_October_28.wikitext`) and runs the importer against a fake Directus.
