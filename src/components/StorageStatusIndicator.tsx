import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  Database, 
  AlertTriangle, 
  CheckCircle,
  Trash2,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { getStorageInfo, cleanupStorage } from '../utils/storageManager';

interface StorageStatusIndicatorProps {
  onOpenStorageManagement?: () => void;
}

export function StorageStatusIndicator({ onOpenStorageManagement }: StorageStatusIndicatorProps) {
  const [storageInfo, setStorageInfo] = useState(getStorageInfo());
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [lastCheck, setLastCheck] = useState(Date.now());

  // Update storage info periodically
  useEffect(() => {
    const updateStorageInfo = () => {
      const info = getStorageInfo();
      setStorageInfo(info);
      setLastCheck(Date.now());
    };

    // Update immediately
    updateStorageInfo();

    // Update every 30 seconds
    const interval = setInterval(updateStorageInfo, 30000);

    return () => clearInterval(interval);
  }, []);

  // Auto-refresh when localStorage changes (approximate)
  useEffect(() => {
    const handleStorageChange = () => {
      setTimeout(() => {
        const info = getStorageInfo();
        setStorageInfo(info);
      }, 100);
    };

    // Listen for storage events (though these don't always fire for same-origin changes)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events we can dispatch
    window.addEventListener('agrilink-storage-changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('agrilink-storage-changed', handleStorageChange);
    };
  }, []);

  const handleQuickCleanup = async () => {
    setIsCleaningUp(true);
    try {
      await cleanupStorage();
      const newInfo = getStorageInfo();
      setStorageInfo(newInfo);
      toast.success('Storage cleanup completed successfully!');
    } catch (error) {
      console.error('Cleanup failed:', error);
      toast.error('Storage cleanup failed. Please try again.');
    } finally {
      setIsCleaningUp(false);
    }
  };

  // Don't show if dismissed or storage is healthy
  if (isDismissed || storageInfo.percentage < 75) {
    return null;
  }

  const getStatusInfo = () => {
    if (storageInfo.percentage >= 95) {
      return {
        variant: 'destructive' as const,
        icon: AlertTriangle,
        title: 'Storage Critical',
        message: 'Storage is nearly full. New data may not be saved.',
        color: 'text-red-600'
      };
    } else if (storageInfo.percentage >= 85) {
      return {
        variant: 'default' as const,
        icon: AlertTriangle,
        title: 'Storage Warning',
        message: 'Storage is getting full. Consider clearing old data.',
        color: 'text-yellow-600'
      };
    } else {
      return {
        variant: 'default' as const,
        icon: Database,
        title: 'Storage Notice',
        message: 'Storage usage is elevated. Monitor for issues.',
        color: 'text-blue-600'
      };
    }
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      <Alert variant={status.variant} className="shadow-lg border-2">
        <StatusIcon className="h-4 w-4" />
        <AlertDescription className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{status.title}</div>
              <div className="text-sm">{status.message}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span>
              {Math.round(storageInfo.used / 1024)} KB / {Math.round(storageInfo.total / 1024)} KB
            </span>
            <Badge variant="outline" className={status.color}>
              {Math.round(storageInfo.percentage)}% used
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleQuickCleanup}
              disabled={isCleaningUp}
              className="flex-1"
            >
              {isCleaningUp ? (
                <>
                  <Database className="w-3 h-3 mr-1 animate-pulse" />
                  Cleaning...
                </>
              ) : (
                <>
                  <Trash2 className="w-3 h-3 mr-1" />
                  Quick Clean
                </>
              )}
            </Button>
            
            {onOpenStorageManagement && (
              <Button
                size="sm"
                onClick={onOpenStorageManagement}
                className="flex-1"
              >
                <Database className="w-3 h-3 mr-1" />
                Manage
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}