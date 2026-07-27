export function LoadingState({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-[#E2E8F0] bg-white p-5">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded shimmer" />
              <div className="h-3 w-2/3 rounded shimmer" />
              <div className="h-2 w-full rounded-full shimmer mt-3" />
            </div>
            <div className="h-6 w-16 rounded-full shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
