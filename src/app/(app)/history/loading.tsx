export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-28 bg-muted rounded-lg animate-pulse" />
      <div className="bg-dark-card rounded-[18px] h-[72px] animate-pulse" />
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white border-2 border-black rounded-[18px] h-[88px] animate-pulse" />
      ))}
    </div>
  )
}
