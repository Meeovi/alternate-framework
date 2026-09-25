# enovels-import

Imports the Elite Novels chapter documents (`.docx`) into the novels Directus
(`novelsDirectus` container) as `characters`, `places`, `items` and `dictionary` entries.

```bash
cd packages/plugins/Scripts/enovels-import
./run.sh preview            # parse + plan every kind; writes CSVs only
./run.sh dry places         # also resolves against Directus, no writes
./run.sh apply characters   # imports and saves a rollback log
./run.sh apply categorize   # puts abilities, items, places and dictionary entries into their categories
```

Kinds, all run in this order when none is given:

| Kind | Source | Collection |
|---|---|---|
| `characters` | Chapters 3, 4, 5, 12 (Humans, Angels, Demons, Kids) | `characters` |
| `places` | Chapter 6, and the Kids chapter's "Places of …" section | `places` |
| `items` | Chapter 7 (Weapons) | `items` |
| `dictionary` | Chapter 10 | `dictionary` |
| `heroes` | `Eliteverse Heroes and Villains*/` | `characters` (teams become type *Team*) |
| `mythology` | `Mythologies*/` | `characters` (type *Mythology*) |
| `monsters` | `Battle Guardians*/` (Chapter 13 and 13.5; the empty `Elite-Novels-Monsters-*.docx` placeholders are skipped) | `characters` (type *Monster*) |
| `categorize` | the rows already in Directus | `options` (see Categories below) |

Env overrides: `CONTAINER` (default `novelsDirectus`), `DOCS` (default `docs/enovels-documents`)
and `OUT` (default `$DOCS/import-preview`).

Needs `python3` and `docker` on the host. Nothing else has to be installed: the `.docx` files are
read with the Python standard library.

## Output

Written to `$OUT`:

- `<kind>-preview.csv`: every row that would be imported, as it will be stored. It opens in Excel.
- `<kind>-preview-unparsed.csv`: paragraphs the parser couldn't place. These are mostly chapter intros.
- `import-log-<kind>-apply-<timestamp>.json`: the ids of every row created or updated, for rollback.

## How it works

| File | Role |
|---|---|
| `docx_read.py` | Reads a `.docx` into paragraphs: style, list flag, bold lead text and images. |
| `parse_docs.py` | Maps the chapter layouts to entries. The `KINDS` config says which chapters, sections and `NAME:` labels feed each collection. |
| `plan.py` | Turns entries into collection rows. Block details (Title, Race, Location…) become fields or lead lines, and relations are given by name. |
| `import_exec.js` | Runs **inside** the container, so it can use the instance's own admin credentials. It resolves names to ids, creates rows in batches of 50 and adds links. |
| `categorize_exec.js` | Runs inside the container. Gives every ability, item, place and dictionary entry its option in the right category (see Categories). |
| `run.sh` | Wires the steps together and cleans up the files it copied into the container. |

The chapters use several layouts, and all of them are handled:

- `Name (a.k.a. Alias) – description` bullets, and `Name = description`
- labelled blocks: `NAME: … / TITLE: … / LOCATION: … / DESCRIPTION:` followed by paragraphs
- a short name line, or a `Title –` line, followed by paragraphs
- name-only lines after a sentence ending in `:`, which are folded into that entry as `•` bullets
- Heroes: `Heading 2` team sections ("Elite Force (9)") and their `Name:/Age:/Abilities:/Alias:/Affiliates:` members
- Mythology: bare member names listed under a group entry (Selenes → Cloe, Moni…), and "The Ocieans were…" sentences
- Monsters: 4-line blocks `NAME` / `TYPE – TYPE` / `CLASS` or `----EVOLVES FROM` / description. Every monster
  appears twice in Chapter 13 (full text, then a short appearance line), so the two are merged into one entry.

## Safe to re-run

Rows are matched to existing entries: characters by name and type, other collections by slug or
name. For a match, only its **empty** fields are filled in. Character links are checked against the
existing junction rows before insert, so they're never duplicated. Links whose target only appears in
a later kind get picked up on the next run. For item → character links, only rows created in that run
get links. When everything is in, `./run.sh dry` reports `0 to create` and no new links for every kind.

## Mapping decisions (2026-09-25)

Heroes, mythology and monsters:

- Abilities link to `abilities` (type *Character Ability*), created if missing. Sentence-length abilities
  (over 6 words or 60 characters) stay in the description as an `Abilities:` line.
- Teams are characters of type *Team* in category *Teams*. Members link to them through `affiliates`, and a
  team matches an existing group of the same name (e.g. "Shadow Walkers"). Mythology group members link to
  their group.
- Monster types and classes are **options**, linked through `character_options` the same way as the
  existing "Water Made": each type (Aqua, Shadow…) is an option in category *Types*, and each class (Battle,
  Ability, Enrage, Extreme, Baby Form, Godly Level) is an option in category *Level*. "Evolves from" and odd
  classes stay in the description.
- Age: "3,000 years old" is stored as `age = 3000`. Text ages go into the description.
- An existing character matches only on the same name **and type**, so the demon Azazel and the monster
  Azazel are separate records (`azazel-monster`). Links are checked against existing junction rows, so
  they're added to existing characters without ever being duplicated.

Earlier chapters:

- Characters: Place of residence links to `places`, Story links to `stories`, and Affiliates link
  to other characters by name or alias. Title and Job/position are kept as lead lines in the
  description. "Universe 666" entries are treated as ordinary demons. Everything is imported as
  published.
- `places.description` and `items.description` were widened from `varchar(191)` to `text`
  (the executor does this itself, and only when needed).
- The whole Dictionary chapter, including abilities and spells, goes into `dictionary` with type
  `definition`. Type, User, Age and Cause are kept as lead lines.
- Names that match no character, such as groups ("Candy Lane Racers"), "Various" and typos, are
  reported under `unmatched` in the log and left unlinked.

## Categories

The site finds everything through the `categories` collection. `categories` relates only to
`characters` and `options`, so:

- **Characters** link to categories directly: Humans (Chapter 3), Kids (Chapter 12), Angels, Demons,
  Heroes (Heroes & Villains individuals), Teams, Mythology plus its sub-category (Gods and Goddesses,
  Royal Circa, Mythical Creatures, Other Myths), Monsters and Aurelian Characters. Missing categories
  are created.
- **Abilities, items, places and dictionary entries** each get an option in their category, like the
  existing Telepathy, Seals, Anura and Skyball:

  | Collection | Option category | Option `type` |
  |---|---|---|
  | `abilities` | Abilities (+ Monster Abilities for a *Monster Ability*) | `Abilities` |
  | `items` | Items | `Items` |
  | `places` | Places | `Places` |
  | `dictionary` | Dictionary (+ Definition for type *definition*) | `Dictionary` |

  An existing option with the same name in that category is reused. Otherwise one is created, and its
  slug gets a suffix (`-ability`, `-place`…) if another option already uses it. Characters' ability, item
  and place links are copied onto `character_options`, because that's where the character page reads
  abilities from.
- **Both sides of a character ↔ option link.** `characters.character_options` (junction
  `characters_options`) and `options.characters` (junction `options_characters`) are two separate
  relations. `categorize` copies every character-side link to the option side, so an option such as
  Aqua (Types), Battle (Level) or an ability lists its characters too.
- **Category ↔ character.** A character also joins the category of each of its options, so the category's
  own Characters field lists them: Types holds every monster with a type (1,181; the rest have no type in
  the docs), Level holds 961, and Abilities, Places and Items hold every character with one of those.
  Dictionary has no characters, because definitions aren't about particular characters. The three items
  whose owner line names a character (Staff of Judgement, Book of All Things, Book of the Demoy) are linked to it.
- **Types and Level:** monster types are options in *Types* with `type = Type`, and classes (Battle,
  Ability, Enrage, Extreme, Baby Form, Godly Level, Special Evolve) are options in *Level* with
  `type = Level`. `categorize` sets any missing type, links an option to the category its type implies,
  and deletes option–category rows that point at no category.

## Gotchas

- Directus doesn't return created rows in the order they were sent. Map created rows by name or slug, never
  by position. (That bug mis-linked monster types once. The bad links were deleted using the log and
  recreated, and all 1,948 typed monsters were then verified against the source.)
- The novels DB is remote, so every row costs several round trips. Nested creates (an option with its
  category) took minutes per 50 rows and hit fetch's 5-minute timeout. `categorize` creates plain rows in
  batches of 10, **one request at a time** (`PARALLEL=n` to change), then adds the junction rows. Four
  parallel writes exhausted Directus's 10-connection pool and the live site returned 500s until they finished. It logs each batch as it lands.
- Runs can outlast the 15-minute access token; both executors log in again on a 401.
- Even serially, junction rows cost about 2.5 s each through the API. The 3,602 option-side links were
  therefore inserted with plain SQL on 2026-09-25: two SELECTs, a diff in JS, then `INSERT … VALUES`
  500 rows at a time, which took 25 s. Undo is in `import-log-options-characters-sql-*.json`. Don't use
  a correlated `NOT EXISTS` over the junctions: they're unindexed, and that query made MySQL drop connections.
  The 3,014 category ↔ character links went in the same way; their undo is in `import-log-category-characters-sql-*.json`.
- `PATCH /fields/...` changes the DB column only if the body includes `schema: {}`.

## Rollback

Each log lists created ids per collection. Deleting those ids undoes that run:
`DELETE /items/<collection>` with the id array as the body, done as an admin. Delete the junction
collections first, then `options`, `characters`, `places`, `items`, `dictionary` and `stories`. Rows under
`updated` only had blank fields filled in, so to undo them clear the listed fields.
