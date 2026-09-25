"""Parse Elite Novels chapter documents (.docx) into entries for one Directus collection.

The chapters mix several layouts, all handled here:
  A) bullets "Name (a.k.a. Alias) (Origin) – description"  (also "Name = description")
  B) labelled blocks "NAME: … / TITLE: … / LOCATION: … / DESCRIPTION:" + description paragraph(s)
  D) a short name line (or "Title –" line) followed by description paragraph(s)

Usage: python3 parse_docs.py KIND DOCS_DIR OUT.json
KIND is one of: characters, places, items, dictionary (see KINDS below).
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from docx_read import read

# Which chapters feed each collection, which sections to take, and the labels its
# NAME: blocks use. `defaults` are per-chapter values keyed by a word in the title.
KINDS = {
    'characters': {
        'docs': ['Humans', 'Angels', 'Demons', 'Kids Version'],
        'section_ok': lambda s: not (s and 'PLACES' in s.upper()),
        'labels': ['NAME', 'TITLE', 'STORY', 'DESCRIPTION', 'PLACE OF RESIDENCE', 'JOB OR POSITION', 'AFFILIATES'],
        'defaults': {
            'Humans': {'type': 'Individual', 'universe': 'Main Universe', 'category': 'Humans'},
            'Angels': {'type': 'Angel', 'universe': 'Main Universe', 'category': 'Angels'},
            'Demons': {'type': 'Demon', 'universe': 'Main Universe', 'category': 'Demons'},
            'Kids Version': {'type': 'Individual', 'universe': 'Kids', 'category': 'Kids'},
        },
    },
    'places': {
        'docs': ['Places', 'Kids Version'],
        # Kids chapter: only its "PLACES OF …" section; Places chapter: everything.
        'section_ok': lambda s, doc='': 'Kids' not in doc or bool(s and 'PLACES' in s.upper()),
        'labels': ['NAME', 'LOCATION', 'RACE', 'RESIDENTS', 'DESCRIPTION'],
    },
    'items': {
        'docs': ['Weapons'],
        'labels': ['NAME', 'STORY OR CHARACTER', 'RACE', 'DESCRIPTION'],
    },
    'dictionary': {
        'docs': ['Dictionary'],
        'labels': ['NAME', 'TYPE', 'USER', 'AGE', 'CAUSE', 'DESCRIPTION'],
    },
    # --- character folders (collection: characters) --------------------------
    'heroes': {
        'glob': ['Eliteverse Heroes and Villains*/*.docx'],
        'labels': ['NAME', 'AGE', 'ABILITIES', 'ABILTIES', 'ABILTIIES', 'ALIAS', 'AFFILIATES', 'RANK',
                   'CREATURE', 'CLASS', 'DESCRIPTION'],
        'defaults_fn': lambda doc, section: {'type': 'Individual', 'universe': 'Main Universe', 'category': 'Heroes'},
        'team_headings': True,   # "Heading 2" = a team ("Elite Force (9)"); its entries are members
        'merge_duplicates': True,  # someone listed under two teams is one character
    },
    'mythology': {
        'glob': ['Mythologies*/*.docx'],
        'labels': ['NAME', 'RANK', 'AGE', 'ABILITIES', 'ABILTIES', 'ABILTIIES', 'ALIAS', 'AFFILIATES',
                   'CREATURE', 'CLASS', 'HALL OF', 'DESCRIPTION'],
        'group_members': True,   # bare names under a NAME: group entry (Selenes -> Cloe, Moni…)
        'sentence_names': True,  # Mermadic Kingdom: "The Ocieans were …"
        'defaults_fn': lambda doc, section: {'type': 'Mythology', 'universe': 'Main Universe',
                                             'category': ['Mythology', mythology_category(doc)]},
    },
    'monsters': {
        'glob': ['Battle Guardians*/*.docx'],
        'labels': ['NAME', 'PARTNER', 'DESCRIPTION'],
        'defaults_fn': lambda doc, section: (
            {'type': 'Individual', 'universe': 'Main Universe', 'category': 'Aurelian Characters'}
            if section and 'CHARACTERS' in section.upper()
            else {'type': 'Monster', 'universe': 'Main Universe', 'category': 'Monsters'}),
        'monster_blocks': True,  # NAME / TYPE(S) / CLASS or ----EVOLVES-FROM / description
        'merge_duplicates': True,  # every monster is listed twice (full text + short appearance line)
    },
}


def mythology_category(doc):
    d = doc.lower()
    if 'royalcirca' in d:
        return 'Royal Circa'
    if 'mythicalcreatures' in d:
        return 'Mythical Creatures'
    if 'gods' in d or 'creation' in d:
        return 'Gods and Goddesses'
    return 'Other Myths'

DASH = re.compile(r'[\s ]+[–—-][\s ]*|[\s ]+=[\s ]+')
# Short name-like line: a few capitalised words, no sentence punctuation.
NAMEISH = re.compile(r'^[A-Z0-9][\w’\'“”".&-]*(?:[\s ]+[\w’\'“”".&()-]+){0,5}$')
# "Maricha a mimic demon ..." — capitalised name then an article.
LEAD_ARTICLE = re.compile(r'^((?:[A-Z][\w’\'-]*[\s ]*){1,3}(?:\([^)]*\))?)[\s,]+(?=(?:a|an|the)\s)')
AKA = re.compile(r'\(\s*(?:a\.k\.a\.?|aka)\s*([^)]*)\)|,?\s*also (?:known|written)(?: in [^,]*?)? as\s+([^,–—-]+)', re.I)
# "The Ocieans were three beautiful …" — name, then was/were/is/are.
SENTENCE_NAME = re.compile(r"^((?:The\s+)?[A-Z0-9][\w’'-]*(?:\s+(?:[A-Z0-9][\w’'-]*|of|the|and)){0,5})\s+(?:was|were|is|are)\s")
SKIP_LINE = re.compile(r'^(over\s+)?[\d,]+\s+characters?\b', re.I)  # "Over 500 characters", "5,103 characters so far…"


def clean(s):
    return re.sub(r'[\s ]+', ' ', s or '').strip(' .,:;')


def smart_title(name):
    """PEPPERMINT KING -> Peppermint King; leaves mixed-case text alone."""
    if name.isupper() and len(name) > 3:
        return ' '.join(w.capitalize() if w.isalpha() else w.title() for w in name.split(' '))
    return name


def slugify(s):
    s = re.sub(r'[^\w\s-]', '', s.lower().replace('’', '').replace("'", ''))
    return re.sub(r'[\s_-]+', '-', s).strip('-')


def split_name(raw):
    """'Camael (a.k.a. Kemuel) (Jewish mythology)' -> ('Camael', ['Kemuel'], ['Jewish mythology'])."""
    aliases, notes = [], []

    def take_aka(m):
        aliases.append(clean(m.group(1) or m.group(2)))
        return ' '
    raw = AKA.sub(take_aka, raw)

    def take_paren(m):
        notes.append(clean(m.group(1)))
        return ' '
    raw = re.sub(r'\(([^)]*)\)', take_paren, raw)
    name = clean(raw)
    if '/' in name:
        first, *rest = [clean(x) for x in name.split('/')]
        name = first
        aliases.extend(r for r in rest if r)
    if ',' in name:
        first, rest = name.split(',', 1)
        name = clean(first)
        notes.append(clean(rest))
    m = re.match(r'^(\S+(?: \S+)?) or (\S+(?: \S+)?)$', name)
    if m:
        name = m.group(1)
        aliases.append(m.group(2))
    return name, [a for a in aliases if a], [n for n in notes if n]


def label_re(labels):
    return re.compile(r'(?:^|\s)(' + '|'.join(re.escape(l) for l in labels) + r')\s*:', re.I)


def parse_labelled(text, rx):
    """'NAME: X\\nTITLE: Y DESCRIPTION: z' -> {'NAME': 'X', 'TITLE': 'Y', 'DESCRIPTION': 'z'}."""
    out, pos = {}, list(rx.finditer(text))
    for i, m in enumerate(pos):
        end = pos[i + 1].start() if i + 1 < len(pos) else len(text)
        out[m.group(1).upper()] = text[m.end():end].strip()
    return out


def parse_doc(path, kind):
    cfg = KINDS[kind]
    rx = label_re(cfg['labels'])
    paras = read(path)
    doc = os.path.basename(path)
    title = paras[0]['text'] if paras else ''
    key = next((k for k in cfg.get('defaults', {}) if k.lower() in (title + doc).lower()), None)
    static_defaults = cfg.get('defaults', {}).get(key, {})
    defaults_for = (lambda sec: cfg['defaults_fn'](doc, sec)) if 'defaults_fn' in cfg else (lambda sec: static_defaults)
    team = None
    group = None   # last NAME: entry, for bare member names listed under it
    ok = cfg.get('section_ok', lambda s, doc='': True)
    section_ok = (lambda s: ok(s, doc)) if ok.__code__.co_argcount == 2 else ok
    records, problems, section, cur = [], [], None, None

    def flush():
        nonlocal cur
        if cur:
            parts = [p for p in cur.pop('_desc') if p]
            desc = ''.join((('\n' if p.startswith('• ') else '\n\n') if i else '') + p for i, p in enumerate(parts)).strip()
            # "Popular Universes include:" / "Different Types of mages:" are list intros, not entries.
            cur.pop('_mstate', None)
            if desc or not cur.pop('_colon', False):
                cur.pop('_colon', None)
                cur['description'] = desc
                records.append(cur)
        cur = None

    def open_record(name, layout, aliases=(), notes=(), colon=False):
        nonlocal cur
        flush()
        name = clean(name)
        if cfg.get('glob'):                                    # new-folder kinds only (keeps earlier imports stable)
            if name.endswith('”') and '“' not in name:
                name = name[:-1]
            if name.endswith("'") and name.count("'") == 1:
                name = name[:-1]
        cur = {'source': doc, 'section': section, 'layout': layout, 'name': smart_title(name),
               'alias': ', '.join(aliases) or None, 'notes': list(notes), 'extra': {}, '_desc': [],
               '_colon': colon, 'team': team, **defaults_for(section)}

    def add_fields(fields):
        for k, v in fields.items():
            if k == 'NAME':
                continue
            if k == 'DESCRIPTION':
                if v.strip():
                    cur['_desc'].append(v.strip())
            elif clean(v) and clean(v).upper() != 'N/A':
                cur['extra'][k.title()] = smart_title(clean(v))

    body = paras[1:]
    for i, p in enumerate(body):
        text, style = p['text'], (p['style'] or '').lower()
        nxt = body[i + 1]['text'] if i + 1 < len(body) else ''
        if not text:
            continue
        if style and ('heading' in style or 'quote' in style):
            flush()
            section = clean(text)
            team = None
            group = None
            if cfg.get('team_headings') and style.startswith('heading 2') and 'solo' not in text.lower():
                team = clean(re.sub(r'\s*\(\d+\)\s*$', '', text))   # "Elite Force (9)" -> "Elite Force"
                open_record(team, 'T')
                cur.update(type='Team', category='Teams', team=None)
            continue
        if not section_ok(section) or SKIP_LINE.match(clean(text)):
            flush()
            continue
        if cfg.get('monster_blocks'):
            t = text.strip()
            if not p['list'] and re.fullmatch(r"[A-Z0-9 ’'&.,-]+:", t):          # "AQUA:" group line
                flush()
                section = smart_title(t.rstrip(':').strip())
                continue
            if p['list'] and t == t.upper() and re.search('[A-Z]', t) and len(t) <= 60:
                open_record(t, 'M')                                             # "ZEMISITE"
                cur['_mstate'] = 0
                continue
            state = cur.get('_mstate') if cur else None
            if state is not None and not p['list'] and t == t.upper() and len(t) <= 60:
                if state == 0:                                                  # "AQUA – SHADOW"
                    cur['extra']['Types'] = [smart_title(x.strip()) for x in re.split(r'\s*[–—-]\s*', t) if x.strip()]
                    cur['_mstate'] = 1
                    continue
                if state == 1:                                                  # "BATTLE" / "----SAPPHIRE FISH"
                    if t.startswith('-'):
                        cur['extra']['Evolves From'] = smart_title(t.strip('- '))
                    else:
                        cur['extra']['Class'] = smart_title(t)
                    cur['_mstate'] = 2
                    continue
        fields = parse_labelled(text, rx) if rx.search(text) else {}
        if 'NAME' in fields:                                   # layout B: labelled block
            name, aliases, notes = split_name(fields['NAME'])
            if not name:                                        # blank template
                flush()
                continue
            open_record(name, 'B', aliases, notes)
            add_fields(fields)
            group = cur['name']
            continue
        if cur and fields and not p['list']:                  # more labels for the open record
            add_fields(fields)
            continue
        parts = DASH.split(text, maxsplit=1)
        cand = split_name(parts[0]) if len(parts) == 2 and 1 <= len(parts[0]) <= 90 else None
        if cand and cur and cur['layout'] == 'B' and not p['list'] and cand[0].lower() == cur['name'].lower():
            cur['_desc'].append(parts[1].strip())              # "Aurelia – …" under NAME: Aurelia
            continue
        if cand and cand[0] and NAMEISH.match(cand[0]) and parts[1].strip():  # layout A / "Name = desc"
            open_record(cand[0], 'A', cand[1], cand[2])
            cur['_desc'].append(parts[1].strip())
            flush()
            continue
        if len(parts) == 2 and not parts[1].strip():            # "Prince of Fairy Village –" + "Prince Faren is …"
            m = re.match(r'^((?:[A-Z][\w’\'-]*\s?){1,4}?)\s+(?:is|was)\s', nxt)
            open_record(m.group(1) if m else parts[0], 'D', notes=[clean(parts[0])] if m else [])
            continue
        m = LEAD_ARTICLE.match(text) if p['list'] else None
        if m:                                                   # "Maricha a mimic demon …"
            name, aliases, notes = split_name(m.group(1))
            open_record(name, 'A', aliases, notes)
            cur['_desc'].append(text[m.end():].strip())
            flush()
            continue
        bare = text.strip().rstrip(':').strip()
        if cur and cur['_desc'] and cur['_desc'][-1].rstrip().endswith(':') or cur and cur['_desc'] and cur['_desc'][-1].startswith('• '):
            if NAMEISH.match(clean(bare)) and len(clean(bare)) <= 60 and not text.strip().endswith(':'):
                cur['_desc'].append('• ' + clean(bare))       # "The five main halls are:" + name-only list
                continue
        if NAMEISH.match(clean(bare)) and len(clean(bare)) <= 60 and not bare.endswith('.'):
            name, aliases, notes = split_name(bare)            # short name line; description follows
            prev_group = group if cfg.get('group_members') and p['list'] else None
            open_record(name, 'D', aliases, notes, colon=text.strip().endswith(':'))
            if prev_group:
                cur['member_of'] = prev_group
            continue
        m = SENTENCE_NAME.match(text) if p['list'] and cfg.get('sentence_names') else None
        if m:                                                   # "The Ocieans were three …"
            open_record(m.group(1), 'S')
            cur['_desc'].append(text.strip())
            flush()
            continue
        if p['list']:
            m = re.match(r'^([^(]{2,60}?)\s*\((.+)\)\s*$', text)
            if m:
                open_record(m.group(1), 'A')
                cur['_desc'].append(clean(m.group(2)))
                flush()
                continue
        if cur:                                                 # description paragraph for open record
            d = text
            head = DASH.split(d, maxsplit=1)
            if len(head) == 2 and clean(head[0]).lower() == cur['name'].lower():
                d = head[1]
            cur['_desc'].append(d.strip())
            continue
        problems.append({'source': doc, 'section': section, 'text': text[:300]})
    flush()
    return records, problems


def merge_duplicates(records):
    """Fold repeated (name, type) entries into one: longest text is the body, other distinct
    texts are kept (short ones as an 'Appearance:' line), fields and teams are unioned."""
    key = lambda r: (re.sub(r'[^a-z0-9]', '', r['name'].lower()), r.get('type'))
    groups, order = {}, []
    for r in records:
        k = key(r)
        if k not in groups:
            groups[k] = []
            order.append(k)
        groups[k].append(r)
    out = []
    for k in order:
        rs = groups[k]
        if len(rs) == 1:
            out.append(rs[0])
            continue
        base = dict(max(rs, key=lambda r: len(r['description'])))
        base['extra'] = dict(base['extra'])
        texts = [r['description'] for r in rs if r['description'] and r['description'] != base['description']]
        extra_text = []
        for t in dict.fromkeys(texts):
            if t not in base['description']:
                extra_text.append(t)
        short = [t for t in extra_text if len(t) <= 160]
        long_ = [t for t in extra_text if len(t) > 160]
        base['description'] = '\n\n'.join(([('Appearance: ' + '; '.join(short))] if short else []) + [base['description']] + long_).strip()
        for r in rs:
            for f, v in r['extra'].items():
                if f == 'Types':
                    base['extra']['Types'] = list(dict.fromkeys(base['extra'].get('Types', []) + v))
                elif v and not base['extra'].get(f):
                    base['extra'][f] = v
            base['alias'] = base['alias'] or r['alias']
        base['teams'] = list(dict.fromkeys(r['team'] for r in rs if r.get('team')))
        base['notes'] = list(dict.fromkeys(n for r in rs for n in r['notes']))
        out.append(base)
    return out


def main():
    kind, docs_dir, out = sys.argv[1:4]
    if kind not in KINDS:
        sys.exit(f'unknown kind {kind!r}; expected one of {", ".join(KINDS)}')
    cfg = KINDS[kind]
    if 'glob' in cfg:
        import glob as _glob
        files = sorted({os.path.relpath(f, docs_dir) for g in cfg['glob'] for f in _glob.glob(os.path.join(docs_dir, g))
                        if not os.path.basename(f).startswith('~$')})       # skip Word lock files
    else:
        files = sorted(f for f in os.listdir(docs_dir) if f.endswith('.docx')
                       and any(f'({d})' in f for d in cfg['docs']))
    records, problems = [], []
    for f in files:
        r, p = parse_doc(os.path.join(docs_dir, f), kind)
        records += r
        problems += p
    if cfg.get('merge_duplicates'):
        records = merge_duplicates(records)
    seen = set()
    for r in records:                                           # unique slugs; suffix on collision
        base = slugify(r['name'])
        slug = base if base not in seen else f"{base}-{slugify(r.get('type') or kind)}"
        n = 2
        while slug in seen:
            slug, n = f'{base}-{n}', n + 1
        seen.add(slug)
        r['slug'] = slug
    json.dump({'kind': kind, 'records': records, 'problems': problems}, open(out, 'w'), indent=1, ensure_ascii=False)
    print(f'{kind}: {len(records)} entries from {len(files)} document(s), {len(problems)} unparsed paragraphs')


if __name__ == '__main__':
    main()
