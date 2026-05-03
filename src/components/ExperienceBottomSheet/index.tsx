import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './index.css'
import type { Experience } from '../../types'
import { EXPERIENCE_CATEGORY_LABELS } from '../../data/constants'
import { ImageGallery } from '../ImageGallery'

interface ExperienceBottomSheetProps {
  experience: Experience | null
  isOpen: boolean
  onClose: () => void
}

function loadSavedIds(): string[] {
  try { return JSON.parse(localStorage.getItem('hue-ni-exp-saved') ?? '[]') } catch { return [] }
}

export function ExperienceBottomSheet({ experience, isOpen, onClose }: ExperienceBottomSheetProps) {
  const navigate = useNavigate()
  const dragStartY = useRef<number | null>(null)
  const [savedIds, setSavedIds] = useState<string[]>(loadSavedIds)

  if (!experience) return null

  const saved = savedIds.includes(experience.id)

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

  function handleSave() {
    setSavedIds(prev => {
      const next = prev.includes(experience!.id)
        ? prev.filter(i => i !== experience!.id)
        : [...prev, experience!.id]
      localStorage.setItem('hue-ni-exp-saved', JSON.stringify(next))
      return next
    })
  }

  function handleDirections() {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(experience!.address)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: experience!.title,
          text: experience!.shortDesc,
          url: `${window.location.origin}/trai-nghiem/${experience!.id}`,
        })
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/trai-nghiem/${experience!.id}`)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
    }
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

        <div className="exp-sheet__top-actions">
          <button
            className={`exp-sheet__icon-btn${saved ? ' exp-sheet__icon-btn--saved' : ''}`}
            onClick={handleSave}
            aria-label={saved ? 'Bỏ lưu' : 'Lưu trải nghiệm'}
          >
            <svg viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 3h14a1 1 0 011 1v17.28a.5.5 0 01-.8.4L12 17.22l-7.2 4.46A.5.5 0 014 21.28V4a1 1 0 011-1z" />
            </svg>
          </button>
          <button className="exp-sheet__icon-btn" onClick={handleDirections} aria-label="Chỉ đường">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="3,11 22,2 13,21 11,13" />
            </svg>
          </button>
          <button className="exp-sheet__icon-btn" onClick={handleShare} aria-label="Chia sẻ">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
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

          {(experience.gallery?.length ?? 0) > 0 && (
            <div className="exp-sheet__gallery">
              <ImageGallery images={experience.gallery!} placeName={experience.title} />
            </div>
          )}

          <button className="exp-sheet__cta" onClick={handleViewDetail}>
            Xem câu chuyện đầy đủ →
          </button>
        </div>
      </div>
    </>
  )
}
