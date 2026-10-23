'use client'

interface Props {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPage: (p: number) => void
}

export function Pager({ page, totalPages, totalItems, pageSize, onPage }: Props) {
  const from = Math.min((page - 1) * pageSize + 1, totalItems)
  const to = Math.min(page * pageSize, totalItems)

  const pages = buildPageNums(page, totalPages)

  const btnBase = 'w-[34px] h-[34px] min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[10px] text-sm font-bold transition-colors'

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-2 mt-1">
      <span className="text-xs font-semibold text-body whitespace-nowrap">
        {pageSize === 1
          ? `${page} of ${totalItems}`
          : `${from}–${to} of ${totalItems}`}
      </span>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className={`${btnBase} border-2 border-black bg-white disabled:opacity-40`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="w-[34px] text-center text-sm text-body">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              aria-current={p === page ? 'page' : undefined}
              className={`${btnBase} border-2 ${p === page ? 'bg-black text-yellow border-black' : 'border-black bg-white'}`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className={`${btnBase} border-2 border-black bg-white disabled:opacity-40`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </nav>
  )
}

function buildPageNums(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '…')[] = [1]

  if (current > 3) pages.push('…')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('…')
  pages.push(total)

  return pages
}
