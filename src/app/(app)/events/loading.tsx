function Skeleton({ className }: { className: string }) {
  return <div className={`bg-muted rounded-[18px] animate-pulse ${className}`} />
}

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-24 rounded-lg" />
      <Skeleton className="h-[68px]" />
      <Skeleton className="h-[68px]" />
      <Skeleton className="h-[68px]" />
    </div>
  )
}
