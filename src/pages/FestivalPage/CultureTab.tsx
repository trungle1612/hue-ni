import type { StoryAndGuide } from '../../types'
import './CultureTab.css'

const SECTION_CONFIG = {
  royal_anecdote: { icon: '📖', label: 'Giai thoại Hoàng triều' },
  survival_guide: { icon: '🎒', label: 'Cẩm nang du lịch' },
}

function StoryCard({ story }: { story: StoryAndGuide }) {
  const config = SECTION_CONFIG[story.type]
  return (
    <article className="story-card">
      <div className="story-card__header">
        <span className="story-card__icon">{config.icon}</span>
        <span className="story-card__type-label">{config.label}</span>
      </div>
      <h3 className="story-card__title">{story.title}</h3>
      <p className="story-card__excerpt">{story.excerpt}</p>
      <details className="story-card__details">
        <summary className="story-card__read-more">Đọc tiếp →</summary>
        <div
          className="story-card__content"
          dangerouslySetInnerHTML={{ __html: story.content.replace(/\n/g, '<br/>') }}
        />
      </details>
    </article>
  )
}

export function CultureTab({ stories }: { stories: StoryAndGuide[] }) {
  const royalStories = stories.filter(s => s.type === 'royal_anecdote')
  const guides = stories.filter(s => s.type === 'survival_guide')

  return (
    <div className="culture-tab">
      {royalStories.length > 0 && (
        <section className="culture-tab__section">
          <h2 className="culture-tab__section-title">📖 Giai thoại Hoàng triều</h2>
          {royalStories.map(story => <StoryCard key={story.id} story={story} />)}
        </section>
      )}
      {guides.length > 0 && (
        <section className="culture-tab__section">
          <h2 className="culture-tab__section-title">🎒 Cẩm nang du lịch</h2>
          {guides.map(story => <StoryCard key={story.id} story={story} />)}
        </section>
      )}
      {stories.length === 0 && (
        <p className="culture-tab__empty">Nội dung đang được biên soạn.</p>
      )}
    </div>
  )
}
