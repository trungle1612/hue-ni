import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './style.css'
import type { Experience } from '../../types'
import { EXPERIENCE_CATEGORY_LABELS } from '../../data/constants'

function loadSaved(): string[] {
  try { return JSON.parse(localStorage.getItem('hue-ni-exp-saved') ?? '[]') } catch { return [] }
}

export function ExperienceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [experience, setExperience] = useState<Experience | null | undefined>(undefined)
  const [saved, setSaved] = useState(() => loadSaved().includes(id ?? ''))

  useEffect(() => {
    import('../../data/experiences.json').then((mod) => {
      const all: Experience[] = ((mod.default ?? mod) as { experiences: Experience[] }).experiences
      setExperience(all.find((e) => e.id === id) ?? null)
    })
  }, [id])

  if (experience === undefined) {
    return (
      <div className="exp-detail exp-detail--loading">
        <button className="exp-detail__back" onClick={() => navigate(-1)}>←</button>
        <p>Đang tải...</p>
      </div>
    )
  }
  if (experience === null) {
    return (
      <div className="exp-detail exp-detail--not-found">
        <button className="exp-detail__back" onClick={() => navigate(-1)}>←</button>
        <p>Không tìm thấy trải nghiệm này.</p>
      </div>
    )
  }

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(experience.address)}`

  function handleSave() {
    setSaved(prev => {
      const next = !prev
      const ids = loadSaved()
      const updated = next ? [...ids, experience!.id] : ids.filter(i => i !== experience!.id)
      localStorage.setItem('hue-ni-exp-saved', JSON.stringify(updated))
      return next
    })
  }

  function handleDirections() {
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer')
  }

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title: experience!.title, text: experience!.shortDesc, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(window.location.href)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
    }
  }

  return (
    <div className="exp-detail">
      <div className="exp-detail__cover-wrap">
        {experience.coverImage ? (
          <img
            className="exp-detail__cover-img"
            src={experience.coverImage}
            alt={experience.title}
          />
        ) : (
          <div className="exp-detail__cover-placeholder" data-category={experience.category} />
        )}
        <div className="exp-detail__cover-overlay" />
        <button className="exp-detail__back" onClick={() => navigate(-1)} aria-label="Quay lại">
          ←
        </button>
        <div className="exp-detail__cover-meta">
          <span className="exp-detail__category-badge">
            {EXPERIENCE_CATEGORY_LABELS[experience.category]}
          </span>
        </div>
      </div>

      <div className="exp-detail__body">
        <p className="exp-detail__host">Chủ nhà: {experience.hostName}</p>
        <h1 className="exp-detail__title">{experience.title}</h1>

        <div className="exp-detail__meta-row">
          <div className="exp-detail__meta-item">
            <span className="exp-detail__meta-icon">💰</span>
            <span>{experience.priceEstimate}</span>
          </div>
          <div className="exp-detail__meta-item">
            <span className="exp-detail__meta-icon">⏱</span>
            <span>{experience.duration}</span>
          </div>
        </div>

        <p className="exp-detail__desc">{experience.shortDesc}</p>

        <h2 className="exp-detail__section-title">Điểm nổi bật</h2>
        <ul className="exp-detail__highlights">
          {experience.highlights.map((h, i) => (
            <li key={i} className="exp-detail__highlight">{h}</li>
          ))}
        </ul>

        <h2 className="exp-detail__section-title">Địa điểm</h2>
        <a
          className="exp-detail__address"
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="exp-detail__meta-icon">📍</span>
          <span>{experience.address}</span>
          <span className="exp-detail__map-link">Xem bản đồ →</span>
        </a>

        <div className="exp-detail__footer-spacer" />
      </div>

      <div className="exp-detail__actions">
        <button
          className={`exp-detail__icon-btn${saved ? ' exp-detail__icon-btn--saved' : ''}`}
          onClick={handleSave}
          aria-label={saved ? 'Bỏ lưu' : 'Lưu trải nghiệm'}
        >
          {saved ? (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M5 3h14a1 1 0 011 1v17.28a.5.5 0 01-.8.4L12 17.22l-7.2 4.46A.5.5 0 014 21.28V4a1 1 0 011-1z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 3h14a1 1 0 011 1v17.28a.5.5 0 01-.8.4L12 17.22l-7.2 4.46A.5.5 0 014 21.28V4a1 1 0 011-1z"/>
            </svg>
          )}
        </button>

        <button className="exp-detail__cta-btn" onClick={handleDirections} aria-label="Chỉ đường">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="3,11 22,2 13,21 11,13"/>
          </svg>
          Chỉ đường
        </button>

        <button className="exp-detail__icon-btn" onClick={handleShare} aria-label="Chia sẻ">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
