import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { FestivalEventSheet } from './FestivalEventSheet'
import type { FestivalEvent } from '../../types'

const mockEvent: FestivalEvent = {
  id: 'hue-festival-2025',
  title: 'Festival Huế 2025',
  category: 'royal',
  isAnnual: true,
  summary: 'Tóm tắt sự kiện.',
  highlights: ['Nhã nhạc cung đình', 'Triển lãm ảnh'],
  timeString: '28/04 – 04/05/2025',
  location: 'Đại Nội Huế',
  organizer: 'Trung tâm Bảo tồn Di tích',
  date: { start: '2099-04-28', end: '2099-05-04' },
}

function renderSheet(props: {
  event: FestivalEvent | null
  isOpen?: boolean
  onClose?: () => void
}) {
  return render(
    <MemoryRouter>
      <FestivalEventSheet
        event={props.event}
        isOpen={props.isOpen ?? true}
        onClose={props.onClose ?? vi.fn()}
      />
    </MemoryRouter>
  )
}

describe('FestivalEventSheet', () => {
  it('renders nothing when event is null', () => {
    const { container } = renderSheet({ event: null })
    expect(container.firstChild).toBeNull()
  })

  it('renders event title when event is provided', () => {
    renderSheet({ event: mockEvent })
    screen.getByText('Festival Huế 2025')
  })

  it('renders event meta: location and timeString', () => {
    renderSheet({ event: mockEvent })
    screen.getByText('Đại Nội Huế')
    screen.getByText('28/04 – 04/05/2025')
  })

  it('renders highlights', () => {
    renderSheet({ event: mockEvent })
    screen.getByText('Nhã nhạc cung đình')
    screen.getByText('Triển lãm ảnh')
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    const { container } = renderSheet({ event: mockEvent, onClose })
    fireEvent.click(container.querySelector('.festival-event-sheet__backdrop')!)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('renders deep-link button', () => {
    renderSheet({ event: mockEvent })
    screen.getByText('Xem trang đầy đủ →')
  })
})
