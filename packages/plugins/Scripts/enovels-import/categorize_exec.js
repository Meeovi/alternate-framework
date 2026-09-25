// Puts every ability, item, place and dictionary entry into its category. `categories` only
// relates to characters and options, so (like the existing Telepathy, Anura, Seals and Skyball)
// each entry gets an option in the matching category; the site lists those by category.
// Also mirrors the characters' ability/item/place links onto character_options, mirrors every
// character<->option link onto the option side (options_characters), and tidies the Types/Level
// options (type set, category linked, dangling junction rows removed).
// Runs inside the container, like import_exec.js:
//
//   docker cp categorize_exec.js novelsDirectus:/tmp/categorize_exec.js
//   docker exec -e MODE=dry|apply novelsDirectus node /tmp/categorize_exec.js > log.json
//
// Idempotent: options are matched by name within their category, links are never duplicated.
const e = process.env
const B = 'http://127.0.0.1:8055'
const MODE = e.MODE === 'apply' ? 'apply' : 'dry'
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '')
const slugify = (s) => String(s).toLowerCase().replace(/[’']/g, '').replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-|-$/g, '')
const isUuid = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s || ''))
const log = { mode: MODE, kind: 'categorize', created: {}, updated: {}, deleted: {}, warnings: [] }
const note = (bucket, key, id) => ((log[bucket][key] ||= []).push(id))
const say = (...a) => console.error(...a)

let token
async function login() {
  const l = await (await fetch(B + '/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: e.ADMIN_EMAIL, password: e.ADMIN_PASSWORD }) })).json()
  if (!l?.data?.access_token) throw new Error('admin login failed')
  token = l.data.access_token
}
async function api(method, path, body, retried = false) {
  const r = await fetch(B + path, { method, headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
  // A long run outlives the access token (15 min); log in again and retry once.
  if (r.status === 401 && !retried) { await login(); return api(method, path, body, true) }
  const j = r.status === 204 ? {} : await r.json()
  if (!r.ok) throw new Error(`${method} ${path} -> ${r.status} ${JSON.stringify(j).slice(0, 400)}`)
  return j.data
}
const all = (c, fields) => api('GET', `/items/${c}?limit=-1&fields=${fields}`)
// The novels DB is remote and slow to commit, so each row costs several round trips (row, junctions,
// activity, revisions): send small batches and log each batch as it lands, so a failed run still
// leaves an accurate rollback log. A 50-row batch could outlast the 5-minute fetch timeout.
// One request at a time by default (PARALLEL=n to change): each write holds one of Directus's 10
// pool connections, and 4 at a time starved the live site's reads ("Timeout acquiring a connection").
async function createBatched(collection, rows, fields = 'id', onRow = (x) => note('created', collection, x.id), size = 10, parallel = Number(e.PARALLEL) || 1) {
  const out = [], batches = []
  for (let i = 0; i < rows.length; i += size) batches.push(rows.slice(i, i + size))
  let next = 0, done = 0
  const worker = async () => {
    while (next < batches.length) {
      const made = await api('POST', `/items/${collection}?fields=${fields}`, batches[next++])
      made.forEach(onRow)
      out.push(...made)
      if (++done % 20 === 0 || done === batches.length) say(`  ${collection}: ${Math.min(done * size, rows.length)}/${rows.length}`)
    }
  }
  await Promise.all(Array.from({ length: Math.min(parallel, batches.length) }, worker))
  return out
}

// Source collection -> the option it becomes. `type` is the options.type value the site checks.
const SOURCES = {
  abilities: { fields: 'id,name,slug,description,image,type', type: 'Abilities', suffix: 'ability',
    cats: (r) => ['Abilities', ...(r.type === 'Monster Ability' ? ['Monster Abilities'] : [])],
    link: ['characters_abilities', 'abilities_id'] },
  items: { fields: 'id,name,slug,description,image', type: 'Items', suffix: 'item', cats: () => ['Items'],
    link: ['items_characters', 'items_id'] },
  places: { fields: 'id,name,slug,description,image,location', type: 'Places', suffix: 'place', cats: () => ['Places'],
    link: ['places_characters', 'places_id'] },
  dictionary: { fields: 'id,name,slug,description,image,type', type: 'Dictionary', suffix: 'definition',
    cats: (r) => ['Dictionary', ...(r.type === 'definition' ? ['Definition'] : [])] },
}
// An option's `type` implies its category (Special Evolve is typed Level but had no category).
const TYPE_CATEGORY = { level: 'Level', type: 'Types', abilities: 'Abilities', places: 'Places', items: 'Items', dictionary: 'Dictionary' }
const CATEGORY_TYPE = { Level: 'Level', Types: 'Type' }
const typesOf = (o) => (Array.isArray(o.type) ? o.type : o.type ? [o.type] : []).map((t) => String(t).trim())

async function run() {
  const catRows = await all('categories', 'id,name')
  const cat = new Map(catRows.map((c) => [c.name, c.id]))
  const needed = [...new Set([...Object.values(TYPE_CATEGORY), ...Object.values(SOURCES).flatMap((s) => s.cats({ type: 'Monster Ability' }).concat(s.cats({ type: 'definition' })))])]
  for (const name of needed.filter((n) => !cat.has(n))) {
    if (MODE === 'apply') { const m = await api('POST', '/items/categories', { name, slug: slugify(name) }); cat.set(name, m.id); note('created', 'categories', m.id) } else cat.set(name, `new:${name}`)
    say(`category "${name}" to create`)
  }

  const options = await all('options', 'id,name,slug,type,status,description,location,image,category.id,category.categories_id')
  const optionStatus = options.find((o) => norm(o.status) === 'published')?.status || 'published'
  const inCat = new Map() // "<category id>|<norm name>" -> option
  const catsOf = new Map(options.map((o) => [o.id, new Set((o.category || []).map((c) => c.categories_id).filter(Boolean))]))
  for (const o of options) for (const c of catsOf.get(o.id)) inCat.set(`${c}|${norm(o.name)}`, o)
  const slugs = new Set(options.map((o) => o.slug))
  const addCats = [], patches = new Map()
  const patch = (o, fields) => patches.set(o.id, { ...(patches.get(o.id) || {}), ...fields })
  // Also indexes the option under that category, so step 3 reuses an option an interrupted run
  // created without its category (step 2 re-links it from its type) instead of duplicating it.
  const wantCat = (o, catId) => {
    if (!inCat.has(`${catId}|${norm(o.name)}`)) inCat.set(`${catId}|${norm(o.name)}`, o)
    if (!catsOf.get(o.id).has(catId)) { catsOf.get(o.id).add(catId); addCats.push({ options_id: o.id, categories_id: catId }) }
  }

  // 1. junction rows pointing at no category (Aqua, Death, Battle… showed a blank category)
  const dangling = options.flatMap((o) => (o.category || []).filter((c) => !c.categories_id).map((c) => c.id))
  if (MODE === 'apply' && dangling.length) { await api('DELETE', '/items/options_categories', dangling); dangling.forEach((id) => note('deleted', 'options_categories', id)) }
  say(`dangling option-category rows: ${dangling.length} to delete`)

  // 2. existing options: category from type, type from category
  for (const o of options) {
    const types = typesOf(o)
    for (const t of types) { const c = TYPE_CATEGORY[t.toLowerCase()]; if (c) wantCat(o, cat.get(c)) }
    if (!types.length) for (const [c, t] of Object.entries(CATEGORY_TYPE)) if (catsOf.get(o.id).has(cat.get(c))) { patch(o, { type: [t] }); break }
  }

  // 3. one option per ability / item / place / dictionary entry
  const optionFor = {} // collection -> Map(source id -> option id or pending slug)
  const toCreate = []
  for (const [collection, s] of Object.entries(SOURCES)) {
    optionFor[collection] = new Map()
    let matched = 0
    for (const r of await all(collection, s.fields)) {
      const cats = s.cats(r).map((n) => cat.get(n))
      const key = `${cats[0]}|${norm(r.name)}`
      let o = inCat.get(key)
      if (o && !o.id) { optionFor[collection].set(r.id, o); continue } // same name already queued this run
      if (o) {
        matched++
        cats.forEach((c) => wantCat(o, c))
        const fill = {}
        if (!typesOf(o).length) fill.type = [s.type]
        if (r.description && !o.description) fill.description = r.description
        if (r.location && !o.location) fill.location = r.location
        if (isUuid(r.image) && !o.image) fill.image = r.image
        if (Object.keys(fill).length) patch(o, fill)
        optionFor[collection].set(r.id, o.id)
        continue
      }
      let slug = slugify(r.slug || r.name) || slugify(`${r.name}-${s.suffix}`)
      if (slugs.has(slug)) { const base = `${slug}-${s.suffix}`; slug = base; for (let n = 2; slugs.has(slug); n++) slug = `${base}-${n}` }
      slugs.add(slug)
      const row = { name: r.name, slug, status: optionStatus, type: [s.type], description: r.description || null,
        ...(r.location ? { location: r.location } : {}), ...(isUuid(r.image) ? { image: r.image } : {}),
        category: cats.map((c) => ({ categories_id: c })) }
      toCreate.push(row)
      inCat.set(key, { slug })
      optionFor[collection].set(r.id, { slug })
    }
    say(`${collection}: ${optionFor[collection].size} entries, ${matched} matched an existing option, ${toCreate.filter((x) => x.type[0] === s.type).length} options to create`)
  }

  say(`existing options: ${addCats.length} category links to add, ${patches.size} to update`)
  if (MODE === 'apply') {
    for (const [id, fields] of patches) { await api('PATCH', `/items/options/${id}`, fields); note('updated', 'options', { id, fields: Object.keys(fields) }) }
    if (addCats.length) await createBatched('options_categories', addCats)
    // Map by returned slug, never by position: Directus doesn't return created rows in request order.
    // Plain rows first, then their category rows: a nested create took minutes per batch on the
    // remote DB. If a run stops in between, the next one re-links those options from their type.
    const bySlug = new Map()
    await createBatched('options', toCreate.map(({ category, ...row }) => row), 'id,slug', (m) => { bySlug.set(m.slug, m.id); note('created', 'options', m.id) })
    const catRows = toCreate.flatMap((row) => row.category.map((c) => ({ options_id: bySlug.get(row.slug), categories_id: c.categories_id })))
    if (catRows.length) await createBatched('options_categories', catRows)
    for (const map of Object.values(optionFor)) for (const [k, v] of map) if (typeof v === 'object') map.set(k, bySlug.get(v.slug))
  }

  // 4. character -> ability/item/place links, mirrored onto character_options
  const have = new Set((await all('characters_options', 'characters_id,options_id')).map((r) => `${r.characters_id}|${r.options_id}`))
  for (const [collection, s] of Object.entries(SOURCES)) {
    if (!s.link) continue
    const [table, fk] = s.link
    const rows = []
    for (const j of await all(table, `characters_id,${fk}`)) {
      const opt = optionFor[collection].get(j[fk])
      if (!j.characters_id || opt == null) continue
      const id = typeof opt === 'object' ? `new:${opt.slug}` : opt
      const k = `${j.characters_id}|${id}`
      if (have.has(k)) continue
      have.add(k)
      rows.push({ characters_id: j.characters_id, options_id: id })
    }
    if (MODE === 'apply' && rows.length) await createBatched('characters_options', rows)
    say(`${collection} -> character_options links: ${rows.length} new`)
  }

  // 5. The option side of the same links. `options.characters` is a separate junction
  //    (options_characters) from `characters.character_options` (characters_options), so without
  //    this an option (Aqua in Types, Battle in Level, an ability…) lists no characters.
  const charSide = await all('characters_options', 'characters_id,options_id')
  const optSide = new Set((await all('options_characters', 'options_id,characters_id')).map((r) => `${r.characters_id}|${r.options_id}`))
  const mirror = []
  for (const r of charSide) {
    const k = `${r.characters_id}|${r.options_id}`
    if (!r.characters_id || !r.options_id || optSide.has(k)) continue
    optSide.add(k)
    mirror.push({ options_id: r.options_id, characters_id: r.characters_id })
  }
  if (MODE === 'apply' && mirror.length) await createBatched('options_characters', mirror)
  say(`options -> characters links: ${mirror.length} new${MODE === 'dry' ? ' (plus the links above, once created)' : ''}`)

  // 6. A character joins the category of each of its options (Aqua -> Types, Battle -> Level, an
  //    ability -> Abilities…), so the category's own Characters field lists them too.
  const optCats = new Map()
  for (const r of await all('options_categories', 'options_id,categories_id')) if (r.options_id && r.categories_id) (optCats.get(r.options_id) || optCats.set(r.options_id, []).get(r.options_id)).push(r.categories_id)
  const inCategory = new Set((await all('categories_characters', 'categories_id,characters_id')).map((r) => `${r.categories_id}|${r.characters_id}`))
  const catLinks = []
  for (const r of charSide) for (const catId of optCats.get(r.options_id) || []) {
    const k = `${catId}|${r.characters_id}`
    if (!r.characters_id || inCategory.has(k)) continue
    inCategory.add(k)
    catLinks.push({ categories_id: catId, characters_id: r.characters_id })
  }
  if (MODE === 'apply' && catLinks.length) await createBatched('categories_characters', catLinks)
  say(`category -> characters links: ${catLinks.length} new`)
}

;(async () => {
  await login()
  say(`[${MODE}] categorize`)
  await run()
  console.log(JSON.stringify(log, null, 1))
})().catch((err) => { say(err.stack || err); console.log(JSON.stringify(log, null, 1)); process.exit(1) })
