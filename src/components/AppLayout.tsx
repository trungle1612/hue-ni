import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function AppLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <main style={{ flex: 1, paddingBottom: 'var(--bottom-nav-height)' }}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
