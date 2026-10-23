function Skeleton({ className }: { className: string }) {
  return <div className={`bg-muted rounded-[18px] animate-pulse ${className}`} />
}

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
      <Skeleton className="h-[72px]" />
      <Skeleton className="h-[72px]" />
      <Skeleton className="h-[72px]" />
    </div>
  )
}
