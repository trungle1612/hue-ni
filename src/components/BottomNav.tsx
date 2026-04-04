import { NavLink } from 'react-router-dom'
import './BottomNav.css'

const TABS = [
  { to: '/', label: 'Trang chủ', icon: '🏠' },
  { to: '/heritage', label: 'Di sản', icon: '🏛' },
  { to: '/my-trip', label: 'Hành trình', icon: '🎒' },
] as const

export function BottomNav() {
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
          <span className="bottom-nav__icon" aria-hidden="true">{tab.icon}</span>
          <span className="bottom-nav__label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
