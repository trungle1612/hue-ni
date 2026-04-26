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
  { value: 'all', label: 'Tất cả' },
  { value: 'tomb', label: 'Lăng tẩm' },
  { value: 'landmark', label: 'Di tích' },
  { value: 'cafe', label: 'Cà phê' },
  { value: 'food', label: 'Ẩm thực' },
  { value: 'homestay', label: 'Homestay' },
  { value: 'service', label: 'Dịch vụ' },
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
