export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-24 bg-muted rounded-lg animate-pulse" />
      <div className="bg-dark-card rounded-[18px] h-52 animate-pulse" />
      <div className="h-14 bg-muted rounded-[16px] animate-pulse" />
    </div>
  )
}
