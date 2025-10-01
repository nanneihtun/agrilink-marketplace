import { useState, useEffect, useRef } from 'react';
import { getLocalStorageInfo } from '../utils/storage';

export interface StorageStatus {
  isNearCapacity: boolean;
  isAtCapacity: boolean;
  usagePercentage: number;
  availableSpace: number;
  totalSpace: number;
  usedSpace: number;
}

export function useStorageMonitor() {
  const [storageStatus, setStorageStatus] = useState<StorageStatus>({
    isNearCapacity: false,
    isAtCapacity: false,
    usagePercentage: 0,
    availableSpace: 0,
    totalSpace: 0,
    usedSpace: 0
  });

  const isCheckingRef = useRef(false);
  const lastCheckRef = useRef(0);
  const mountedRef = useRef(true);

  // Simple, stable function that doesn't depend on any state
  const performStorageCheck = () => {
    // Prevent multiple simultaneous checks and rate limit
    const now = Date.now();
    if (isCheckingRef.current || now - lastCheckRef.current < 1000) {
      return;
    }

    try {
      isCheckingRef.current = true;
      lastCheckRef.current = now;
      
      const info = getLocalStorageInfo();
      const usagePercentage = (info.used / info.total) * 100;
      
      const newStatus: StorageStatus = {
        isNearCapacity: usagePercentage > 80,
        isAtCapacity: usagePercentage > 95,
        usagePercentage,
        availableSpace: info.available,
        totalSpace: info.total,
        usedSpace: info.used
      };
      
      // Only update if component is still mounted
      if (mountedRef.current) {
        setStorageStatus(newStatus);
      }
    } catch (error) {
      console.error('Failed to check storage status:', error);
    } finally {
      isCheckingRef.current = false;
    }
  };

  // Initial check on mount only
  useEffect(() => {
    mountedRef.current = true;
    performStorageCheck();
    
    return () => {
      mountedRef.current = false;
    };
  }, []); // Empty dependency array - only run on mount

  // Periodic checks with cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      if (mountedRef.current) {
        performStorageCheck();
      }
    }, 60000); // Check every minute instead of 30 seconds
    
    return () => clearInterval(interval);
  }, []); // Empty dependency array

  // Storage event listeners with cleanup
  useEffect(() => {
    const handleStorageChange = () => {
      if (mountedRef.current) {
        // Debounce storage change events
        setTimeout(() => {
          if (mountedRef.current) {
            performStorageCheck();
          }
        }, 500);
      }
    };

    window.addEventListener('agrilink-storage-change', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('agrilink-storage-change', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array

  // Stable refresh function
  const refreshStorage = () => {
    if (mountedRef.current) {
      performStorageCheck();
    }
  };

  return {
    storageStatus,
    refreshStorage
  };
}

// Deprecated: Use simple storage utilities instead
// export function notifyStorageChange() {
//   window.dispatchEvent(new CustomEvent('agrilink-storage-change'));
// }