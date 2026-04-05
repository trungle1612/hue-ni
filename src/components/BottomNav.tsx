import { NavLink } from 'react-router-dom'
import { useMyTripContext } from '../contexts/MyTripContext'
import './BottomNav.css'

function IconHome({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke="currentColor" strokeWidth={active ? 2 : 1.6}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-9.5z" />
      <path d="M9 21v-8h6v8" />
    </svg>
  )
}

function IconHeritage({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke="currentColor" strokeWidth={active ? 2 : 1.6}
      strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="20" x2="22" y2="20" />
      <line x1="6" y1="20" x2="6" y2="11" />
      <line x1="12" y1="20" x2="12" y2="11" />
      <line x1="18" y1="20" x2="18" y2="11" />
      <polyline points="2,11 12,4 22,11" />
      <line x1="4" y1="20" x2="4" y2="14" />
      <line x1="20" y1="20" x2="20" y2="14" />
    </svg>
  )
}

function IconTrip({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke="currentColor" strokeWidth={active ? 2 : 1.6}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6a1 1 0 011 1v2H8V4a1 1 0 011-1z" />
      <path d="M6 6h12a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <line x1="9.5" y1="13.5" x2="14.5" y2="13.5" />
    </svg>
  )
}

const TABS = [
  { to: '/', label: 'Trang chủ', Icon: IconHome },
  { to: '/heritage', label: 'Di sản', Icon: IconHeritage },
  { to: '/my-trip', label: 'Hành trình', Icon: IconTrip },
] as const

export function BottomNav() {
  const { savedIds } = useMyTripContext()
  const tripCount = savedIds.length

  return (
    <nav className="bottom-nav" aria-label="Điều hướng chính">
      {TABS.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `bottom-nav__tab${isActive ? ' bottom-nav__tab--active' : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <span className="bottom-nav__icon-wrap">
                <tab.Icon active={isActive} />
                {tab.to === '/my-trip' && tripCount > 0 && (
                  <span className="bottom-nav__badge">{tripCount}</span>
                )}
              </span>
              <span className="bottom-nav__label">{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
