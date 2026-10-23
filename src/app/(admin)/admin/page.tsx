export default function AdminPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh gap-4 text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-yellow border-2 border-black flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
      </div>
      <div>
        <h1 className="font-heading font-extrabold italic text-3xl uppercase">Admin</h1>
        <p className="text-body text-sm mt-1">Coming in Phase 3</p>
      </div>
    </div>
  )
}
