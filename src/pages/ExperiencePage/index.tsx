import { useState, useEffect, useRef } from 'react'
import './style.css'
import type { Experience, ExperienceCategory } from '../../types'
import { EXPERIENCE_FILTER_OPTIONS } from '../../data/constants'
import { ExperienceCard } from '../../components/ExperienceCard'
import { ExperienceBottomSheet } from '../../components/ExperienceBottomSheet'
import { filterExperiences } from '../../utils/experienceUtils'

export function ExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [selectedCategory, setSelectedCategory] = useState<ExperienceCategory | 'all'>('all')
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    import('../../data/experiences.json').then((mod) => {
      setExperiences(((mod.default ?? mod) as { experiences: Experience[] }).experiences)
    })
    return () => {
      if (clearTimer.current) clearTimeout(clearTimer.current)
    }
  }, [])

  function handleSelectExp(exp: Experience) {
    if (clearTimer.current) clearTimeout(clearTimer.current)
    setSelectedExp(exp)
    setSheetOpen(true)
  }

  function handleClose() {
    setSheetOpen(false)
    if (clearTimer.current) clearTimeout(clearTimer.current)
    clearTimer.current = setTimeout(() => setSelectedExp(null), 300)
  }

  const filtered = filterExperiences(experiences, selectedCategory)

  return (
    <div className="exp-page">
      <header className="exp-page__header">
        <p className="exp-page__overline">Huế</p>
        <h1 className="exp-page__title">Trải nghiệm</h1>
        <p className="exp-page__subtitle">Khám phá văn hóa sống</p>
      </header>

      <div className="exp-page__filters">
        {EXPERIENCE_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`exp-page__chip${selectedCategory === opt.value ? ' exp-page__chip--active' : ''}`}
            onClick={() => setSelectedCategory(opt.value)}
            aria-pressed={selectedCategory === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="exp-page__list">
        {filtered.map((exp) => (
          <ExperienceCard key={exp.id} experience={exp} onClick={handleSelectExp} />
        ))}
        {filtered.length === 0 && (
          <p className="exp-page__empty">Không có trải nghiệm nào trong danh mục này.</p>
        )}
      </div>

      <ExperienceBottomSheet experience={selectedExp} isOpen={sheetOpen} onClose={handleClose} />
    </div>
  )
}
