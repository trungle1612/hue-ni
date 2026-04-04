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
