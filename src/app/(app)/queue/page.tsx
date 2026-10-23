export default function QueuePage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-muted border-2 border-black flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4A4740" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <div>
        <h1 className="font-heading font-extrabold italic text-3xl uppercase">Queue</h1>
        <p className="text-body text-sm mt-1">Coming in Phase 4</p>
      </div>
    </div>
  )
}
