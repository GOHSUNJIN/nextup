export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      {/* Logo bar */}
      <div className="px-5 pt-8 pb-4 flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon.svg" alt="" width={40} height={40} aria-hidden="true" />
        <div className="flex flex-col gap-px">
          <span
            className="font-wordmark text-2xl leading-none tracking-wide text-white"
            style={{ WebkitTextStroke: '1.2px #111111', textShadow: '2px 2px 0 #111111' }}
          >
            NEXT<span className="text-yellow">UP</span>
          </span>
          <span className="text-[10px] font-extrabold tracking-[1.5px]">BY PICKLEPEDIA</span>
        </div>
      </div>
      <main className="flex-1 px-4 pb-8">{children}</main>
    </div>
  )
}
