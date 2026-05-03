import './ExperienceCard.css'
import type { Experience } from '../types'
import { EXPERIENCE_CATEGORY_LABELS } from '../data/constants'

interface ExperienceCardProps {
  experience: Experience
  onClick: (experience: Experience) => void
}

export function ExperienceCard({ experience, onClick }: ExperienceCardProps) {
  return (
    <button
      className="exp-card"
      onClick={() => onClick(experience)}
      aria-label={experience.title}
    >
      <div className="exp-card__image-wrap">
        {experience.coverImage ? (
          <img
            className="exp-card__image"
            src={experience.coverImage}
            alt={experience.title}
            loading="lazy"
          />
        ) : (
          <div className="exp-card__placeholder" data-category={experience.category} />
        )}
        <span className="exp-card__category-tag">
          {EXPERIENCE_CATEGORY_LABELS[experience.category]}
        </span>
      </div>
      <div className="exp-card__body">
        <h3 className="exp-card__title">{experience.title}</h3>
        <div className="exp-card__meta">
          <span className="exp-card__price">{experience.priceEstimate}</span>
          <span className="exp-card__duration">⏱ {experience.duration}</span>
        </div>
      </div>
    </button>
  )
}
