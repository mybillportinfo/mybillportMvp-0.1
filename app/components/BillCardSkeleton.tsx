'use client';

export function BillCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-slate-200 rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 bg-slate-200 rounded w-28" />
            <div className="h-4 bg-slate-200 rounded w-14" />
          </div>
          <div className="h-3 bg-slate-200 rounded w-20 mb-3" />
          <div className="h-6 bg-slate-200 rounded w-16" />
        </div>
        <div className="flex flex-col gap-2 items-end flex-shrink-0">
          <div className="h-5 bg-slate-200 rounded w-12" />
          <div className="h-8 bg-slate-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function BillListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <BillCardSkeleton key={i} />
      ))}
    </div>
  );
}
