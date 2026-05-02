import { useState, useEffect, useRef } from 'react'
import type { FestivalEvent, StoryAndGuide } from '../../types'
import { sortEventsByDate } from '../../utils/festivalUtils'
import { TimelineTab } from './TimelineTab'
import { CalendarTab } from './CalendarTab'
import { CultureTab } from './CultureTab'
import { FestivalEventSheet } from './FestivalEventSheet'
import './style.css'

type Tab = 'timeline' | 'calendar' | 'culture'

const TABS: { id: Tab; label: string }[] = [
  { id: 'timeline', label: 'Sự kiện' },
  { id: 'calendar', label: 'Lịch' },
  { id: 'culture', label: 'Văn hóa' },
]

export function FestivalPage() {
  const [activeTab, setActiveTab] = useState<Tab>('timeline')
  const [events, setEvents] = useState<FestivalEvent[]>([])
  const [stories, setStories] = useState<StoryAndGuide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<FestivalEvent | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const clearEventTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    import('../../data/festivals.json').then(mod => {
      setEvents(sortEventsByDate(mod.default.events as FestivalEvent[]))
      setStories(mod.default.stories as StoryAndGuide[])
      setIsLoading(false)
    })
  }, [])

  useEffect(() => () => {
    if (clearEventTimer.current) clearTimeout(clearEventTimer.current)
  }, [])

  function handleSelect(event: FestivalEvent) {
    setSelectedEvent(event)
    setSheetOpen(true)
  }

  function handleClose() {
    setSheetOpen(false)
    if (clearEventTimer.current) clearTimeout(clearEventTimer.current)
    clearEventTimer.current = setTimeout(() => setSelectedEvent(null), 300)
  }

  const tabIndex = TABS.findIndex(t => t.id === activeTab)

  return (
    <div className="festival-page">
      <header className="festival-page__header">
        <p className="festival-page__overline">Lễ hội Huế</p>
        <h1 className="festival-page__title">Nhịp đập ngàn năm</h1>
      </header>

      <div className="festival-page__tabs" role="tablist" aria-label="Danh mục lễ hội">
        {TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`festival-page__tab${activeTab === tab.id ? ' festival-page__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        <span
          className="festival-page__tab-indicator"
          style={{ '--tab-index': tabIndex, '--tab-count': TABS.length } as React.CSSProperties}
        />
      </div>

      <div className="festival-page__content">
        {isLoading ? (
          <div className="festival-page__loading" aria-label="Đang tải..." />
        ) : (
          <>
            {activeTab === 'timeline' && <TimelineTab events={events} onSelect={handleSelect} />}
            {activeTab === 'calendar' && <CalendarTab events={events} onSelect={handleSelect} />}
            {activeTab === 'culture' && <CultureTab stories={stories} />}
          </>
        )}
      </div>

      <FestivalEventSheet
        event={selectedEvent}
        isOpen={sheetOpen}
        onClose={handleClose}
      />
    </div>
  )
}
