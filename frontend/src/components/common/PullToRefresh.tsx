import { useState, useRef, ReactNode } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
}

export const PullToRefresh = ({ 
  onRefresh, 
  children, 
  threshold = 80 
}: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isRefreshing || window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0) {
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  const progress = Math.min((pullDistance / threshold) * 100, 100);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all"
          style={{ 
            height: `${Math.min(pullDistance, threshold)}px`,
            opacity: progress / 100 
          }}
        >
          <div className="flex flex-col items-center">
            {isRefreshing ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            ) : (
              <svg 
                className="w-6 h-6 text-blue-600 transition-transform"
                style={{ transform: `rotate(${progress * 1.8}deg)` }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            <span className="text-xs text-gray-600 mt-1">
              {isRefreshing ? '刷新中...' : pullDistance >= threshold ? '释放刷新' : '下拉刷新'}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div 
        style={{ 
          transform: `translateY(${pullDistance > 0 ? Math.min(pullDistance, threshold) : 0}px)`,
          transition: pullDistance === 0 ? 'transform 0.3s ease' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};
