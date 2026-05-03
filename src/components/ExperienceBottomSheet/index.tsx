import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './index.css'
import type { Experience } from '../../types'
import { EXPERIENCE_CATEGORY_LABELS } from '../../data/constants'

interface ExperienceBottomSheetProps {
  experience: Experience | null
  isOpen: boolean
  onClose: () => void
}

export function ExperienceBottomSheet({ experience, isOpen, onClose }: ExperienceBottomSheetProps) {
  const navigate = useNavigate()
  const dragStartY = useRef<number | null>(null)

  if (!experience) return null

  function handlePointerDown(e: React.PointerEvent) {
    dragStartY.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (dragStartY.current === null) return
    const delta = e.clientY - dragStartY.current
    dragStartY.current = null
    if (delta >= 50) onClose()
  }

  function handleViewDetail() {
    onClose()
    navigate(`/trai-nghiem/${experience!.id}`)
  }

  return (
    <>
      <div
        className={`exp-sheet__backdrop${isOpen ? ' exp-sheet__backdrop--open' : ''}`}
        onClick={onClose}
      />
      <div
        className={`exp-sheet${isOpen ? ' exp-sheet--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={experience.title}
      >
        <div
          className="exp-sheet__handle"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => { dragStartY.current = null }}
        >
          <div className="exp-sheet__handle-bar" />
        </div>

        <div className="exp-sheet__body">
          <p className="exp-sheet__category">
            {EXPERIENCE_CATEGORY_LABELS[experience.category]}
          </p>
          <h2 className="exp-sheet__title">{experience.title}</h2>
          <p className="exp-sheet__host">Chủ nhà: {experience.hostName}</p>

          <div className="exp-sheet__meta-row">
            <span className="exp-sheet__price">{experience.priceEstimate}</span>
            <span className="exp-sheet__duration">⏱ {experience.duration}</span>
          </div>

          <h3 className="exp-sheet__section-title">Điểm nổi bật</h3>
          <ul className="exp-sheet__highlights">
            {experience.highlights.map((h, i) => (
              <li key={i} className="exp-sheet__highlight">{h}</li>
            ))}
          </ul>

          <button className="exp-sheet__cta" onClick={handleViewDetail}>
            Xem câu chuyện đầy đủ →
          </button>
        </div>
      </div>
    </>
  )
}
