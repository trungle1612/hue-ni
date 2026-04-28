import './ImageGallery.css'

interface ImageGalleryProps {
  images: string[]
  placeName: string
  onImageClick?: (index: number) => void
}

export function ImageGallery({ images, placeName, onImageClick }: ImageGalleryProps) {
  // Guard allows callers to conditionally show accompanying section headings.
  // The component also returns null for empty arrays as a safety net.
  if (images.length === 0) return null

  return (
    <div className="image-gallery" aria-label={`Ảnh của ${placeName}`}>
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
  )
}
