import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-surface-elevated rounded ${className}`}
      {...props}
    />
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden flex flex-col h-full">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 flex flex-col flex-1 space-y-2.5">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-1/4 mt-2" />
        <div className="pt-4 mt-auto">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
