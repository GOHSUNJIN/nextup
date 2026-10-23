export default function HistoryPage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-muted border-2 border-black flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4A4740" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M12 7v5l4 2" />
        </svg>
      </div>
      <div>
        <h1 className="font-heading font-extrabold italic text-3xl uppercase">History</h1>
        <p className="text-body text-sm mt-1">Coming in Phase 7</p>
      </div>
    </div>
  )
}
