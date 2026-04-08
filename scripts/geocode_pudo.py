#!/usr/bin/env python3
"""Reverse geocode pudosRoma.json entries to get via (street name)."""
import json, urllib.request, time, sys

SRC = 'src/data/pudosRoma.json'
DELAY = 1.1  # Nominatim policy: 1 req/sec

def reverse_geocode(lat, lng):
    url = (
        f'https://nominatim.openstreetmap.org/reverse'
        f'?format=json&lat={lat}&lon={lng}&zoom=18&addressdetails=1'
    )
    req = urllib.request.Request(url, headers={'User-Agent': 'FermopointDemo/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=8) as r:
            obj = json.loads(r.read())
        addr = obj.get('address', {})
        road = addr.get('road') or addr.get('pedestrian') or addr.get('path') or ''
        return road
    except Exception as e:
        return ''

with open(SRC, encoding='utf-8') as f:
    data = json.load(f)

todo = [i for i, p in enumerate(data) if not p.get('via')]
print(f'Geocoding {len(todo)} entries...', flush=True)

for n, i in enumerate(todo):
    p = data[i]
    via = reverse_geocode(p['lat'], p['lng'])
    data[i]['via'] = via
    if n % 50 == 0 or n == len(todo) - 1:
        with open(SRC, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
        pct = (n + 1) / len(todo) * 100
        print(f'  {n+1}/{len(todo)} ({pct:.0f}%) - last: {p["id"]} - "{via}"', flush=True)
    time.sleep(DELAY)

print('Done.', flush=True)
