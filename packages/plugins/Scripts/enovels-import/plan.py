"""Turn parse_docs.py output into an import plan (+ preview CSV) for import_exec.js.

Relations are expressed by *name*; import_exec.js resolves them to ids inside the container
and skips anything that already exists, so plans are safe to re-run.
Usage: python3 plan.py PARSED.json PLAN.json PREVIEW.csv
"""
import csv, json, re, sys

SKIP_NAMES = {'Nick', 'L Ni'}  # broken text fragments in the Kids chapter


def cap(s):
    s = (s or '').strip()
    return s[:1].upper() + s[1:]


def with_lead(lead, body):
    """Prefix 'Label: value' lines (the NAME: block details) to the description."""
    lead = [l for l in lead if l]
    body = cap(body)
    return '\n'.join(lead) + ('\n\n' if lead and body else '') + body


def notes_line(r):
    return 'Note: ' + '; '.join(r['notes']) if r['notes'] else None


def split_list(value, extra=r''):
    """'A (Brother), B & C' -> ['A', 'B', 'C']."""
    out = []
    for part in re.split(r',(?![^()]*\))|\s+&\s+' + extra, value or ''):
        n = re.sub(r'\s*\([^)]*\)', '', part).strip()
        if n and n.upper() not in ('N/A', 'VARIOUS', 'UNKNOWN', 'NONE'):
            out.append(n)
    return out


# --- characters -------------------------------------------------------------

def stories_for(value):
    """'Verona & Roman and Julia' -> ['Verona', 'Roman & Julia']; bare 'Chapter N' -> []."""
    if not value:
        return []
    v = re.sub(r'^throughout\s+', '', value.strip(), flags=re.I)
    v = re.sub(r'roman and julia', 'Roman & Julia', v, flags=re.I)
    parts = [v] if v.lower() == 'roman & julia' else re.split(r'\s+&\s+(?!Julia)', v)
    out = []
    for p in parts:
        p = re.sub(r'\s+(chapter|story)\s+\d+$', '', p.strip(), flags=re.I)
        if p and not re.fullmatch(r'(chapter|story)\s+\d+', p, flags=re.I):
            out.append(p)
    return out


def places_for(value):
    if not value or value.strip().lower() in ('unknown', 'n/a'):
        return []
    v = re.sub(r'\s*\([^)]*\)', '', value)
    return [p.strip() for p in re.split(r'\s+&\s+|\s+and\s+', v) if p.strip()]


# Monster "Types" / "Level" vocabulary, matched to the existing options (see Water Made).
TYPE_FIX = {'pryo': 'Pyro', 'geo': 'Geo', 'toy': 'Toy', 'day': 'Day'}
LEVELS = {'battle': 'Battle', 'ability': 'Ability', 'enrage': 'Enrage', 'extreme': 'Extreme',
          'baby form': 'Baby Form', 'godly': 'Godly Level', 'godly level': 'Godly Level',
          'god level': 'Godly Level', 'special evolve': 'Special Evolve'}


def split_paren(v):
    """'Metal (Machine)' -> ('Metal', 'Machine'); tolerates an unclosed '(' ."""
    m = re.match(r'^\s*([^(]+?)\s*(?:\((.*?)\)?)?\s*$', v or '')
    return (m.group(1).strip(), (m.group(2) or '').strip(' )0')) if m else (v, '')


def monster_options(x, lead):
    opts = []
    for t in x.get('Types', []):
        base, sub = split_paren(t)
        base = TYPE_FIX.get(base.lower(), base.title())
        opts.append({'name': base, 'category': 'Types'})
        if sub:
            lead.append(f'{base} type: {sub}')
    if x.get('Class'):
        base, sub = split_paren(x['Class'])
        level = LEVELS.get(base.lower())
        if level:
            opts.append({'name': level, 'category': 'Level'})
            if sub:
                lead.append(f'Level note: {sub}')
        else:
            lead.append(f"Level: {x['Class']}")
    return opts


def parse_age(v):
    """'3,000 years old' -> 3000, '20' -> 20; anything else stays text."""
    m = re.fullmatch(r'\s*([\d,]+)\s*(?:years?\s*old)?\s*\.?', v or '', flags=re.I)
    return int(m.group(1).replace(',', '')) if m else None


def abilities_for(x):
    raw = '; '.join(v for k, v in x.items() if k.lower().startswith('abil'))
    out = []
    for part in re.split(r',|;|\s+&\s+|\s+and\s+', re.sub(r'\([^)]*\)', '', raw)):
        a = part.strip(' .&')
        a = re.sub(r'^(?:and|&)\s+', '', a, flags=re.I)
        if a and a.upper() not in ('NONE', 'N/A', 'UNKNOWN', 'VARIES') and len(a) <= 120:
            out.append(a[:1].upper() + a[1:])
    return list(dict.fromkeys(out))


def plan_character(r):
    x = r['extra']
    lead = [f"Title: {x['Title']}" if x.get('Title') else None,
            f"Position: {x['Job Or Position']}" if x.get('Job Or Position') else None,
            f"Rank: {x['Rank']}" if x.get('Rank') else None,
            f"Creature: {x['Creature']}" if x.get('Creature') else None,
            f"Class: {x['Class']}" if x.get('Class') and not x.get('Types') else None,
            f"Hall of: {x['Hall Of']}" if x.get('Hall Of') else None,
            f"Partner: {x['Partner'].replace('->', '→')}" if x.get('Partner') else None]
    options = monster_options(x, lead) if x.get('Types') or (x.get('Class') and r.get('type') == 'Monster') else []
    if x.get('Evolves From'):
        lead.append(f"Evolves from: {x['Evolves From']}")
    age = parse_age(x.get('Age'))
    if x.get('Age') and age is None and x['Age'].strip().upper() not in ('N/A', 'UNKNOWN'):
        lead.append(f"Age: {x['Age']}")
    alias = [a for a in [r['alias'], x.get('Alias')] if a and a.strip().upper() not in ('NONE', 'N/A')]
    cats = r.get('category')
    teams = r.get('teams') or ([r['team']] if r.get('team') else [])
    affiliates = split_list(x.get('Affiliates'), r'|/')
    affiliates += [t for t in teams if t not in affiliates]
    if r.get('member_of') and r['member_of'] not in affiliates:
        affiliates.append(r['member_of'])
    if x.get('Partner'):
        affiliates += [p.strip() for p in x['Partner'].split('->') if p.strip()]
    row = {
        'name': r['name'], 'slug': r['slug'], 'alias': ', '.join(dict.fromkeys(alias)) or None, 'type': r['type'],
        'status': 'published',
        'description': with_lead(lead + [notes_line(r)], r['description']),
        'universe': [r['universe']] if r.get('universe') else [],
        'categories': [c for c in (cats if isinstance(cats, list) else [cats]) if c],
        'stories': stories_for(x.get('Story')),
        'places': places_for(x.get('Place Of Residence')),
        'affiliates': list(dict.fromkeys(affiliates)),
    }
    # New-folder fields; omitted when empty so the original character plans are unchanged.
    if age is not None:
        row['age'] = age
    # Short ability names become linked `abilities` records; sentence-like ones stay readable text.
    abil = abilities_for(x)
    short = [a for a in abil if len(a) <= 60 and len(a.split()) <= 6]
    long_ = [a for a in abil if a not in short]
    if short:
        row['abilities'] = short
    if long_:
        row['description'] = with_lead(['Abilities: ' + '; '.join(long_)], row['description'])
    if options:
        row['options'] = options
    return row


# --- places / items / dictionary ------------------------------------------

def plan_place(r):
    x = r['extra']
    return {
        'name': r['name'], 'slug': r['slug'], 'status': 'published', 'location': x.get('Location'),
        'description': with_lead([f"Also known as: {r['alias']}" if r['alias'] else None,
                                  f"Race: {x['Race']}" if x.get('Race') else None,
                                  f"Residents: {x['Residents']}" if x.get('Residents') else None,
                                  notes_line(r)], r['description']),
    }


def plan_item(r):
    x = r['extra']
    owner = x.get('Story Or Character')
    return {
        'name': r['name'], 'slug': r['slug'], 'status': 'published',
        'description': with_lead([f"Also known as: {r['alias']}" if r['alias'] else None,
                                  f"Story or character: {owner}" if owner else None,
                                  f"Race: {x['Race']}" if x.get('Race') else None,
                                  notes_line(r)], r['description']),
        'characters': split_list(owner) + split_list(x.get('Race')),  # linked only if a character matches
    }


def plan_definition(r):
    x = r['extra']
    return {
        'name': r['name'], 'slug': r['slug'], 'status': 'published', 'type': 'definition',
        'description': with_lead([f"Also known as: {r['alias']}" if r['alias'] else None,
                                  *(f'{k}: {x[k]}' for k in ('Type', 'User', 'Age', 'Cause') if x.get(k)),
                                  notes_line(r)], r['description']),
    }


KINDS = {
    'characters': {'collection': 'characters', 'row': plan_character},
    'places': {'collection': 'places', 'row': plan_place, 'text_fields': ['description']},
    'items': {'collection': 'items', 'row': plan_item, 'text_fields': ['description'],
              'links': {'characters': {'junction': 'items_characters', 'self': 'items_id', 'other': 'characters_id'}}},
    'dictionary': {'collection': 'dictionary', 'row': plan_definition},
    'heroes': {'collection': 'characters', 'row': plan_character},
    'mythology': {'collection': 'characters', 'row': plan_character},
    'monsters': {'collection': 'characters', 'row': plan_character},
}


def fmt(v):
    if isinstance(v, list):
        return '; '.join(f"{o['category']}: {o['name']}" if isinstance(o, dict) else str(o) for o in v)
    return '' if v is None else v


def main():
    parsed_path, plan_path, csv_path = sys.argv[1:4]
    parsed = json.load(open(parsed_path))
    kind = parsed['kind']
    cfg = KINDS[kind]
    rows, skipped = [], []
    for r in parsed['records']:
        if r['name'] in SKIP_NAMES:
            skipped.append(r['name'])
            continue
        row = cfg['row'](r)
        row['_source'] = r['source']
        rows.append(row)
    plan = {'kind': kind, 'collection': cfg['collection'], 'rows': rows,
            'text_fields': cfg.get('text_fields', []), 'links': cfg.get('links', {})}
    if cfg['collection'] == 'characters':
        plan['categories'] = sorted({c for p in rows for c in p['categories']})
        plan['stories'] = sorted({s for p in rows for s in p['stories']})
        plan['places'] = sorted({s for p in rows for s in p['places']})
        plan['abilities'] = sorted({a for p in rows for a in p.get('abilities', [])})
        plan['options'] = sorted({(o['category'], o['name']) for p in rows for o in p.get('options', [])})
    json.dump(plan, open(plan_path, 'w'), indent=1, ensure_ascii=False)

    cols = list(dict.fromkeys(c for row in rows for c in row if not c.startswith('_')))
    with open(csv_path, 'w', newline='', encoding='utf-8-sig') as f:  # BOM so Excel reads UTF-8
        w = csv.writer(f)
        w.writerow(['source'] + cols)
        for row in rows:
            w.writerow([row['_source'].replace('Elite Novels ', '').replace('.docx', '')] +
                       [fmt(row.get(c)) for c in cols])
    with open(csv_path.replace('.csv', '-unparsed.csv'), 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.writer(f)
        w.writerow(['source', 'section', 'text'])
        for p in parsed['problems']:
            w.writerow([p['source'], p.get('section') or '', p['text']])
    print(f'{kind}: {len(rows)} planned rows, skipped {skipped or "none"}, '
          f'{len(parsed["problems"])} unparsed paragraphs -> {csv_path}')


if __name__ == '__main__':
    main()
