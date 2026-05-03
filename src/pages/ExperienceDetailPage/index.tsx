import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './style.css'
import type { Experience } from '../../types'
import { EXPERIENCE_CATEGORY_LABELS } from '../../data/constants'
import { StickyFooter } from '../../components/StickyFooter'

export function ExperienceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [experience, setExperience] = useState<Experience | null | undefined>(undefined)

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

  const googleMapsUrl = `https://maps.google.com/?q=${encodeURIComponent(experience.address)}`

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

      <StickyFooter
        zaloUrl={experience.contactInfo.zalo}
        phone={experience.contactInfo.phone}
      />
    </div>
  )
}
