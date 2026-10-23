import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('web-push', () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn().mockResolvedValue({ statusCode: 201 }),
  },
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        in: vi.fn().mockResolvedValue({
          data: [
            { endpoint: 'https://push.example.com/sub1', p256dh: 'key1', auth_key: 'auth1' },
          ],
        }),
      })),
    })),
  })),
}))

describe('sendPushToPlayers', () => {
  beforeEach(() => {
    process.env.VAPID_PUBLIC_KEY = 'fake-public-key'
    process.env.VAPID_PRIVATE_KEY = 'fake-private-key'
    vi.resetModules()
  })

  it('skips sending when playerIds is empty', async () => {
    const webpush = await import('web-push')
    const { sendPushToPlayers } = await import('@/lib/push')

    await sendPushToPlayers([], { title: 'Test', body: 'Test body' })

    expect((webpush.default.sendNotification as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled()
  })

  it('sends notifications for valid player IDs', async () => {
    const webpush = await import('web-push')
    const { sendPushToPlayers } = await import('@/lib/push')

    await sendPushToPlayers(['player-1'], { title: "You're up!", body: 'Head to your court', url: '/queue' })

    expect((webpush.default.sendNotification as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: 'https://push.example.com/sub1' }),
      JSON.stringify({ title: "You're up!", body: 'Head to your court', url: '/queue' })
    )
  })
})
