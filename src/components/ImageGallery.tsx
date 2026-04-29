import { useState, useRef } from 'react'
import './ImageGallery.css'

interface ImageGalleryProps {
  images: string[]
  placeName: string
  onImageClick?: (index: number) => void
  hero?: boolean
}

export function ImageGallery({ images, placeName, onImageClick, hero = false }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  if (images.length === 0) return null

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const itemWidth = el.scrollWidth / images.length
    setActiveIndex(Math.round(el.scrollLeft / itemWidth))
  }

  return (
    <div className={`image-gallery${hero ? ' image-gallery--hero' : ''}`}>
      <div
        ref={scrollRef}
        className="image-gallery__track"
        aria-label={`Ảnh của ${placeName}`}
        onScroll={handleScroll}
      >
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`${placeName} — ảnh ${i + 1}`}
            className={`image-gallery__item${onImageClick ? ' image-gallery__item--clickable' : ''}`}
            loading="lazy"
            onClick={onImageClick ? () => onImageClick(i) : undefined}
          />
        ))}
      </div>
      {images.length > 1 && (
        <div className="image-gallery__counter" aria-live="polite">
          {activeIndex + 1} / {images.length}
        </div>
      )}
    </div>
  )
}
