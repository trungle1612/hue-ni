import { useState, useRef } from 'react'
import { ImageGallery } from '../ImageGallery'
import { ReviewCard, type LightboxState } from '../ReviewCard'
import { TagList } from '../TagList'
import { useMyTripContext } from '../../contexts/MyTripContext'
import type { Place } from '../../types'
import { CATEGORY_LABELS } from '../../data/constants'
import './style.css'

export type SnapState = 'closed' | 'peek' | 'mid' | 'full'

const TAB_ORDER = ['tips', 'menu', 'reviews'] as const
type Tab = typeof TAB_ORDER[number]

const BOOKMARK_PATH =
  'M5 3h14a1 1 0 011 1v17.28a.5.5 0 01-.8.4L12 17.22l-7.2 4.46A.5.5 0 014 21.28V4a1 1 0 011-1z'

interface PlaceDetailSheetProps {
  place: Place | null
  snapState: SnapState
  onSnap: (state: SnapState) => void
  onClose: () => void
  onSave?: () => void
}

export function PlaceDetailSheet({
  place,
  snapState,
  onSnap,
  onClose,
  onSave,
}: PlaceDetailSheetProps) {
  const { isSaved, addPlace, removePlace } = useMyTripContext()
  const [activeTab, setActiveTab] = useState<Tab>('tips')
  const [visibleReviewCount, setVisibleReviewCount] = useState(5)
  const [lightbox, setLightbox] = useState<LightboxState | null>(null)
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)
  const touchStartX = useRef<number | null>(null)
  const swipeJustHappened = useRef(false)
  const dragStartY = useRef<number | null>(null)
  const [stateForPlaceId, setStateForPlaceId] = useState<string | undefined>(undefined)

  if (place?.id !== stateForPlaceId) {
    setStateForPlaceId(place?.id)
    setActiveTab('tips')
    setVisibleReviewCount(5)
    setLightbox(null)
  }

  if (!place) return null

  const saved = isSaved(place.id)

  function handleSave() {
    if (saved) {
      removePlace(place!.id)
    } else {
      addPlace(place!.id)
      onSave?.()
    }
  }

  function handleDirections() {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place!.coordinates.lat},${place!.coordinates.lng}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: place!.name,
          text: place!.vibe,
          url: `${window.location.origin}/details/${place!.id}`,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
    }
  }

  function handleDragStart(e: React.PointerEvent) {
    dragStartY.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handleDragEnd(e: React.PointerEvent) {
    if (dragStartY.current === null) return
    const delta = dragStartY.current - e.clientY
    dragStartY.current = null
    if (delta > 50) {
      if (snapState === 'peek') onSnap('mid')
      else if (snapState === 'mid') onSnap('full')
    } else if (delta < -50) {
      if (snapState === 'full') onSnap('mid')
      else if (snapState === 'mid') onSnap('peek')
      else if (snapState === 'peek') onClose()
    }
  }

  const visibleTabs = place.category === 'cafe' || place.category === 'food'
    ? TAB_ORDER
    : TAB_ORDER.filter(t => t !== 'menu')

  const effectiveTab: Tab = visibleTabs.some(t => t === activeTab) ? activeTab : visibleTabs[0]
  const tabIndex = visibleTabs.findIndex(t => t === effectiveTab)

  function lightboxPrev() {
    setSlideDir('right')
    setLightbox(lb => lb && lb.index > 0 ? { ...lb, index: lb.index - 1 } : lb)
  }

  function lightboxNext() {
    setSlideDir('left')
    setLightbox(lb => lb && lb.index < lb.images.length - 1 ? { ...lb, index: lb.index + 1 } : lb)
  }

  return (
    <div
      className={`place-detail-sheet place-detail-sheet--${snapState}`}
      role="region"
      aria-label={place.name}
    >
      {/* ── Drag handle ── */}
      <div
        className="place-detail-sheet__handle"
        onPointerDown={handleDragStart}
        onPointerUp={handleDragEnd}
        onPointerCancel={() => { dragStartY.current = null }}
      />

      {/* ── Peek state ── */}
      {snapState === 'peek' && (
        <div className="place-detail-sheet__peek">
          <div className="place-detail-sheet__peek-row">
            <div className="place-detail-sheet__thumb-wrap">
              <img
                className="place-detail-sheet__thumb"
                src={place.coverImage}
                alt={place.name}
                loading="lazy"
              />
            </div>
            <div className="place-detail-sheet__peek-info">
              <span className="place-detail-sheet__category">
                {CATEGORY_LABELS[place.category] ?? place.category}
              </span>
              <h2 className="place-detail-sheet__name place-detail-sheet__name--peek">
                {place.name}
              </h2>
              <div className="place-detail-sheet__meta">
                <span className="place-detail-sheet__rating">★ {place.rating}</span>
                <span className="place-detail-sheet__price">{place.priceRange}</span>
              </div>
              <p className="place-detail-sheet__address">📍 {place.address}</p>
            </div>
          </div>
          <div className="place-detail-sheet__peek-actions">
            <button
              className="place-detail-sheet__cta"
              onClick={() => onSnap('full')}
              aria-label={`Xem chi tiết ${place.name}`}
            >
              Xem chi tiết ↑
            </button>
            <button
              className={`place-detail-sheet__icon-btn${saved ? ' place-detail-sheet__icon-btn--saved' : ''}`}
              onClick={handleSave}
              aria-label={saved ? 'Bỏ lưu' : 'Lưu địa điểm'}
            >
              <svg
                viewBox="0 0 24 24"
                fill={saved ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={BOOKMARK_PATH} />
              </svg>
            </button>
            <button
              className="place-detail-sheet__icon-btn"
              onClick={handleShare}
              aria-label="Chia sẻ"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Mid state ── */}
      {snapState === 'mid' && (
        <div className="place-detail-sheet__mid">
          <div className="place-detail-sheet__cover-wrap">
            <img
              src={place.coverImage}
              alt={place.name}
              className="place-detail-sheet__cover"
            />
          </div>
          <div className="place-detail-sheet__mid-body">
            <span className="place-detail-sheet__category">
              {CATEGORY_LABELS[place.category] ?? place.category}
            </span>
            <h2 className="place-detail-sheet__name">{place.name}</h2>
            <p className="place-detail-sheet__vibe">{place.vibe}</p>
            <div className="place-detail-sheet__meta">
              <span className="place-detail-sheet__rating">★ {place.rating}</span>
              <span className="place-detail-sheet__price">{place.priceRange}</span>
              <span className="place-detail-sheet__hours">
                {place.hours.open}–{place.hours.close}
              </span>
            </div>
            <p className="place-detail-sheet__address">📍 {place.address}</p>
            <TagList tags={place.tags} maxVisible={6} />
            <div className="place-detail-sheet__mid-actions">
              <button
                className="place-detail-sheet__action-btn place-detail-sheet__action-btn--primary"
                onClick={handleDirections}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ width: '16px', height: '16px' }}
                >
                  <polygon points="3,11 22,2 13,21 11,13" />
                </svg>
                Chỉ đường
              </button>
              <button
                className={`place-detail-sheet__action-btn${saved ? ' place-detail-sheet__action-btn--saved' : ''}`}
                onClick={handleSave}
                aria-label={saved ? 'Bỏ lưu' : 'Lưu'}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill={saved ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ width: '16px', height: '16px' }}
                >
                  <path d={BOOKMARK_PATH} />
                </svg>
                {saved ? 'Đã lưu' : 'Lưu'}
              </button>
              <button className="place-detail-sheet__action-btn" onClick={handleShare}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ width: '16px', height: '16px' }}
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Chia sẻ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Full state ── */}
      {snapState === 'full' && (
        <div className="place-detail-sheet__full">
          <div className="place-detail-sheet__full-top">
            <button
              className="place-detail-sheet__back"
              onClick={() => onSnap('peek')}
              aria-label="Về bản đồ"
            >
              ← Bản đồ
            </button>
            <div className="place-detail-sheet__top-actions">
              <button
                className="place-detail-sheet__top-cta"
                onClick={handleDirections}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="3,11 22,2 13,21 11,13" />
                </svg>
                Chỉ đường
              </button>
              <button
                className={`place-detail-sheet__top-icon${saved ? ' place-detail-sheet__top-icon--saved' : ''}`}
                onClick={handleSave}
                aria-label={saved ? 'Bỏ lưu' : 'Lưu'}
              >
                <svg viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={BOOKMARK_PATH} />
                </svg>
              </button>
              <button
                className="place-detail-sheet__top-icon"
                onClick={handleShare}
                aria-label="Chia sẻ"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            </div>
          </div>
          <div className="place-detail-sheet__cover-wrap--gallery">
            <ImageGallery
              hero
              images={[place.coverImage, ...place.gallery]}
              placeName={place.name}
              onImageClick={i => {
                setSlideDir(null)
                setLightbox({ images: [place.coverImage, ...place.gallery], index: i })
              }}
            />
          </div>
          <div className="place-detail-sheet__full-body">
            <span className="place-detail-sheet__category">
              {CATEGORY_LABELS[place.category] ?? place.category}
            </span>
            <h2 className="place-detail-sheet__name">{place.name}</h2>
            <p className="place-detail-sheet__vibe">{place.vibe}</p>

            <div className="place-detail-sheet__info-list">
              <div className="place-detail-sheet__info-row place-detail-sheet__info-row--inline">
                <span className="place-detail-sheet__info-chip">★ {place.rating}</span>
                <span className="place-detail-sheet__info-chip">{place.priceRange}</span>
              </div>
              <div className="place-detail-sheet__info-row">
                <span className="place-detail-sheet__info-icon">🕐</span>
                <span className="place-detail-sheet__info-text">{place.hours.open} – {place.hours.close}</span>
              </div>
              <div className="place-detail-sheet__info-row">
                <span className="place-detail-sheet__info-icon">📍</span>
                <span className="place-detail-sheet__info-text">{place.address}</span>
              </div>
              {place.phone && (
                <div className="place-detail-sheet__info-row">
                  <span className="place-detail-sheet__info-icon">📞</span>
                  <a className="place-detail-sheet__info-text place-detail-sheet__info-link" href={`tel:${place.phone}`}>
                    {place.phone}
                  </a>
                </div>
              )}
              {place.website && (
                <div className="place-detail-sheet__info-row">
                  <span className="place-detail-sheet__info-icon">🌐</span>
                  <a
                    className="place-detail-sheet__info-text place-detail-sheet__info-link"
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {place.website.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                </div>
              )}
            </div>

            <p className="place-detail-sheet__description">{place.description}</p>

            <TagList tags={place.tags} maxVisible={6} />

            {/* Tabs */}
            <div className="place-detail-sheet__tabs">
              <div
                className="place-detail-sheet__tab-bar"
                style={{
                  '--tab-index': tabIndex,
                  '--tab-count': visibleTabs.length,
                } as React.CSSProperties}
                role="tablist"
                aria-label="Thông tin địa điểm"
              >
                <div className="place-detail-sheet__tab-indicator" aria-hidden="true" />
                {visibleTabs.map(tab => (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={effectiveTab === tab}
                    aria-controls={`sheet-tabpanel-${tab}`}
                    className={`place-detail-sheet__tab-btn${effectiveTab === tab ? ' place-detail-sheet__tab-btn--active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'tips' ? '💡 Mẹo' : tab === 'reviews' ? '🗣 Đánh giá' : '🍽 Thực đơn'}
                  </button>
                ))}
              </div>

              <div
                id="sheet-tabpanel-tips"
                role="tabpanel"
                hidden={effectiveTab !== 'tips'}
                className={`place-detail-sheet__tab-panel${effectiveTab === 'tips' ? ' place-detail-sheet__tab-panel--active' : ''}`}
              >
                {place.insiderTips.length > 0 ? (
                  place.insiderTips.map((tip, i) => (
                    <div key={i} className="place-detail-sheet__tip">
                      {tip}
                    </div>
                  ))
                ) : (
                  <p className="place-detail-sheet__tab-empty">
                    Chưa có mẹo nào cho địa điểm này.
                  </p>
                )}
              </div>

              <div
                id="sheet-tabpanel-reviews"
                role="tabpanel"
                hidden={effectiveTab !== 'reviews'}
                className={`place-detail-sheet__tab-panel${effectiveTab === 'reviews' ? ' place-detail-sheet__tab-panel--active' : ''}`}
              >
                {(place.reviews?.length ?? 0) > 0 ? (
                  <>
                    {place.reviews!.slice(0, visibleReviewCount).map((review, i) => (
                      <ReviewCard
                        key={i}
                        index={i}
                        review={review}
                        onPhotoClick={state => {
                          setSlideDir(null)
                          setLightbox(state)
                        }}
                      />
                    ))}
                    {visibleReviewCount < place.reviews!.length && (
                      <button
                        className="place-detail-sheet__reviews-more"
                        onClick={() => setVisibleReviewCount(c => c + 5)}
                      >
                        Xem thêm{' '}
                        {Math.min(5, place.reviews!.length - visibleReviewCount)} đánh giá
                      </button>
                    )}
                  </>
                ) : (
                  <p className="place-detail-sheet__tab-empty">Chưa có đánh giá nào.</p>
                )}
              </div>

              <div
                id="sheet-tabpanel-menu"
                role="tabpanel"
                hidden={effectiveTab !== 'menu'}
                className={`place-detail-sheet__tab-panel${effectiveTab === 'menu' ? ' place-detail-sheet__tab-panel--active' : ''}`}
              >
                {(place.menu?.length ?? 0) > 0 ? (
                  <ImageGallery
                    images={place.menu ?? []}
                    placeName={place.name}
                    onImageClick={i => {
                      setSlideDir(null)
                      setLightbox({ images: place.menu!, index: i })
                    }}
                  />
                ) : (
                  <div className="place-detail-sheet__menu-placeholder">
                    <span className="place-detail-sheet__menu-placeholder-icon">🍽</span>
                    <p className="place-detail-sheet__menu-placeholder-title">Thực đơn sắp có</p>
                    <p className="place-detail-sheet__menu-placeholder-sub">
                      Chúng tôi đang cập nhật thực đơn cho địa điểm này.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="place-detail-sheet__lightbox"
          onClick={() => {
            if (swipeJustHappened.current) {
              swipeJustHappened.current = false
              return
            }
            setLightbox(null)
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Ảnh phóng to"
          onPointerDown={e => {
            touchStartX.current = e.clientX
          }}
          onPointerUp={e => {
            if (touchStartX.current === null) return
            const delta = touchStartX.current - e.clientX
            touchStartX.current = null
            if (delta > 50) {
              swipeJustHappened.current = true
              lightboxNext()
            } else if (delta < -50) {
              swipeJustHappened.current = true
              lightboxPrev()
            }
          }}
        >
          <button
            className="place-detail-sheet__lightbox-close"
            onClick={() => setLightbox(null)}
            aria-label="Đóng"
          >
            ×
          </button>
          <img
            key={lightbox.index}
            src={lightbox.images[lightbox.index]}
            alt="Ảnh đánh giá"
            className={`place-detail-sheet__lightbox-img${slideDir ? ` place-detail-sheet__lightbox-img--slide-${slideDir}` : ''}`}
            onClick={e => e.stopPropagation()}
          />
          {lightbox.images.length > 1 && (
            <>
              <button
                className="place-detail-sheet__lightbox-nav place-detail-sheet__lightbox-nav--prev"
                onClick={e => {
                  e.stopPropagation()
                  lightboxPrev()
                }}
                aria-label="Ảnh trước"
                disabled={lightbox.index === 0}
              >
                ‹
              </button>
              <button
                className="place-detail-sheet__lightbox-nav place-detail-sheet__lightbox-nav--next"
                onClick={e => {
                  e.stopPropagation()
                  lightboxNext()
                }}
                aria-label="Ảnh sau"
                disabled={lightbox.index === lightbox.images.length - 1}
              >
                ›
              </button>
              <div className="place-detail-sheet__lightbox-counter">
                {lightbox.index + 1} / {lightbox.images.length}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
