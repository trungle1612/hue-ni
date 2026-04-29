import { useState } from 'react'
import './TagList.css'
import { TAG_LABEL_MAP } from '../data/constants'

interface TagListProps {
  tags: string[]
  maxVisible?: number
}

export function TagList({ tags, maxVisible }: TagListProps) {
  const [expanded, setExpanded] = useState(false)

  if (tags.length === 0) return null

  const sorted = [
    ...tags.filter(t => TAG_LABEL_MAP[t]),
    ...tags.filter(t => !TAG_LABEL_MAP[t]),
  ]

  const collapsed = maxVisible !== undefined && !expanded && sorted.length > maxVisible
  const visible = collapsed ? sorted.slice(0, maxVisible) : sorted
  const hiddenCount = sorted.length - (maxVisible ?? sorted.length)

  return (
    <div className="tag-list">
      <span className="tag-list__label">✦ Đặc điểm</span>
      <div className="tag-list__row">
        {visible.map((tag, i) => {
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
        {collapsed && (
          <button className="tag-list__more" onClick={() => setExpanded(true)}>
            +{hiddenCount}
          </button>
        )}
        {expanded && maxVisible !== undefined && (
          <button className="tag-list__more tag-list__more--collapse" onClick={() => setExpanded(false)}>
            Thu gọn
          </button>
        )}
      </div>
    </div>
  )
}
