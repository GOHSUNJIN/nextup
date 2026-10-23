export default function Loading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-8 w-28 bg-muted rounded-lg animate-pulse" />
      <div className="bg-dark-card rounded-[18px] h-[88px] animate-pulse" />
      <div className="bg-white border-2 border-black rounded-[18px] overflow-hidden">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-12 flex items-center px-4 ${i > 1 ? 'border-t-2 border-black' : ''}`}>
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            <div className="h-3 w-24 bg-muted rounded animate-pulse ml-auto" />
          </div>
        ))}
      </div>
      <div className="bg-white border-2 border-black rounded-[18px] overflow-hidden">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-12 flex items-center px-4 ${i > 1 ? 'border-t-2 border-black' : ''}`}>
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
