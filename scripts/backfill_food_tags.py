#!/usr/bin/env python3
"""Backfills foodTags (dishType, mealTime, vibe) into food.json entries."""

import json
import re
import unicodedata
from pathlib import Path

FOOD_JSON = Path(__file__).parent.parent / "src/data/categories/food.json"


def _strip(s: str) -> str:
    """Remove diacritics for ASCII fallback matching."""
    return ''.join(c for c in unicodedata.normalize('NFKD', s) if not unicodedata.combining(c))


# Ordered most-specific first so earlier patterns win for ambiguous names.
# Each pattern is matched against both the original lowercased name AND its
# diacritic-stripped ASCII form, so names like "Quan Bun Bo Hue" (no
# diacritics) are handled automatically without extra entries.
NAME_TO_DISH: list[tuple[str, str]] = [
    (r'bún mắm nêm|mắm nêm',                               'bun-mam-nem'),
    (r'bún thịt nướng',                                     'bun-thit-nuong'),
    (r'bún nghệ',                                           'bun-nghe'),
    (r'bún chay',                                           'bun-chay'),
    (r'bún bò',                                             'bun-bo'),
    (r'\bbún\b',                                            'bun'),
    (r'nem lụi',                                            'nem-lui'),
    (r'bánh tráng cuốn',                                    'banh-trang-cuon'),
    (r'\bchay\b|vegetarian',                                'com-chay'),
    (r'bánh ép',                                            'banh-ep'),
    (r'bánh bèo|bánh nậm|bánh lọc|nậm lọc|nậm-lọc'
     r'|\bbèo\b.{0,15}\bnậm\b|\bnậm\b.{0,15}\bbèo\b',     'banh-beo'),
    (r'bánh canh chả cua|chả cua',                          'cha-cua'),
    (r'bánh canh cá lóc|cá lóc',                           'ca-loc'),
    (r'nam phổ|nam pho',                                    'nam-pho'),
    (r'bánh canh',                                          'banh-canh'),
    (r'cơm hến',                                            'com-hen'),
    (r'\bốc\b|\boc\b',                                      'oc'),
    (r'\bchè\b',                                            'che'),
]

# Manual overrides for places whose dish types cannot be inferred from
# the name alone (multi-dish restaurants, owner-name stalls, etc.).
MANUAL_DISH_TYPES: dict[str, list[str]] = {
    'Quán Mắm Huế':                                         ['bun-mam-nem'],
    'Bà Hoà':                                               ['com-hue'],
    'Quán Mệ Thẻo':                                         ['com-hue'],
    'Bến Ngự quán':                                         ['com-hue'],
    'Bép Mệ Chút':                                          ['com-hue'],
    'Maison Trang':                                         ['com-hue'],
    'Quán ăn An Tâm':                                       ['com-hue'],
    'Bếp Thị':                                              ['com-hue'],
    'A Bo Quán':                                            ['com-hue'],
    'Nhà Hàng Vỹ Dạ Xưa':                                  ['com-hue'],
    'Đặc Sản Xứ Quảng':                                     ['com-hue'],
    'Hàng Me Mẹ':                                           ['banh-beo'],
    'Tiệm Chang Bánh Đúc Nem Rán Hà Nội':                  ['com-hue'],
    'Quán Nón Huế-Đặc Sản Món Huế-Authentic Hue Food':     ['com-hue'],
    'Quán bánh O Lé':                                       ['banh-beo'],
    'Quán Bánh Chi':                                        ['banh-beo'],
    'An thành quán( Bánh Huế An Thành)':                    ['banh-beo'],
}

# Replacement vibe text for new dish types, applied only when the current
# vibe is a generic auto-generated fallback (to avoid clobbering hand-written vibes).
DISH_VIBES: dict[str, str] = {
    'nem-lui':          'Nem lụi nướng than hoa — thơm phức, chấm mắm me đặc trưng xứ Huế.',
    'banh-trang-cuon':  'Bánh tráng cuốn heo quay — giòn tan, thơm ngon, đặc sản cuốn xứ Huế.',
    'com-chay':         'Bếp chay thanh tịnh — ngon lành, nhẹ nhàng và tốt cho sức khoẻ.',
    'com-hue':          'Thực đơn đa dạng mang hương vị Huế — đậm đà, thân quen và đúng vị.',
    'banh-beo':         'Bánh bèo, nậm, lọc — những viên bánh nhỏ đặc sản Huế mộc mạc và đậm đà.',
    'bun-mam-nem':      'Bún mắm nêm thơm nồng — nước chấm sánh mịn, đặc sản không nơi nào có.',
}

GENERIC_VIBES = frozenset({
    'Quán ăn quen thuộc của người Huế — giản dị, ngon và thật.',
    'Nhà hàng địa phương với thực đơn đa dạng, phù hợp mọi bữa ăn.',
    'Tiệm bánh Huế giản dị, mỗi chiếc bánh là một hương vị riêng.',
})

TAG_TO_MEAL_TIME: dict[str, str] = {
    'ăn sáng': 'breakfast',
    'ăn trưa': 'lunch',
    'ăn tối':  'dinner',
}

TAG_TO_VIBE: dict[str, str] = {
    'gia đình':      'family_friendly',
    'đặt bàn được':  'reservation_available',
}


def infer_dish_types(name: str) -> list[str]:
    lowered = name.lower()
    ascii_lower = _strip(lowered)
    results: list[str] = []
    for pattern, dish in NAME_TO_DISH:
        ascii_pattern = _strip(pattern)
        if (re.search(pattern, lowered) or re.search(ascii_pattern, ascii_lower)) and dish not in results:
            results.append(dish)
    return results


def infer_meal_times(tags: list[str]) -> list[str]:
    return [TAG_TO_MEAL_TIME[t] for t in tags if t in TAG_TO_MEAL_TIME]


def infer_vibe_tags(tags: list[str]) -> list[str]:
    return [TAG_TO_VIBE[t] for t in tags if t in TAG_TO_VIBE]


def maybe_update_vibe(current_vibe: str, dish_types: list[str]) -> str:
    if current_vibe not in GENERIC_VIBES:
        return current_vibe
    for dish in dish_types:
        if dish in DISH_VIBES:
            return DISH_VIBES[dish]
    return current_vibe


def main() -> None:
    data = json.loads(FOOD_JSON.read_text(encoding='utf-8'))

    tagged = 0
    untagged_names: list[str] = []

    for place in data['places']:
        dish_types = MANUAL_DISH_TYPES.get(place['name']) or infer_dish_types(place['name'])
        meal_times = infer_meal_times(place.get('tags', []))
        vibe_tags  = infer_vibe_tags(place.get('tags', []))

        place['foodTags'] = {
            'dishType': dish_types,
            'mealTime': meal_times,
            'vibe':     vibe_tags,
        }
        place['vibe'] = maybe_update_vibe(place.get('vibe', ''), dish_types)

        if dish_types:
            tagged += 1
        else:
            untagged_names.append(place['name'])

    FOOD_JSON.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding='utf-8',
    )

    print(f"Done. Tagged: {tagged}, Untagged: {len(untagged_names)}")
    if untagged_names:
        print("\nPlaces with no dishType (manual review recommended):")
        for n in untagged_names:
            print(f"  - {n}")


if __name__ == '__main__':
    main()
