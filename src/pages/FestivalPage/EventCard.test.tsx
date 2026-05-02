import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { EventCard } from './EventCard'
import type { FestivalEvent } from '../../types'

const mockEvent: FestivalEvent = {
  id: 'test-event',
  title: 'Lễ hội thử nghiệm',
  category: 'royal',
  isAnnual: true,
  summary: 'Tóm tắt sự kiện',
  highlights: ['Điểm nổi bật 1'],
  timeString: '01/05/2025',
  location: 'Đại Nội Huế',
  organizer: 'Ban tổ chức',
  date: { start: '2099-05-01' },
}

describe('EventCard', () => {
  it('calls onSelect with the event when clicked', () => {
    const onSelect = vi.fn()
    render(<EventCard event={mockEvent} badge="past" onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledWith(mockEvent)
  })

  it('calls onSelect when Enter is pressed', () => {
    const onSelect = vi.fn()
    render(<EventCard event={mockEvent} badge="past" onSelect={onSelect} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith(mockEvent)
  })

  it('displays the event title', () => {
    render(<EventCard event={mockEvent} badge="past" onSelect={vi.fn()} />)
    screen.getByText('Lễ hội thử nghiệm')
  })
})
