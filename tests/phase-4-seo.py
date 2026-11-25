from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import json
import xml.etree.ElementTree as ET

pages = ['index','products','solutions','developers','security','company','pricing','contact']
origin = 'https://necore.dev'
class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.meta = {}
        self.canon = []
        self.ids = []
        self.links = []
        self.schemas = []
        self.in_schema = False
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'meta':
            key = a.get('name') or a.get('property')
            if key:
                assert key not in self.meta, 'duplicate metadata: '+key
                self.meta[key] = a.get('content','')
        if tag == 'link' and a.get('rel') == 'canonical':
            self.canon.append(a['href'])
        if a.get('id'):
            self.ids.append(a['id'])
        if tag == 'a' and a.get('href'):
            self.links.append(a['href'])
        if tag == 'script' and a.get('type') == 'application/ld+json':
            self.in_schema = True
    def handle_data(self, data):
        if self.in_schema:
            self.schemas.append(json.loads(data))
    def handle_endtag(self, tag):
        if tag == 'script':
            self.in_schema = False

expected = {origin+('/' if p=='index' else '/'+p) for p in pages}
root = ET.parse('sitemap.xml')
urls = [x.text for x in root.findall('{*}url/{*}loc')]
assert set(urls)==expected and len(urls)==len(expected)
assert 'Sitemap: '+origin+'/sitemap.xml' in Path('robots.txt').read_text()
parsed = {p:Page(Path(p+'.html').read_text()) for p in pages}
for p, page in parsed.items():
    url = origin+('/' if p=='index' else '/'+p)
    assert page.canon == [url], p
    assert page.meta['og:url'] == url, p
    assert page.meta['robots'] == 'index,follow', p
    assert page.meta['og:image'].startswith(origin+'/assets/'), p
    assert page.meta['twitter:image']==page.meta['og:image'], p
    assert page.schemas, p
    assert len(page.ids)==len(set(page.ids)), 'duplicate ID: '+p
    assert 'main' in page.ids, p
    for href in page.links:
        parts = urlsplit(href)
        if parts.netloc or parts.scheme:
            continue
        path = parts.path.strip('/')
        target = p if not parts.path else (path.removesuffix('.html') or 'index')
        if target in parsed and parts.fragment:
            assert parts.fragment in parsed[target].ids, (p,href)
        elif path:
            assert Path(path).exists() or Path(path+'.html').exists(), (p,href)
assert len({p.meta['description'] for p in parsed.values()})==len(pages)
assert len({p.meta['og:title'] for p in parsed.values()})==len(pages)
assert 'noindex' in Page(Path('emergency-intro.html').read_text()).meta['robots']
assert 'noindex' in Page(Path('404.html').read_text()).meta['robots']
assert '<form' not in Path('contact.html').read_text()
print('Canonical URLs, metadata, JSON-LD, local links, sitemap and disabled enquiries validated.')
