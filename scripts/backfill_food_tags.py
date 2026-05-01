#!/usr/bin/env python3
"""Backfills foodTags (dishType, mealTime, vibe) into food.json entries."""

import json
import re
from pathlib import Path

FOOD_JSON = Path(__file__).parent.parent / "src/data/categories/food.json"

# Ordered most-specific first so earlier patterns win for ambiguous names.
NAME_TO_DISH: list[tuple[str, str]] = [
    (r'bún mắm nêm|mắm nêm',           'bun-mam-nem'),
    (r'bún thịt nướng',                 'bun-thit-nuong'),
    (r'bún nghệ',                       'bun-nghe'),
    (r'bún chay',                       'bun-chay'),
    (r'bún bò',                         'bun-bo'),
    (r'\bbún\b',                        'bun'),
    (r'bánh ép',                        'banh-ep'),
    (r'bánh bèo|nậm lọc',              'banh-beo'),
    (r'bánh canh chả cua|chả cua',      'cha-cua'),
    (r'bánh canh cá lóc|cá lóc',       'ca-loc'),
    (r'nam phổ|nam pho',                'nam-pho'),
    (r'bánh canh',                      'banh-canh'),
    (r'cơm hến',                        'com-hen'),
    (r'\bốc\b',                         'oc'),
    (r'\bchè\b',                        'che'),
]

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
    results: list[str] = []
    for pattern, dish in NAME_TO_DISH:
        if re.search(pattern, lowered) and dish not in results:
            results.append(dish)
    return results


def infer_meal_times(tags: list[str]) -> list[str]:
    return [TAG_TO_MEAL_TIME[t] for t in tags if t in TAG_TO_MEAL_TIME]


def infer_vibe(tags: list[str]) -> list[str]:
    return [TAG_TO_VIBE[t] for t in tags if t in TAG_TO_VIBE]


def main() -> None:
    data = json.loads(FOOD_JSON.read_text(encoding='utf-8'))

    tagged = 0
    untagged_names: list[str] = []

    for place in data['places']:
        dish_types = infer_dish_types(place['name'])
        meal_times = infer_meal_times(place.get('tags', []))
        vibe       = infer_vibe(place.get('tags', []))

        place['foodTags'] = {
            'dishType': dish_types,
            'mealTime': meal_times,
            'vibe':     vibe,
        }

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
