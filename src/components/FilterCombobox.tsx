import { useState, useRef, useEffect } from 'react'
import './FilterCombobox.css'

export interface ComboboxOption {
  value: string
  icon: string
  label: string
}

interface FilterComboboxProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
}

export function FilterCombobox({ options, value, onChange }: FilterComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<(HTMLLIElement | null)[]>([])

  const currentOption = options.find(o => o.value === value) ?? options[0]
  const isActive = value !== options[0]?.value

  // Close on outside pointerdown
  useEffect(() => {
    if (!isOpen) return
    function handlePointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  function selectOption(optValue: string) {
    onChange(optValue)
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIsOpen(true)
      const selectedIdx = options.findIndex(o => o.value === value)
      const focusIdx = selectedIdx >= 0 ? selectedIdx : 0
      requestAnimationFrame(() => optionRefs.current[focusIdx]?.focus())
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  function handleOptionKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      optionRefs.current[Math.min(idx + 1, options.length - 1)]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (idx === 0) {
        triggerRef.current?.focus()
      } else {
        optionRefs.current[idx - 1]?.focus()
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      selectOption(options[idx].value)
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setIsOpen(false)
      triggerRef.current?.focus()
    }
  }

  return (
    <div
      ref={rootRef}
      className={[
        'fcb',
        isOpen ? 'fcb--open' : '',
        isActive ? 'fcb--active' : '',
      ].filter(Boolean).join(' ')}
    >
      <button
        ref={triggerRef}
        className="fcb__trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="fcb-listbox"
        onClick={() => setIsOpen(o => !o)}
        onKeyDown={handleTriggerKeyDown}
        type="button"
      >
        <span className="fcb__trigger-icon" aria-hidden="true">
          {currentOption.icon}
        </span>
        <span className="fcb__trigger-label">{currentOption.label}</span>
        <svg
          className="fcb__chevron"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 4L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <ul
        id="fcb-listbox"
        role="listbox"
        aria-label="Chọn danh mục"
        className={`fcb__panel${isOpen ? ' fcb__panel--open' : ''}`}
      >
        {options.map((opt, i) => {
          const isSelected = opt.value === value
          return (
            <li
              key={opt.value}
              role="option"
              aria-selected={isSelected}
              tabIndex={-1}
              ref={el => { optionRefs.current[i] = el }}
              className={`fcb__option${isSelected ? ' fcb__option--selected' : ''}`}
              onClick={() => selectOption(opt.value)}
              onKeyDown={e => handleOptionKeyDown(e, i)}
            >
              <span className="fcb__option-icon" aria-hidden="true">{opt.icon}</span>
              <span className="fcb__option-label">{opt.label}</span>
              {isSelected && <span className="fcb__option-check" aria-hidden="true">✓</span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
