/**
 * Simple, non-reactive storage utilities to avoid infinite loops
 */

/**
 * Simple storage check without React hooks
 */
export function isStorageNearCapacity(): boolean {
  try {
    let used = 0;
    const total = 10 * 1024 * 1024; // Assume 10MB limit
    
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    const usagePercentage = (used / total) * 100;
    return usagePercentage > 80;
  } catch (error) {
    console.warn('Could not check storage usage:', error);
    return false;
  }
}

/**
 * Simple storage usage percentage
 */
export function getStorageUsagePercentage(): number {
  try {
    let used = 0;
    const total = 10 * 1024 * 1024; // Assume 10MB limit
    
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    return Math.round((used / total) * 100 * 10) / 10; // Round to 1 decimal
  } catch (error) {
    console.warn('Could not calculate storage usage:', error);
    return 0;
  }
}

/**
 * Check if we can safely store data of a given size
 */
export function canSafelyStore(dataSize: number): boolean {
  try {
    let used = 0;
    const total = 10 * 1024 * 1024; // Assume 10MB limit
    
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    const available = total - used;
    const bufferSize = 512 * 1024; // 512KB buffer
    
    return dataSize <= (available - bufferSize);
  } catch (error) {
    console.warn('Could not check storage capacity:', error);
    return false;
  }
}

/**
 * Format storage size for display
 */
export function formatStorageSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Get current storage usage summary
 */
export function getStorageSummary(): {
  used: number;
  total: number;
  available: number;
  usagePercentage: number;
  formattedUsed: string;
  formattedTotal: string;
  formattedAvailable: string;
} {
  try {
    let used = 0;
    const total = 10 * 1024 * 1024; // Assume 10MB limit
    
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    const available = total - used;
    const usagePercentage = Math.round((used / total) * 100 * 10) / 10;
    
    return {
      used,
      total,
      available,
      usagePercentage,
      formattedUsed: formatStorageSize(used),
      formattedTotal: formatStorageSize(total),
      formattedAvailable: formatStorageSize(available)
    };
  } catch (error) {
    console.warn('Could not get storage summary:', error);
    return {
      used: 0,
      total: 10 * 1024 * 1024,
      available: 10 * 1024 * 1024,
      usagePercentage: 0,
      formattedUsed: '0 B',
      formattedTotal: '10 MB',
      formattedAvailable: '10 MB'
    };
  }
}