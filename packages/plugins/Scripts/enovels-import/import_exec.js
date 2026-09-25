// Executes a plan.json (from plan.py) against the novels Directus. Runs *inside* the
// Directus container so it can use the instance's own ADMIN_EMAIL/ADMIN_PASSWORD env
// without them ever leaving the container:
//
//   docker cp plan.json novelsDirectus:/tmp/enovels-plan.json
//   docker cp import_exec.js novelsDirectus:/tmp/import_exec.js
//   docker exec -e MODE=dry|apply novelsDirectus node /tmp/import_exec.js > log.json
//
// Idempotent: rows whose slug or name already exists are reused (empty fields filled in),
// never duplicated. stdout is a JSON log of every id created/updated, for rollback.
const fs = require('fs')
const e = process.env
const B = 'http://127.0.0.1:8055'
const MODE = e.MODE === 'apply' ? 'apply' : 'dry'
const plan = JSON.parse(fs.readFileSync(e.PLAN_FILE || '/tmp/enovels-plan.json', 'utf8'))
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '')
const slugify = (s) => String(s).toLowerCase().replace(/[’']/g, '').replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-|-$/g, '')
const log = { mode: MODE, kind: plan.kind, created: {}, updated: {}, schema: [], warnings: [], unmatched: {} }
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
const stripPrivate = (row) => Object.fromEntries(Object.entries(row).filter(([k]) => !k.startsWith('_')))

async function createBatched(collection, rows, fields = 'id', size = 50) {
  const out = []
  for (let i = 0; i < rows.length; i += size) {
    out.push(...(await api('POST', `/items/${collection}?fields=${fields}`, rows.slice(i, i + size))))
    if (rows.length > size) say(`  ${collection}: ${Math.min(i + size, rows.length)}/${rows.length}`)
  }
  return out
}

// Widen varchar(191) description columns to text (approved schema change).
async function ensureTextFields(collection, fields) {
  for (const field of fields) {
    const f = await api('GET', `/fields/${collection}/${field}`)
    if (f.type === 'text' && f.schema?.data_type !== 'varchar') continue
    log.schema.push(`${collection}.${field}: ${f.schema?.data_type}(${f.schema?.max_length}) -> text`)
    // `schema` must be present or Directus only updates the field's metadata, not the column.
    if (MODE === 'apply') await api('PATCH', `/fields/${collection}/${field}`, { type: 'text', schema: {}, meta: { interface: 'input-multiline' } })
  }
}

// Build a name -> id lookup that also covers comma-separated aliases.
function nameIndex(rows) {
  const m = new Map()
  for (const x of rows) {
    if (!m.has(norm(x.name))) m.set(norm(x.name), x.id)
    for (const a of String(x.alias || '').split(',')) if (a.trim() && !m.has(norm(a))) m.set(norm(a), x.id)
  }
  return m
}

// Junction tables behind the characters form's relation fields: plan key -> [table, other FK].
const CHAR_LINKS = {
  universe: ['universe_characters', 'universe_id'],
  categories: ['categories_characters', 'categories_id'],
  stories: ['characters_stories', 'stories_id'],
  abilities: ['characters_abilities', 'abilities_id'],
  options: ['characters_options', 'options_id'],
  places: ['places_characters', 'places_id'],
  affiliates: ['characters_characters_1', 'related_characters_id'],
}

async function importCharacters() {
  const byName = async (c, fields = 'id,name') => { const rows = await all(c, fields); return [rows, new Map(rows.map((x) => [norm(x.name), x.id]))] }
  const [, universes] = await byName('universe')
  const [, categories] = await byName('categories')
  const [storyRows, stories] = await byName('stories', 'id,name,status')
  const [, places] = await byName('places')
  const [, abilities] = await byName('abilities')
  // Options are keyed by category: "Types|aqua", "Level|battle" (see Water Made's character_options).
  const optionRows = await all('options', 'id,name,status,category.categories_id.name')
  const options = new Map()
  for (const o of optionRows) for (const c of o.category || []) if (c?.categories_id?.name) options.set(`${norm(c.categories_id.name)}|${norm(o.name)}`, o.id)
  const existing = await all('characters', 'id,name,alias,slug,status,type,age,description')
  // Match the status spelling each collection already uses ("Published" vs "published").
  const storyStatus = storyRows[0]?.status || 'published'
  const charStatus = existing.find((x) => norm(x.status) === 'published')?.status || 'published'
  const optionStatus = optionRows.find((x) => norm(x.status) === 'published')?.status || 'published'

  // 1. lookup records referenced by name (created only when missing)
  async function ensure(collection, map, names, make) {
    const missing = [...new Set(names)].filter((n) => !map.has(norm(n)))
    if (MODE === 'apply' && missing.length) {
      for (const m of await createBatched(collection, missing.map(make), 'id,name')) { map.set(norm(m.name), m.id); note('created', collection, m.id) }
    } else missing.forEach((n) => map.set(norm(n), `new:${n}`))
    say(`${collection}: ${new Set(names).size} referenced, ${missing.length} to create`)
  }
  await ensure('categories', categories, plan.categories || [], (name) => ({ name, slug: slugify(name) }))
  await ensure('stories', stories, plan.stories || [], (name) => ({ name, slug: slugify(name), status: storyStatus }))
  await ensure('places', places, plan.places || [], (name) => ({ name, slug: slugify(name), status: 'published' }))
  await ensure('abilities', abilities, plan.abilities || [], (name) => ({ name, slug: slugify(name), status: 'published', type: 'Character Ability' }))
  const optMissing = (plan.options || []).map(([cat, name]) => ({ cat, name })).filter((o) => !options.has(`${norm(o.cat)}|${norm(o.name)}`))
  for (const o of optMissing) if (!categories.get(norm(o.cat))) log.warnings.push(`no category "${o.cat}" for option "${o.name}"`)
  if (MODE === 'apply' && optMissing.length) {
    const made = await createBatched('options', optMissing.map((o) => ({ name: o.name, slug: slugify(o.name), status: optionStatus, category: [{ categories_id: categories.get(norm(o.cat)) }] })), 'id,name')
    // Map by returned name, never by position: Directus doesn't return created rows in request order.
    const catOf = new Map(optMissing.map((o) => [norm(o.name), o.cat]))
    for (const m of made) { options.set(`${norm(catOf.get(norm(m.name)))}|${norm(m.name)}`, m.id); note('created', 'options', m.id) }
  } else optMissing.forEach((o) => options.set(`${norm(o.cat)}|${norm(o.name)}`, `new:${o.name}`))
  say(`options: ${(plan.options || []).length} referenced, ${optMissing.length} to create (${optMissing.map((o) => `${o.cat}:${o.name}`).join(', ')})`)

  // 2. characters — an existing row matches on name AND type, so a monster "Triton" never
  //    merges into a god "Triton"; a clashing slug gets a type suffix instead.
  const exBySlug = new Map(existing.map((x) => [x.slug, x]))
  const exByNameType = new Map(existing.map((x) => [`${norm(x.name)}|${x.type || ''}`, x]))
  const exByName = new Map(existing.map((x) => [norm(x.name), x]))
  const taken = new Set(existing.map((x) => x.slug))
  const matched = new Map(), todo = [], fills = []
  log.name_type_clashes = []
  for (const c of plan.rows) {
    const bySlug = exBySlug.get(c.slug)
    const m = (bySlug && (bySlug.type || '') === (c.type || '') ? bySlug : null) || exByNameType.get(`${norm(c.name)}|${c.type || ''}`) ||
      // A team is a group; an existing group of that name (e.g. "Shadow Walkers") is the same one.
      (c.type === 'Team' ? exByName.get(norm(c.name)) : null)
    if (m) {
      matched.set(c, m)
      const patch = {}
      if (c.age != null && m.age == null) patch.age = c.age
      if (c.alias && !m.alias) patch.alias = c.alias
      if (c.description && !m.description) patch.description = c.description
      if (Object.keys(patch).length) fills.push({ id: m.id, patch })
      continue
    }
    const other = exByName.get(norm(c.name))
    if (other) log.name_type_clashes.push(`${c.name}: new ${c.type}, existing ${other.type} (#${other.id})`)
    if (taken.has(c.slug)) {
      const base = `${c.slug}-${slugify(c.type || 'character')}`
      let s = base, n = 2
      while (taken.has(s)) s = `${base}-${n++}`
      c.slug = s
    }
    taken.add(c.slug)
    todo.push(c)
  }
  const created = new Map()
  const payload = (c) => ({ name: c.name, slug: c.slug, alias: c.alias || null, type: c.type, status: charStatus, description: c.description, ...(c.age != null ? { age: c.age } : {}) })
  if (MODE === 'apply') {
    const made = await createBatched('characters', todo.map(payload), 'id,slug')
    const bySlugMade = new Map(made.map((m) => [m.slug, m.id]))
    for (const c of todo) { created.set(c, bySlugMade.get(c.slug)); note('created', 'characters', bySlugMade.get(c.slug)) }
    for (const { id, patch } of fills) { await api('PATCH', `/items/characters/${id}`, patch); note('updated', 'characters', { id, fields: Object.keys(patch) }) }
  } else todo.forEach((c, i) => created.set(c, `new:${i}`))
  say(`characters: ${todo.length} to create, ${matched.size} already exist (${fills.length} to fill in), ${log.name_type_clashes.length} same name/different type`)
  const charId = (c) => created.get(c) ?? matched.get(c)?.id

  // 3. links, for new AND existing characters, skipping pairs that already exist.
  const people = nameIndex(existing)
  for (const c of plan.rows) for (const k of [c.name, ...String(c.alias || '').split(',')]) if (k.trim() && !people.has(norm(k))) people.set(norm(k), charId(c))
  const lookup = {
    universe: (n) => universes.get(norm(n)), categories: (n) => categories.get(norm(n)), stories: (n) => stories.get(norm(n)),
    abilities: (n) => abilities.get(norm(n)), places: (n) => places.get(norm(n)),
    options: (o) => options.get(`${norm(o.category)}|${norm(o.name)}`), affiliates: (n) => people.get(norm(n)),
  }
  for (const [key, [table, otherField]] of Object.entries(CHAR_LINKS)) {
    const have = new Set((await all(table, `characters_id,${otherField}`)).map((r) => `${r.characters_id}|${r[otherField]}`))
    const rows = []
    for (const c of plan.rows) {
      const id = charId(c)
      for (const ref of c[key] || []) {
        const other = lookup[key](ref)
        if (!other || other === id) {
          if (key === 'affiliates') log.unmatched[ref] = (log.unmatched[ref] || 0) + 1
          else if (!other) log.warnings.push(`${c.name}: no ${key} "${typeof ref === 'object' ? ref.name : ref}"`)
          continue
        }
        const k = `${id}|${other}`
        if (have.has(k)) continue
        have.add(k)
        rows.push({ characters_id: id, [otherField]: other })
      }
    }
    if (MODE === 'apply' && rows.length) for (const x of await createBatched(table, rows, 'id', 200)) note('created', table, x.id)
    say(`${key} links: ${rows.length} new`)
  }
  say(`unmatched affiliate names: ${Object.keys(log.unmatched).length}, warnings: ${log.warnings.length}`)
}

async function importSimple() {
  const { collection, rows, text_fields = [], links = {} } = plan
  await ensureTextFields(collection, text_fields)
  const fillable = ['description', 'location', 'type', 'status'].filter((k) => rows.some((r) => k in r))
  const existing = await all(collection, ['id', 'name', 'slug', ...fillable].join(','))
  const bySlug = new Map(existing.map((x) => [x.slug, x]))
  const byName = new Map(existing.map((x) => [norm(x.name), x]))
  const match = (r) => bySlug.get(r.slug) || byName.get(norm(r.name))

  const toCreate = [], toFill = []
  for (const r of rows) {
    const cur = match(r)
    if (!cur) { toCreate.push(r); continue }
    // Existing row (e.g. a place created earlier from a character's residence): fill blanks only.
    const patch = Object.fromEntries(fillable.filter((k) => r[k] && !cur[k]).map((k) => [k, r[k]]))
    if (Object.keys(patch).length) toFill.push({ id: cur.id, patch })
  }
  say(`${collection}: ${toCreate.length} to create, ${toFill.length} existing to fill in, ${rows.length - toCreate.length - toFill.length} unchanged`)

  const ids = new Map()
  if (MODE === 'apply') {
    const made = await createBatched(collection, toCreate.map(stripPrivate).map(({ characters, ...rest }) => rest), 'id,slug')
    for (const m of made) { ids.set(m.slug, m.id); note('created', collection, m.id) }
    for (const { id, patch } of toFill) { await api('PATCH', `/items/${collection}/${id}`, patch); note('updated', collection, { id, fields: Object.keys(patch) }) }
  } else toCreate.forEach((r, i) => ids.set(r.slug, `new:${i}`))

  // Name-based links (e.g. items -> characters), only for rows created in this run.
  for (const [field, l] of Object.entries(links)) {
    const others = nameIndex(await all(field, 'id,name,alias'))
    const linkRows = []
    for (const r of toCreate) for (const n of r[field] || []) {
      const other = others.get(norm(n))
      if (other) linkRows.push({ [l.self]: ids.get(r.slug), [l.other]: other })
      else log.unmatched[n] = (log.unmatched[n] || 0) + 1
    }
    if (MODE === 'apply') for (const x of linkRows.length ? await createBatched(l.junction, linkRows) : []) note('created', l.junction, x.id)
    say(`${field} links: ${linkRows.length}, unmatched names: ${Object.keys(log.unmatched).length}`)
  }
}

;(async () => {
  await login()
  say(`[${MODE}] ${plan.kind} -> ${plan.collection}`)
  await (plan.collection === 'characters' ? importCharacters() : importSimple())
  console.log(JSON.stringify(log))
})().catch((x) => { say('ERR', x.message); console.log(JSON.stringify(log)); process.exit(1) })
