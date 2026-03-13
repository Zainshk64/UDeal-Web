import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'circle' | 'line';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  count = 1,
  className = '',
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-gray-200 rounded-xl overflow-hidden animate-pulse h-64 w-full">
            <div className="w-full h-48 bg-gray-300" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4" />
              <div className="h-4 bg-gray-300 rounded w-1/2" />
            </div>
          </div>
        );
      case 'text':
        return (
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
          </div>
        );
      case 'circle':
        return <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />;
      case 'line':
        return <div className="h-2 bg-gray-200 rounded w-full animate-pulse" />;
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
          {index < count - 1 && type === 'card' ? <div className="mb-4" /> : null}
        </div>
      ))}
    </div>
  );
};

// Skeleton Grid for products
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonLoader key={i} type="card" />
      ))}
    </div>
  );
};

// Skeleton for category strip
export const CategoryStripSkeleton: React.FC = () => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex-shrink-0">
          <SkeletonLoader type="circle" className="w-16 h-16" />
        </div>
      ))}
    </div>
  );
};
