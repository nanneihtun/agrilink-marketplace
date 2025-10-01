// Storage utilities for handling localStorage quota issues

/**
 * Compress an image file to a target size in bytes
 */
export function compressImage(file: File, maxSizeBytes: number = 500000): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions to reduce file size
      let { width, height } = img;
      const aspectRatio = width / height;
      
      // Start with reasonable dimensions
      const maxDimension = 400;
      if (width > height) {
        width = Math.min(width, maxDimension);
        height = width / aspectRatio;
      } else {
        height = Math.min(height, maxDimension);
        width = height * aspectRatio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Start with high quality and reduce if needed
      let quality = 0.8;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      
      // Reduce quality until we're under the size limit
      while (dataUrl.length > maxSizeBytes && quality > 0.1) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }
      
      // If still too large, reduce dimensions
      if (dataUrl.length > maxSizeBytes) {
        width *= 0.8;
        height *= 0.8;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        dataUrl = canvas.toDataURL('image/jpeg', 0.6);
      }
      
      resolve(dataUrl);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Check available localStorage space
 */
export function getLocalStorageInfo(): { used: number; available: number; total: number } {
  let used = 0;
  const total = 10 * 1024 * 1024; // Assume 10MB limit
  
  try {
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
  } catch (error) {
    console.warn('Could not calculate localStorage usage:', error);
  }
  
  return {
    used,
    available: total - used,
    total
  };
}

/**
 * Safe localStorage setItem with quota handling using simple storage utils
 */
export function safeSetItem(key: string, value: string): { success: boolean; error?: string; details?: any } {
  try {
    const itemSize = value.length + key.length;
    
    // Quick storage summary check without complex monitoring
    let used = 0;
    const total = 10 * 1024 * 1024; // 10MB limit
    
    for (const storageKey in localStorage) {
      if (localStorage.hasOwnProperty(storageKey)) {
        used += localStorage[storageKey].length + storageKey.length;
      }
    }
    
    const available = total - used;
    
    console.log('🔍 Storage check:', {
      key,
      itemSize: Math.round(itemSize / 1024) + 'KB',
      available: Math.round(available / 1024) + 'KB',
      used: Math.round(used / 1024) + 'KB',
      total: Math.round(total / 1024) + 'KB'
    });
    
    // Check if we have enough space (leaving 512KB buffer)
    const bufferSize = 512 * 1024;
    if (itemSize > available - bufferSize) {
      const usagePercentage = ((used + itemSize) / total) * 100;
      return {
        success: false,
        error: `Storage nearly full (${usagePercentage.toFixed(1)}%). Please clean up browser data or try a smaller image.`,
        details: {
          itemSize,
          available,
          wouldUse: usagePercentage
        }
      };
    }
    
    localStorage.setItem(key, value);
    console.log('✅ Storage save successful for key:', key);
    return { success: true };
  } catch (error) {
    console.error('❌ Storage save failed:', error);
    
    if (error instanceof DOMException && error.code === 22) {
      // QuotaExceededError
      return {
        success: false,
        error: 'Browser storage limit exceeded. Please clear app data in Settings or use a smaller image.',
        details: { errorCode: 22, errorType: 'QuotaExceededError' }
      };
    }
    
    return {
      success: false,
      error: 'Failed to save data: ' + (error instanceof Error ? error.message : 'Unknown error'),
      details: { error }
    };
  }
}

/**
 * Clean up old or unnecessary data from localStorage
 */
export function cleanupStorage(): { cleaned: number; errors: string[] } {
  let cleaned = 0;
  const errors: string[] = [];
  
  try {
    console.log('🧹 Starting aggressive cleanup...');
    
    // Remove any old temporary data
    const keysToCheck = Object.keys(localStorage);
    const cleanupPatterns = [
      /^temp-/,
      /^cache-/,
      /^old-/,
      /^debug-/,
      /^test-/
    ];
    
    keysToCheck.forEach(key => {
      if (cleanupPatterns.some(pattern => pattern.test(key))) {
        try {
          localStorage.removeItem(key);
          cleaned++;
          console.log(`🗑️ Removed temporary key: ${key}`);
        } catch (error) {
          errors.push(`Failed to remove ${key}: ${error}`);
        }
      }
    });
    
    // Remove large profile and storefront images from existing user data
    try {
      const users = localStorage.getItem('agriconnect-myanmar-users');
      
      if (users) {
        const usersData = JSON.parse(users);
        let modified = false;
        
        usersData.forEach((user: any) => {
          // Remove large profile images (keep only small ones)
          if (user.profileImage && user.profileImage.length > 200) {
            delete user.profileImage;
            modified = true;
            console.log(`🖼️ Removed large profile image for user: ${user.email}`);
          }
          
          // Remove storefront images to save space
          if (user.storefrontImage) {
            delete user.storefrontImage;
            modified = true;
            console.log(`🖼️ Removed storefront image for user: ${user.email}`);
          }
          
          // Remove large description fields
          if (user.businessDescription && user.businessDescription.length > 500) {
            user.businessDescription = user.businessDescription.substring(0, 500) + '...';
            modified = true;
          }
        });
        
        if (modified) {
          const result = safeSetItem('agriconnect-myanmar-users', JSON.stringify(usersData));
          if (result.success) {
            console.log('✅ Compacted user data successfully');
            cleaned++;
          } else {
            errors.push('Failed to save compacted user data');
          }
        }
      }
    } catch (error) {
      errors.push(`Failed to compact user data: ${error}`);
    }
    
    // Clean up product overrides of large images
    try {
      const overrides = localStorage.getItem('agriconnect-myanmar-product-overrides');
      
      if (overrides) {
        const overridesData = JSON.parse(overrides);
        let modified = false;
        
        Object.keys(overridesData).forEach(productId => {
          const product = overridesData[productId];
          if (product.image && product.image.length > 1000) {
            delete product.image;
            modified = true;
            console.log(`🖼️ Removed large product image for: ${productId}`);
          }
        });
        
        if (modified) {
          const result = safeSetItem('agriconnect-myanmar-product-overrides', JSON.stringify(overridesData));
          if (result.success) {
            console.log('✅ Cleaned product overrides');
            cleaned++;
          }
        }
      }
    } catch (error) {
      errors.push(`Failed to clean product overrides: ${error}`);
    }
    
    // Emergency cleanup: If still running low, remove non-essential data
    const storageInfo = getLocalStorageInfo();
    if (storageInfo.available < 1024 * 1024) { // Less than 1MB available
      console.log('🚨 Emergency cleanup: removing non-essential data');
      
      const nonEssentialKeys = [
        'agriconnect-myanmar-local-products',
        'agriconnect-myanmar-user-products',
        'agriconnect-myanmar-messages',
        'agriconnect-myanmar-conversations'
      ];
      
      nonEssentialKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          try {
            localStorage.removeItem(key);
            cleaned++;
            console.log(`🚨 Emergency: removed ${key}`);
          } catch (error) {
            errors.push(`Failed to remove ${key}: ${error}`);
          }
        }
      });
    }
    
  } catch (error) {
    errors.push(`General cleanup error: ${error}`);
  }
  
  console.log(`🧹 Cleanup completed: ${cleaned} items cleaned, ${errors.length} errors`);
  return { cleaned, errors };
}

/**
 * Get storage usage by category
 */
export function getStorageUsageByCategory(): Record<string, number> {
  const categories: Record<string, number> = {
    users: 0,
    products: 0,
    images: 0,
    other: 0
  };
  
  try {
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const size = localStorage[key].length + key.length;
        
        if (key.includes('users')) {
          categories.users += size;
        } else if (key.includes('products')) {
          categories.products += size;
        } else if (key.includes('image') || localStorage[key].startsWith('data:image/')) {
          categories.images += size;
        } else {
          categories.other += size;
        }
      }
    }
  } catch (error) {
    console.warn('Could not analyze storage usage:', error);
  }
  
  return categories;
}

/**
 * Convert bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}