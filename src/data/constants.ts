import type { Category } from '../types'
import type { FilterOption } from '../components/CategoryFilter'

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
