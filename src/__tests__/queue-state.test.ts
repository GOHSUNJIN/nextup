import { describe, it, expect } from 'vitest'
import type { QueueStateType } from '@/types/queue'

const QUEUE_STATUS_MAP: Record<string, QueueStateType> = {
  waiting: 'waiting',
  standby: 'standby',
  waitlist: 'waitlist',
  assigned: 'assigned',
  playing: 'playing',
  finished: 'finished',
  on_break: 'on_break',
  away: 'away',
}

function resolveQueueState(dbStatus: string): QueueStateType {
  return QUEUE_STATUS_MAP[dbStatus] ?? 'join'
}

describe('Queue state resolution', () => {
  it('maps each known DB status to its queue state', () => {
    expect(resolveQueueState('waiting')).toBe('waiting')
    expect(resolveQueueState('standby')).toBe('standby')
    expect(resolveQueueState('waitlist')).toBe('waitlist')
    expect(resolveQueueState('assigned')).toBe('assigned')
    expect(resolveQueueState('playing')).toBe('playing')
    expect(resolveQueueState('finished')).toBe('finished')
    expect(resolveQueueState('on_break')).toBe('on_break')
    expect(resolveQueueState('away')).toBe('away')
  })

  it('falls back to join for unknown or left status', () => {
    expect(resolveQueueState('left')).toBe('join')
    expect(resolveQueueState('unknown')).toBe('join')
    expect(resolveQueueState('')).toBe('join')
  })
})

describe('Wait time estimate', () => {
  function estimateWaitMinutes(position: number): number {
    return Math.max(1, Math.round(((position - 1) / 4) * 20))
  }

  it('returns at least 1 minute for first position', () => {
    expect(estimateWaitMinutes(1)).toBe(1)
  })

  it('estimates ~5 min for position 2 (1 full rotation ahead)', () => {
    expect(estimateWaitMinutes(2)).toBe(5)
  })

  it('scales linearly with queue depth', () => {
    expect(estimateWaitMinutes(5)).toBe(20)
    expect(estimateWaitMinutes(9)).toBe(40)
  })
})

describe('Queue position helper', () => {
  function getNextPosition(lastPosition: number | null | undefined): number {
    return (lastPosition ?? 0) + 1
  }

  it('starts at 1 when queue is empty', () => {
    expect(getNextPosition(null)).toBe(1)
    expect(getNextPosition(undefined)).toBe(1)
  })

  it('increments from last position', () => {
    expect(getNextPosition(5)).toBe(6)
    expect(getNextPosition(0)).toBe(1)
  })
})
