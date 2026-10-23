export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-SG', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('en-SG', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatMinutes(ms: number) {
  return Math.floor(ms / 60000)
}
