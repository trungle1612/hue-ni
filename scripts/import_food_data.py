import csv, glob, json, os, re, sys, unicodedata

path = sys.argv[1]
force_dish_type = sys.argv[2] if len(sys.argv) > 2 else None
if os.path.isdir(path):
    csv_files = sorted(glob.glob(os.path.join(path, '*.csv')))
else:
    csv_files = [path]

TARGET = 'src/data/categories/food.json'

with open(TARGET, encoding='utf-8') as f:
    data = json.load(f)

existing_names_lower = {p['name'].lower() for p in data['places']}

def make_id(name):
    s = unicodedata.normalize('NFKD', name)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
    return s

def parse_hours(h_str):
    if not h_str:
        return {'open': '06:00', 'close': '21:00'}
    try:
        h = json.loads(h_str)
        slot = list(h.values())[0][0]
        o, c = slot.split('-')
        return {'open': o.strip(), 'close': c.strip()}
    except:
        return {'open': '06:00', 'close': '21:00'}

def parse_price(raw):
    if not raw or not raw.strip():
        return '₫'
    raw = raw.strip()
    if '₫₫₫' in raw or raw.count('d') >= 3 or raw.count('D') >= 3:
        return '₫₫₫'
    if '₫₫' in raw or raw.count('d') == 2 or raw.count('D') == 2:
        return '₫₫'
    return '₫'

def generate_tags(r):
    tags = set(['ẩm thực'])
    addr = (r.get('address') or '').lower()
    location_map = [
        (['kim long', 'nguyen phuc nguyen', 'nguyen hoang'], 'kim long'),
        (['vy da', 'nguyen sinh cung'], 'vỹ dạ'),
        (['thuy xuan', 'huyen tran cong chua'], 'thủy xuân'),
        (['le loi', 'ben nghe'], 'bến sông'),
        (['dong ba'], 'chợ đông ba'),
        (['thanh noi', 'dinh tien hoang', 'doan thi diem'], 'thành nội'),
    ]
    for keys, tag in location_map:
        if any(k in addr for k in keys):
            tags.add(tag)
    try:
        about = json.loads(r.get('about', '') or '{}')
    except:
        about = {}
    atmo = about.get('Bầu không khí', {})
    if atmo.get('Yên tĩnh'): tags.add('yên tĩnh')
    if atmo.get('Ấm cúng'): tags.add('ấm cúng')
    if atmo.get('Bình dân'): tags.add('bình dân')
    noi_bat = about.get('Điểm nổi bật', {})
    if noi_bat.get('Đồ ăn ngon'): tags.add('đồ ăn ngon')
    for k in noi_bat:
        if 'sáng' in k.lower(): tags.add('ăn sáng')
        if 'trưa' in k.lower(): tags.add('ăn trưa')
        if 'tối' in k.lower(): tags.add('ăn tối')
    lua_chon = about.get('Lựa chọn ăn uống', {})
    for k in lua_chon:
        if 'sáng' in k.lower() or 'nửa buổi' in k.lower(): tags.add('ăn sáng')
        if 'trưa' in k.lower(): tags.add('ăn trưa')
        if 'tối' in k.lower(): tags.add('ăn tối')
    dv = about.get('Các tùy chọn dịch vụ', {})
    if dv.get('Ngồi ngoài trời'): tags.add('ngoài trời')
    if dv.get('Giao hàng'): tags.add('giao hàng')
    kh = about.get('Lên kế hoạch', {})
    if kh.get('Nhận đặt chỗ'): tags.add('đặt bàn được')
    if about.get('Thú cưng'): tags.add('thú cưng')
    khach = about.get('Khách hàng', {})
    if khach.get('Dành cho gia đình'): tags.add('gia đình')
    return sorted(tags)

def generate_tips(name, address, about_str, csv_description):
    tips = []
    try:
        about = json.loads(about_str) if about_str else {}
    except:
        about = {}
    h = about.get('Điểm nổi bật', {})
    sv = about.get('Các tùy chọn dịch vụ', {})
    kh = about.get('Lên kế hoạch', {})
    if h.get('Đồ ăn ngon'):
        tips.append('Món ở đây được đánh giá ngon — nên gọi thêm các món đặc trưng của quán.')
    for k in h:
        if 'sáng' in k.lower():
            tips.append('Quán phục vụ bữa sáng — đến sớm trước 8h để tránh đông.')
            break
    if sv.get('Giao hàng'):
        tips.append('Quán có giao hàng tận nơi — tiện cho bữa ăn tại nhà.')
    if sv.get('Ngồi ngoài trời'):
        tips.append('Có chỗ ngồi ngoài trời — thích hợp khi trời mát.')
    if kh.get('Nhận đặt chỗ'):
        tips.append('Có thể đặt bàn trước — nên đặt sớm vào cuối tuần.')
    if csv_description and csv_description.strip() and len(tips) < 2:
        tips.append(csv_description.strip()[:120])
    return tips[:3]

_NAME_TO_DISH = [
    (r'bún mắm nêm|mắm nêm', 'bun-mam-nem'),
    (r'bún thịt nướng', 'bun-thit-nuong'),
    (r'bún nghệ', 'bun-nghe'),
    (r'bún chay', 'bun-chay'),
    (r'bún bò', 'bun-bo'),
    (r'\bbún\b', 'bun'),
    (r'nem lụi', 'nem-lui'),
    (r'bánh tráng cuốn', 'banh-trang-cuon'),
    (r'\bchay\b|vegetarian', 'com-chay'),
    (r'bánh ép', 'banh-ep'),
    (r'bánh bèo|bánh nậm|bánh lọc|nậm lọc', 'banh-beo'),
    (r'bánh canh chả cua|chả cua', 'cha-cua'),
    (r'bánh canh cá lóc|cá lóc', 'ca-loc'),
    (r'nam phổ|nam pho', 'nam-pho'),
    (r'bánh canh', 'banh-canh'),
    (r'cơm hến', 'com-hen'),
    (r'\bốc\b|\boc\b', 'oc'),
    (r'\bchè\b', 'che'),
]

def _strip(s):
    return ''.join(c for c in unicodedata.normalize('NFKD', s) if not unicodedata.combining(c))

def generate_food_tags(name, r):
    lowered = name.lower()
    ascii_lower = _strip(lowered)
    dish_types = []
    for pattern, dish in _NAME_TO_DISH:
        if (re.search(pattern, lowered) or re.search(_strip(pattern), ascii_lower)) and dish not in dish_types:
            dish_types.append(dish)
    try:
        about = json.loads(r.get('about', '') or '{}')
    except:
        about = {}
    meal_times = []
    for section in [about.get('Điểm nổi bật', {}), about.get('Lựa chọn ăn uống', {})]:
        for k in section:
            kl = k.lower()
            if ('sáng' in kl or 'nửa buổi' in kl) and 'breakfast' not in meal_times:
                meal_times.append('breakfast')
            if 'trưa' in kl and 'lunch' not in meal_times:
                meal_times.append('lunch')
            if 'tối' in kl and 'dinner' not in meal_times:
                meal_times.append('dinner')
    vibe_tags = []
    if about.get('Khách hàng', {}).get('Dành cho gia đình'):
        vibe_tags.append('family_friendly')
    if about.get('Lên kế hoạch', {}).get('Nhận đặt chỗ'):
        vibe_tags.append('reservation_available')
    return {'dishType': dish_types, 'mealTime': meal_times, 'vibe': vibe_tags}

def generate_vibe(name, r):
    n = name.lower()
    if 'bún bò' in n: return 'Tô bún bò đậm vị, nước dùng cay nồng đặc trưng xứ Huế.'
    if 'cơm' in n: return 'Cơm nhà nấu, mộc mạc và đậm đà hương vị truyền thống.'
    if 'bánh' in n: return 'Tiệm bánh Huế giản dị, mỗi chiếc bánh là một hương vị riêng.'
    if 'ốc' in n: return 'Quán ốc bình dân, vui miệng và đậm vị — bữa xế lý tưởng.'
    if 'chè' in n: return 'Chè Huế ngọt thanh, mát lành — đặc sản không thể bỏ qua.'
    if 'lẩu' in n: return 'Lẩu nóng hổi, ngồi quanh bàn — ấm áp và đậm đà.'
    if 'phở' in n: return 'Phở nước trong, thanh nhẹ — sáng sớm lý tưởng.'
    if 'hải sản' in n or 'seafood' in n: return 'Hải sản tươi sống, chế biến đơn giản giữ nguyên vị biển.'
    subtypes = (r.get('subtypes') or '').lower()
    if 'restaurant' in subtypes: return 'Nhà hàng địa phương với thực đơn đa dạng, phù hợp mọi bữa ăn.'
    return 'Quán ăn quen thuộc của người Huế — giản dị, ngon và thật.'

def generate_description(name, r):
    addr = r.get('address', '')
    rating = r.get('rating', '')
    parts = []
    if rating:
        parts.append(f'{name} được đánh giá {rating}/5 sao trên Google Maps.')
    else:
        parts.append(f'{name} là một điểm ăn uống quen thuộc tại Huế.')
    if addr:
        parts.append(f'Tọa lạc tại {addr}, quán phục vụ các món ăn đặc trưng của xứ Huế.')
    else:
        parts.append('Quán phục vụ các món ăn đặc trưng của xứ Huế.')
    return ' '.join(parts)

imported_total, dupes_total, skipped_total = [], [], []

for csv_path in csv_files:
    with open(csv_path, encoding='utf-8') as f:
        rows = list(csv.DictReader(f))

    for r in rows:
        name = r.get('name', '').strip()
        if not name:
            continue
        try:
            lat = float(r.get('latitude') or 0)
            lng = float(r.get('longitude') or 0)
        except:
            skipped_total.append((name, 'invalid coordinates'))
            continue
        if not (16.35 <= lat <= 16.55 and 107.50 <= lng <= 107.70):
            skipped_total.append((name, 'outside Huế'))
            continue
        if r.get('business_status', 'OPERATIONAL') != 'OPERATIONAL':
            skipped_total.append((name, 'not operational'))
            continue
        rating_str = r.get('rating', '').strip()
        try:
            reviews_count = int(r.get('reviews') or 0)
        except:
            reviews_count = 0
        if not rating_str and reviews_count < 5:
            skipped_total.append((name, 'no rating + <5 reviews'))
            continue
        if rating_str and float(rating_str) < 3.0:
            skipped_total.append((name, f'low rating {rating_str}'))
            continue
        if name.lower() in existing_names_lower:
            dupes_total.append(name)
            continue

        photo = r['photo'] if r.get('photo') and 'streetview' not in r['photo'] else ''

        entry = {
            'id':          make_id(name),
            'name':        name,
            'category':    'food',
            'tags':        generate_tags(r),
            'coverImage':  photo,
            'gallery':     [photo] if photo else [],
            'address':     r.get('address', ''),
            'coordinates': {'lat': lat, 'lng': lng},
            'rating':      float(rating_str) if rating_str else 0,
            'priceRange':  parse_price(r.get('prices', '')),
            'hours':       parse_hours(r.get('working_hours', '')),
            'vibe':        generate_vibe(name, r),
            'description': r.get('description', '').strip() or generate_description(name, r),
            'insiderTips': generate_tips(name, r.get('address',''), r.get('about',''), r.get('description','')),
        }
        for key, col in [('phone', 'phone'), ('website', 'website'),
                         ('google_id', 'google_id'), ('place_id', 'place_id')]:
            val = r.get(col, '').strip()
            if val:
                entry[key] = val

        food_tags = generate_food_tags(name, r)
        if force_dish_type and force_dish_type not in food_tags['dishType']:
            food_tags['dishType'].insert(0, force_dish_type)
        entry['foodTags'] = food_tags

        data['places'].append(entry)
        imported_total.append(name)
        existing_names_lower.add(name.lower())

with open(TARGET, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'Imported: {len(imported_total)} | Dupes: {len(dupes_total)} | Skipped: {len(skipped_total)}')
for name, reason in skipped_total:
    print(f'  skip: {name} ({reason})')
