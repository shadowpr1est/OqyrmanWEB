export const BookCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-[2/3] rounded-xl bg-muted/60 mb-3" />
    <div className="space-y-2">
      <div className="h-4 bg-muted/60 rounded w-3/4" />
      <div className="h-3 bg-muted/40 rounded w-1/2" />
      <div className="h-5 bg-muted/30 rounded w-16" />
    </div>
  </div>
);

export const BookGridSkeleton = ({ count = 12 }: { count?: number }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 lg:gap-6">
    {Array.from({ length: count }, (_, i) => (
      <BookCardSkeleton key={i} />
    ))}
  </div>
);
