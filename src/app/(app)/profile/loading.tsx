function Skeleton({ className }: { className: string }) {
  return <div className={`bg-muted rounded-[18px] animate-pulse ${className}`} />
}

export default function Loading() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-8 w-24 rounded-lg" />
      <Skeleton className="h-[88px]" />
      <Skeleton className="h-[200px]" />
      <Skeleton className="h-[144px]" />
    </div>
  )
}
