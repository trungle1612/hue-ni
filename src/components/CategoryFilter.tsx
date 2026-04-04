import './CategoryFilter.css'

export interface FilterOption {
  value: string
  label: string
}

interface CategoryFilterProps {
  options: FilterOption[]
  selected: string
  onChange: (value: string) => void
}

export function CategoryFilter({ options, selected, onChange }: CategoryFilterProps) {
  return (
    <div className="category-filter" role="group" aria-label="Lọc theo danh mục">
      {options.map(opt => (
        <button
          key={opt.value}
          className={`category-filter__chip${selected === opt.value ? ' category-filter__chip--active' : ''}`}
          onClick={() => onChange(opt.value)}
          aria-pressed={selected === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
