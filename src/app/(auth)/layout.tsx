export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-black">
      <main className="flex-1 px-4 pt-6 pb-8">{children}</main>
    </div>
  )
}
