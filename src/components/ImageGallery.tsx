import './ImageGallery.css'

interface ImageGalleryProps {
  images: string[]
  placeName: string
}

export function ImageGallery({ images, placeName }: ImageGalleryProps) {
  if (images.length === 0) return null

  return (
    <div className="image-gallery" aria-label={`Ảnh của ${placeName}`}>
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`${placeName} — ảnh ${i + 1}`}
          className="image-gallery__item"
          loading="lazy"
        />
      ))}
    </div>
  )
}
