/**
 * Performance monitoring utility to detect and prevent render loops
 */

interface RenderStats {
  count: number;
  lastRender: number;
  warnings: number;
}

const renderStats = new Map<string, RenderStats>();

/**
 * Monitor component renders and detect potential performance issues
 */
export const useRenderMonitor = (componentName: string) => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const now = Date.now();
  const stats = renderStats.get(componentName) || { count: 0, lastRender: now, warnings: 0 };
  
  stats.count++;
  stats.lastRender = now;
  
  // Detect rapid re-renders (more than 10 renders in 1 second)
  const oneSecondAgo = now - 1000;
  if (stats.count > 10 && stats.lastRender > oneSecondAgo) {
    if (stats.warnings < 3) { // Limit warnings to prevent spam
      console.warn(`⚠️ ${componentName} has rendered ${stats.count} times rapidly - potential performance issue`);
      stats.warnings++;
    }
  }
  
  // Reset count every 10 seconds to track current performance
  if (now - stats.lastRender > 10000) {
    stats.count = 1;
    stats.warnings = 0;
  }
  
  renderStats.set(componentName, stats);
};

/**
 * Get render statistics for debugging
 */
export const getRenderStats = () => {
  const results: Record<string, RenderStats> = {};
  renderStats.forEach((stats, componentName) => {
    results[componentName] = { ...stats };
  });
  return results;
};

/**
 * Clear render statistics
 */
export const clearRenderStats = () => {
  renderStats.clear();
};