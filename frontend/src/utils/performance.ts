/**
 * Performance monitoring utilities
 */

/**
 * Measure component render time
 */
export const measureRenderTime = (componentName: string, callback: () => void): void => {
  const startTime = performance.now();
  callback();
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  if (duration > 16) { // Warn if render takes more than one frame (16ms)
    console.warn(`[Performance] ${componentName} render took ${duration.toFixed(2)}ms`);
  }
};

/**
 * Debounce function to limit execution rate
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit execution frequency
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Lazy load images with intersection observer
 */
export const lazyLoadImage = (img: HTMLImageElement): void => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLImageElement;
        const src = target.dataset.src;
        
        if (src) {
          target.src = src;
          target.removeAttribute('data-src');
          observer.unobserve(target);
        }
      }
    });
  });

  observer.observe(img);
};

/**
 * Measure API call performance
 */
export const measureApiCall = async <T>(
  name: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`[API Performance] ${name} took ${duration.toFixed(2)}ms`);
    
    if (duration > 1000) {
      console.warn(`[API Performance] ${name} is slow (>${duration.toFixed(2)}ms)`);
    }
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.error(`[API Performance] ${name} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};

/**
 * Get performance metrics
 */
export const getPerformanceMetrics = (): {
  navigation?: PerformanceNavigationTiming;
  resources: PerformanceResourceTiming[];
  memory?: any;
} => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const memory = (performance as any).memory;

  return {
    navigation,
    resources,
    memory,
  };
};

/**
 * Log page load performance
 */
export const logPageLoadPerformance = (): void => {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      const metrics = getPerformanceMetrics();
      
      if (metrics.navigation) {
        const {
          domContentLoadedEventEnd,
          domContentLoadedEventStart,
          loadEventEnd,
          loadEventStart,
          responseEnd,
          requestStart,
        } = metrics.navigation;

        console.log('[Performance Metrics]', {
          'DOM Content Loaded': `${(domContentLoadedEventEnd - domContentLoadedEventStart).toFixed(2)}ms`,
          'Page Load': `${(loadEventEnd - loadEventStart).toFixed(2)}ms`,
          'Response Time': `${(responseEnd - requestStart).toFixed(2)}ms`,
          'Total Resources': metrics.resources.length,
        });
      }

      if (metrics.memory) {
        console.log('[Memory Usage]', {
          'Used JS Heap': `${(metrics.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
          'Total JS Heap': `${(metrics.memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
          'Heap Limit': `${(metrics.memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
        });
      }
    }, 0);
  });
};

/**
 * Request idle callback wrapper for non-critical tasks
 */
export const runWhenIdle = (callback: () => void, timeout: number = 2000): void => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, timeout);
  }
};

// Initialize performance logging in development
if (import.meta.env.DEV) {
  logPageLoadPerformance();
}
