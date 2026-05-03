import './StickyFooter.css'

interface StickyFooterProps {
  zaloUrl?: string
  phone?: string
}

export function StickyFooter({ zaloUrl, phone }: StickyFooterProps) {
  return (
    <div className="sticky-footer">
      {zaloUrl && (
        <a
          className="sticky-footer__btn sticky-footer__btn--primary"
          href={zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Chat Zalo
        </a>
      )}
      {phone && (
        <a
          className="sticky-footer__btn sticky-footer__btn--secondary"
          href={`tel:${phone.replace(/\D/g, '')}`}
        >
          Gọi Chủ Nhà
        </a>
      )}
    </div>
  )
}
