from pathlib import Path
from html import unescape
import json
import re

def read(name):
    return Path(name).read_text()

def code(page, id):
    match = re.search(r'<pre[^>]+id="'+id+r'"[^>]*>(.*?)</pre>', page, re.S)
    assert match, id
    return unescape(re.sub(r'<[^>]+>', '', match[1]))

for page, id in [('index.html','home-code'), ('developers.html','dev-code')]:
    text=code(read(page),id)
    assert 'POST /v1/verification-cases' in text
    assert 'X-API-Key: <service-api-key>' in text
    assert 'Idempotency-Key:' in text
    payload=json.loads(text[text.index('{'):])
    assert set(payload)=={'customer_reference','purpose','requested_checks'}
    assert payload['purpose']=='account_onboarding'
    assert set(payload['requested_checks']) <= {'identity_source','document','liveness'}

text=code(read('developers.html'),'dev-response')
assert '201 Created' in text
payload=json.loads(text[text.index('{'):])
assert payload['status']=='pending'
assert set(payload)=={'id','customer_reference','purpose','requested_checks','status','risk_score','risk_tier','created_at'}
for page, id in [('products.html','capabilities'),('security.html','assurance'),('solutions.html','institutional-path')]:
    assert 'id="'+id+'"' in read(page)
assert 'no live NIN or BVN lookup' in read('products.html')
assert 'no validated fraud prediction' in read('products.html')
assert 'does not claim regulatory approval' in read('security.html')
print('Public contract and status disclosures validated.')
