export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-28 bg-muted rounded-lg animate-pulse" />
      <div className="h-3 w-16 bg-muted rounded animate-pulse" />
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white border-2 border-black rounded-[18px] h-[68px] animate-pulse" />
      ))}
    </div>
  )
}
