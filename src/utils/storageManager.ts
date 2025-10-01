/**
 * Storage Manager for AgriLink
 * Handles localStorage quota management, cleanup, and optimization
 */

interface StorageInfo {
  used: number;
  available: number;
  total: number;
  percentage: number;
}

interface StorageItem {
  key: string;
  size: number;
  lastAccessed: string;
  priority: 'high' | 'medium' | 'low';
}

const STORAGE_KEYS = {
  USERS: 'agriconnect-myanmar-users',
  LOCAL_PRODUCTS: 'agriconnect-myanmar-local-products',
  SAVED_PRODUCTS: 'agriconnect-myanmar-saved-products',
  CURRENT_USER: 'agriconnect-myanmar-current-user',
  CHAT_HISTORY: 'agriconnect-myanmar-chat-history',
  TEMP_DATA: 'agriconnect-myanmar-temp'
} as const;

const KEY_PRIORITIES: Record<string, 'high' | 'medium' | 'low'> = {
  [STORAGE_KEYS.CURRENT_USER]: 'high',
  [STORAGE_KEYS.USERS]: 'high',
  [STORAGE_KEYS.SAVED_PRODUCTS]: 'medium',
  [STORAGE_KEYS.LOCAL_PRODUCTS]: 'medium',
  [STORAGE_KEYS.CHAT_HISTORY]: 'low',
  [STORAGE_KEYS.TEMP_DATA]: 'low'
};

export class StorageManager {
  private static instance: StorageManager;
  private readonly MAX_STORAGE_PERCENTAGE = 80; // Don't exceed 80% of available storage
  private readonly CLEANUP_THRESHOLD = 90; // Start cleanup at 90%

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  /**
   * Get current storage usage information
   */
  getStorageInfo(): StorageInfo {
    let used = 0;
    
    // Calculate used storage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        used += key.length + value.length;
      }
    }

    // Estimate available storage (varies by browser, typically 5-10MB)
    const estimated = this.estimateStorageQuota();
    
    return {
      used,
      available: estimated - used,
      total: estimated,
      percentage: (used / estimated) * 100
    };
  }

  /**
   * Estimate storage quota (conservative estimate)
   */
  private estimateStorageQuota(): number {
    // Try to estimate based on user agent, default to 5MB
    try {
      // Most modern browsers support 5-10MB
      // Mobile browsers often have smaller limits
      if (typeof navigator !== 'undefined') {
        if (navigator.userAgent.includes('Mobile') || navigator.userAgent.includes('Android')) {
          return 3 * 1024 * 1024; // 3MB for mobile
        }
      }
      return 8 * 1024 * 1024; // 8MB for desktop
    } catch (error) {
      return 5 * 1024 * 1024; // 5MB fallback
    }
  }

  /**
   * Check if storage is near capacity
   */
  isStorageNearCapacity(): boolean {
    const info = this.getStorageInfo();
    return info.percentage >= this.CLEANUP_THRESHOLD;
  }

  /**
   * Get storage items with metadata
   */
  private getStorageItems(): StorageItem[] {
    const items: StorageItem[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('agriconnect-myanmar-')) {
        const value = localStorage.getItem(key) || '';
        const size = key.length + value.length;
        const priority = KEY_PRIORITIES[key] || 'low';
        
        items.push({
          key,
          size,
          lastAccessed: this.getLastAccessTime(key),
          priority
        });
      }
    }
    
    return items.sort((a, b) => {
      // Sort by priority first, then by last accessed time
      const priorityOrder = { low: 0, medium: 1, high: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime();
    });
  }

  /**
   * Get last access time for a key (mock implementation)
   */
  private getLastAccessTime(key: string): string {
    // In a real implementation, you'd track access times
    // For now, return current time minus random days for demo
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  }

  /**
   * Clean up storage to free space
   */
  async cleanupStorage(targetReduction = 30): Promise<{ cleaned: number; freed: number }> {
    console.log('🧹 Starting storage cleanup...');
    
    const items = this.getStorageItems();
    let freedBytes = 0;
    let cleanedItems = 0;

    // Start with lowest priority, oldest items
    for (const item of items) {
      if (item.priority === 'low') {
        try {
          // Clean up specific data types
          if (item.key === STORAGE_KEYS.CHAT_HISTORY) {
            freedBytes += await this.cleanupChatHistory();
          } else if (item.key === STORAGE_KEYS.LOCAL_PRODUCTS) {
            freedBytes += await this.cleanupOldProducts();
          } else if (item.key.includes('temp')) {
            localStorage.removeItem(item.key);
            freedBytes += item.size;
          }
          
          cleanedItems++;
          
          // Check if we've freed enough space
          const currentInfo = this.getStorageInfo();
          if (currentInfo.percentage < targetReduction) {
            break;
          }
        } catch (error) {
          console.warn(`Failed to cleanup ${item.key}:`, error);
        }
      }
    }

    console.log(`✅ Cleanup completed: ${cleanedItems} items, ${freedBytes} bytes freed`);
    return { cleaned: cleanedItems, freed: freedBytes };
  }

  /**
   * Clean up chat history - keep only recent conversations
   */
  private async cleanupChatHistory(): Promise<number> {
    const key = STORAGE_KEYS.CHAT_HISTORY;
    const data = localStorage.getItem(key);
    if (!data) return 0;

    try {
      const chatHistory = JSON.parse(data);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep last 30 days

      // Filter recent conversations
      const filtered = Object.fromEntries(
        Object.entries(chatHistory).filter(([_, conversation]: [string, any]) => {
          return new Date(conversation.lastMessage?.timestamp || 0) > cutoffDate;
        })
      );

      const originalSize = data.length;
      localStorage.setItem(key, JSON.stringify(filtered));
      const newSize = JSON.stringify(filtered).length;
      
      return Math.max(0, originalSize - newSize);
    } catch (error) {
      console.warn('Failed to cleanup chat history:', error);
      return 0;
    }
  }

  /**
   * Clean up old products - remove products older than 90 days (but preserve products with images)
   */
  private async cleanupOldProducts(): Promise<number> {
    const key = STORAGE_KEYS.LOCAL_PRODUCTS;
    const data = localStorage.getItem(key);
    if (!data) return 0;

    try {
      const products = JSON.parse(data);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90); // Keep products from last 90 days

      const filtered = products.filter((product: any) => {
        const createdDate = new Date(product.lastUpdated || product.createdAt || 0);
        const isRecent = createdDate > cutoffDate;
        const hasImages = product.images?.length > 0 || product.image;
        
        // Keep recent products OR products with images (more conservative)
        return isRecent || hasImages;
      });

      const originalSize = data.length;
      
      // Only save if we actually filtered something out
      if (filtered.length < products.length) {
        localStorage.setItem(key, JSON.stringify(filtered));
        const newSize = JSON.stringify(filtered).length;
        console.log(`🧹 Product cleanup: removed ${products.length - filtered.length} old products, freed ${Math.round((originalSize - newSize) / 1024)} KB`);
        return Math.max(0, originalSize - newSize);
      }
      
      return 0;
    } catch (error) {
      console.warn('Failed to cleanup old products:', error);
      return 0;
    }
  }

  /**
   * Compress JSON data before storage
   */
  compressData(data: any): string {
    try {
      // Simple compression: remove unnecessary whitespace and format
      return JSON.stringify(data, null, 0);
    } catch (error) {
      console.warn('Failed to compress data:', error);
      return JSON.stringify(data);
    }
  }

  /**
   * Safe set item with quota management
   */
  async safeSetItem(key: string, value: string): Promise<boolean> {
    try {
      // Check storage before attempting to set
      const info = this.getStorageInfo();
      const requiredSpace = key.length + value.length;
      
      console.log(`📊 Storage check for ${key}:`, {
        required: `${Math.round(requiredSpace / 1024)} KB`,
        available: `${Math.round(info.available / 1024)} KB`,
        used: `${Math.round(info.percentage)}%`
      });
      
      if (info.available < requiredSpace) {
        console.warn('⚠️ Insufficient storage space, attempting cleanup...');
        await this.cleanupStorage();
        
        // Check again after cleanup
        const newInfo = this.getStorageInfo();
        if (newInfo.available < requiredSpace) {
          console.error(`❌ Still insufficient space after cleanup. Required: ${Math.round(requiredSpace / 1024)} KB, Available: ${Math.round(newInfo.available / 1024)} KB`);
          return false;
        } else {
          console.log(`✅ Cleanup successful. Now available: ${Math.round(newInfo.available / 1024)} KB`);
        }
      }

      localStorage.setItem(key, value);
      console.log(`✅ Successfully stored ${key} (${Math.round(requiredSpace / 1024)} KB)`);
      
      // Notify components that storage has changed
      try {
        window.dispatchEvent(new Event('agrilink-storage-changed'));
      } catch (error) {
        // Ignore event dispatch errors
      }
      
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('❌ Storage quota exceeded, attempting emergency cleanup...');
        await this.emergencyCleanup();
        
        try {
          localStorage.setItem(key, value);
          console.log('✅ Storage successful after emergency cleanup');
          return true;
        } catch (retryError) {
          console.error('❌ Failed to store even after emergency cleanup:', retryError);
          return false;
        }
      }
      
      console.error('❌ Failed to store data:', error);
      return false;
    }
  }

  /**
   * Emergency cleanup - more aggressive cleanup
   */
  private async emergencyCleanup(): Promise<void> {
    console.log('🚨 Emergency storage cleanup initiated');
    
    // Remove all low priority items
    const items = this.getStorageItems();
    for (const item of items) {
      if (item.priority === 'low') {
        localStorage.removeItem(item.key);
      }
    }

    // Cleanup medium priority items if still needed
    const info = this.getStorageInfo();
    if (info.percentage > 70) {
      for (const item of items) {
        if (item.priority === 'medium') {
          await this.cleanupOldProducts();
          break; // Only cleanup products, keep saved products
        }
      }
    }
  }

  /**
   * Get storage usage by category
   */
  getStorageBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('agriconnect-myanmar-')) {
        const value = localStorage.getItem(key) || '';
        breakdown[key] = key.length + value.length;
      }
    }
    
    return breakdown;
  }
}

// Export singleton instance
export const storageManager = StorageManager.getInstance();

// Export utility functions
export const safeLocalStorageSetItem = async (key: string, value: any): Promise<boolean> => {
  const compressedValue = storageManager.compressData(value);
  return await storageManager.safeSetItem(key, compressedValue);
};

export const getStorageInfo = (): StorageInfo => {
  return storageManager.getStorageInfo();
};

export const cleanupStorage = async (): Promise<void> => {
  await storageManager.cleanupStorage();
};

/**
 * Dispatch a custom event to notify components that storage has changed
 */
export const notifyStorageChanged = (): void => {
  try {
    window.dispatchEvent(new Event('agrilink-storage-changed'));
  } catch (error) {
    // Ignore errors in event dispatching
  }
};