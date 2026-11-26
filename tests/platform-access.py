from pathlib import Path
from html.parser import HTMLParser

PAGES = ("index", "products", "solutions", "developers", "security", "company", "pricing", "contact")
class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links=[]
    def handle_starttag(self, tag, attrs):
        if tag=="a":
            self.links.append(dict(attrs))
for name in PAGES:
    p=Links()
    p.feed(Path(name+".html").read_text())
    access=[a for a in p.links if "platform-access" in a.get("class","").split()]
    assert len(access)==1,name
    assert access[0]["href"]=="https://staging.necore.dev/console/",name
    assert any(a.get("href")=="contact.html" and "btn-primary" in a.get("class","").split() for a in p.links),name
print("Staging access and existing demo links validated.")
