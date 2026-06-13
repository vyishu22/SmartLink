export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-surface-800 ${className}`} />
);

export const CardSkeleton = () => (
  <div className="card space-y-3">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr className="border-b border-surface-800">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

export const UrlCardSkeleton = () => (
  <div className="card space-y-3">
    <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20 ml-4" />
    </div>
    <div className="flex gap-3">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-6 w-16" />
    </div>
  </div>
);
