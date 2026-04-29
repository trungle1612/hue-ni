import './TagList.css'
import { TAG_LABEL_MAP } from '../data/constants'

export function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null
  return (
    <div className="tag-list">
      <span className="tag-list__label">✦ Đặc điểm</span>
      <div className="tag-list__row">
        {tags.map((tag, i) => {
          const label = TAG_LABEL_MAP[tag]
          return (
            <span
              key={tag}
              className={`tag-list__tag${label ? ' tag-list__tag--featured' : ''}`}
              style={{ '--tag-i': i } as React.CSSProperties}
            >
              {label ?? tag}
            </span>
          )
        })}
      </div>
    </div>
  )
}
