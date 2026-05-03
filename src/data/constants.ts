import type { Category } from '../types'
import type { FilterOption } from '../components/CategoryFilter'
import type { ComboboxOption } from '../components/FilterCombobox'

export const CATEGORY_LABELS: Record<Category, string> = {
  tomb: 'Lăng tẩm',
  landmark: 'Di tích',
  cafe: 'Cà phê',
  food: 'Ẩm thực',
  homestay: 'Homestay',
  service: 'Dịch vụ',
}

export const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Tất cả', hidden: false  },
  { value: 'tomb', label: 'Lăng tẩm', hidden: true },
  { value: 'landmark', label: 'Di tích', hidden: true },
  { value: 'cafe', label: 'Cà phê', hidden: true },
  { value: 'food', label: 'Ẩm thực', hidden: true },
  { value: 'homestay', label: 'Homestay', hidden: true },
  { value: 'service', label: 'Dịch vụ', hidden: true },
]

export const CAFE_SUB_FILTERS: { value: string | null; label: string }[] = [
  { value: null,          label: 'Tất cả' },
  { value: 'hoai-co',     label: '🏛️ Hoài cổ' },
  { value: 'ca-phe-muoi', label: '☕ Cà phê muối' },
  { value: 'thu-cung',   label: '🐾 Thú cưng' },
  { value: 'check-in',    label: '📸 Check-in' },
  { value: 'workspace',   label: '💻 Workspace' },
  { value: 'san-vuon',    label: '🌿 Sân vườn' },
]

export const TAG_LABEL_MAP: Record<string, string> = {
  'hoai-co':     '🏛️ Hoài cổ',
  'ca-phe-muoi': '☕ Cà phê muối',
  'thu-cung':    '🐾 Thú cưng',
  'check-in':    '📸 Check-in',
  'workspace':   '💻 Workspace',
  'san-vuon':    '🌿 Sân vườn',
}

export const FOOD_GROUP_OPTIONS: ComboboxOption[] = [
  { value: 'all',                 icon: '🍽️', label: 'Chọn món' },
  { value: 'bun',                 icon: '🍜', label: 'Bún' },
  { value: 'cac-loai-banh',      icon: '🥞', label: 'Các loại bánh' },
  { value: 'banh-canh',          icon: '🍲', label: 'Bánh canh' },
  { value: 'com-hen',             icon: '🐚', label: 'Cơm hến' },
  { value: 'che',                 icon: '🍮', label: 'Chè' },
  { value: 'oc',                  icon: '🐌', label: 'Ốc' },
  { value: 'quan-com',           icon: '🍚', label: 'Quán cơm' },
  { value: 'quan-an-dia-phuong', icon: '🏠', label: 'Quán ăn địa phương' },
]

export const FOOD_DISH_MAP: Record<string, { value: string; label: string }[]> = {
  'cac-loai-banh': [
    { value: 'banh-ep',  label: '🥞 Bánh ép' },
    { value: 'banh-beo', label: '🍥 Bánh bèo, nậm lọc' },
  ],
  'bun': [
    { value: 'bun-bo',         label: '🍜 Bún bò' },
    { value: 'bun-mam-nem',    label: '🦐 Bún mắm nêm' },
    { value: 'bun-thit-nuong', label: '🥩 Bún thịt nướng' },
    { value: 'bun-nghe',       label: '🌿 Bún nghệ' },
    { value: 'bun-chay',       label: '🌱 Bún chay' },
  ],
  'banh-canh': [
    { value: 'cha-cua', label: '🦀 Chả cua' },
    { value: 'ca-loc',  label: '🐟 Cá lóc' },
    { value: 'nam-pho', label: '🥣 Nam phổ' },
  ],
}
