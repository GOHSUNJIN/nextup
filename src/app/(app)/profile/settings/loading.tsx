export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-20">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-label="Loading" className="animate-spin" style={{ animationDuration: '0.8s' }}>
        <circle cx="20" cy="20" r="16" fill="none" stroke="#ECEAE4" strokeWidth="4" />
        <path d="M20 4a16 16 0 0 1 16 16" fill="none" stroke="#111111" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  )
}
