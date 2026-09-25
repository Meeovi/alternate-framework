"""Minimal .docx reader: yields paragraphs with style, text, bold-prefix and image refs."""
import zipfile, re, sys
import xml.etree.ElementTree as ET
W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
R = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
A = '{http://schemas.openxmlformats.org/drawingml/2006/main}'

def read(path):
    z = zipfile.ZipFile(path)
    doc = ET.fromstring(z.read('word/document.xml'))
    styles = {}
    if 'word/styles.xml' in z.namelist():
        for s in ET.fromstring(z.read('word/styles.xml')).iter(W + 'style'):
            n = s.find(W + 'name')
            styles[s.get(W + 'styleId')] = n.get(W + 'val') if n is not None else s.get(W + 'styleId')
    rels = {}
    if 'word/_rels/document.xml.rels' in z.namelist():
        for r in ET.fromstring(z.read('word/_rels/document.xml.rels')):
            rels[r.get('Id')] = r.get('Target')
    out = []
    for p in doc.iter(W + 'p'):
        ps = p.find(W + 'pPr/' + W + 'pStyle')
        style = styles.get(ps.get(W + 'val'), ps.get(W + 'val')) if ps is not None else ''
        num = p.find(W + 'pPr/' + W + 'numPr') is not None
        text, bold = '', ''
        lead = True
        for r in p.iter(W + 'r'):
            t = ''.join((x.text or '') if x.tag == W + 't' else ('\t' if x.tag == W + 'tab' else ('\n' if x.tag == W + 'br' else '')) for x in r)
            b = r.find(W + 'rPr/' + W + 'b')
            isb = b is not None and b.get(W + 'val') not in ('0', 'false')
            if lead and isb: bold += t
            elif t.strip(): lead = False
            text += t
        imgs = [rels.get(bl.get(R + 'embed')) for bl in p.iter(A + 'blip')]
        if text.strip() or imgs:
            out.append({'style': style, 'list': num, 'text': text.strip(), 'bold': bold.strip(), 'imgs': imgs})
    return out

if __name__ == '__main__':
    for path in sys.argv[1:]:
        ps = read(path)
        styles = {}
        for p in ps: styles[p['style'] or '(none)'] = styles.get(p['style'] or '(none)', 0) + 1
        print(f"\n##### {path.split('/')[-1]}: {len(ps)} paras, {sum(len(p['imgs']) for p in ps)} images, styles={styles}")
        for p in ps[:45]:
            tag = f"[{p['style'] or '-'}{' •' if p['list'] else ''}]"
            b = f" <b>{p['bold'][:40]}</b>" if p['bold'] else ''
            im = f" IMG{p['imgs']}" if p['imgs'] else ''
            print(f"{tag:22}{b} {p['text'][:150]!r}{im}")
