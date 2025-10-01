import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  HardDrive, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Info,
  Database
} from 'lucide-react';
import { toast } from 'sonner';
import { storageManager, getStorageInfo, cleanupStorage } from '../utils/storageManager';

interface StorageMonitorProps {
  onBack?: () => void;
}

export function StorageMonitor({ onBack }: StorageMonitorProps) {
  const [storageInfo, setStorageInfo] = useState(getStorageInfo());
  const [storageBreakdown, setStorageBreakdown] = useState<Record<string, number>>({});
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [lastCleanup, setLastCleanup] = useState<string | null>(null);

  const refreshStorageInfo = () => {
    setStorageInfo(getStorageInfo());
    setStorageBreakdown(storageManager.getStorageBreakdown());
  };

  useEffect(() => {
    refreshStorageInfo();
    
    // Refresh every 30 seconds
    const interval = setInterval(refreshStorageInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCleanup = async () => {
    setIsCleaningUp(true);
    try {
      const result = await storageManager.cleanupStorage();
      toast.success(`Cleanup completed! Freed ${Math.round(result.freed / 1024)} KB`);
      setLastCleanup(new Date().toLocaleString());
      refreshStorageInfo();
    } catch (error) {
      console.error('Cleanup failed:', error);
      toast.error('Cleanup failed. Please try again.');
    } finally {
      setIsCleaningUp(false);
    }
  };

  const handleEmergencyCleanup = async () => {
    if (!confirm('This will remove old chat history and temporary data. Continue?')) {
      return;
    }

    setIsCleaningUp(true);
    try {
      await storageManager.cleanupStorage(50); // More aggressive cleanup
      toast.success('Emergency cleanup completed!');
      setLastCleanup(new Date().toLocaleString());
      refreshStorageInfo();
    } catch (error) {
      console.error('Emergency cleanup failed:', error);
      toast.error('Emergency cleanup failed.');
    } finally {
      setIsCleaningUp(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStorageStatus = () => {
    if (storageInfo.percentage < 50) return { color: 'bg-green-500', status: 'Good', icon: CheckCircle };
    if (storageInfo.percentage < 80) return { color: 'bg-yellow-500', status: 'Warning', icon: AlertTriangle };
    return { color: 'bg-red-500', status: 'Critical', icon: AlertTriangle };
  };

  const status = getStorageStatus();
  const StatusIcon = status.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="h-9 px-3 -ml-3">
            <HardDrive className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Storage Management</h1>
          <p className="text-muted-foreground">Monitor and manage local storage usage</p>
        </div>
      </div>

      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Storage Overview
          </CardTitle>
          <CardDescription>
            Current local storage usage and health status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Storage Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon className={`w-5 h-5 ${status.status === 'Good' ? 'text-green-500' : status.status === 'Warning' ? 'text-yellow-500' : 'text-red-500'}`} />
              <div>
                <p className="font-medium">Storage Status: {status.status}</p>
                <p className="text-sm text-muted-foreground">
                  {formatBytes(storageInfo.used)} of {formatBytes(storageInfo.total)} used
                </p>
              </div>
            </div>
            <Badge variant={status.status === 'Good' ? 'default' : status.status === 'Warning' ? 'secondary' : 'destructive'}>
              {Math.round(storageInfo.percentage)}%
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={storageInfo.percentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Warning Messages */}
          {storageInfo.percentage > 80 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Storage Warning</p>
                  <p className="text-sm text-yellow-700">
                    Storage is {Math.round(storageInfo.percentage)}% full. Consider cleaning up old data to prevent storage errors.
                  </p>
                </div>
              </div>
            </div>
          )}

          {storageInfo.percentage > 95 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Critical Storage Level</p>
                  <p className="text-sm text-red-700">
                    Storage is critically full. New data may not be saved until space is freed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Breakdown</CardTitle>
          <CardDescription>
            Detailed view of what's using storage space
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(storageBreakdown).map(([key, size]) => {
              const percentage = (size / storageInfo.used) * 100;
              const friendlyName = key.replace('agriconnect-myanmar-', '').replace(/-/g, ' ');
              
              return (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">{friendlyName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{formatBytes(size)}</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(percentage)}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cleanup Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Cleanup Actions
          </CardTitle>
          <CardDescription>
            Free up storage space by removing old or unnecessary data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {lastCleanup && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                Last cleanup: {lastCleanup}
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Standard Cleanup</h4>
              <p className="text-sm text-muted-foreground">
                Removes old chat history and temporary data (safe operation)
              </p>
              <Button
                onClick={handleCleanup}
                disabled={isCleaningUp}
                className="w-full"
                variant="outline"
              >
                {isCleaningUp ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Cleaning...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Run Cleanup
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Emergency Cleanup</h4>
              <p className="text-sm text-muted-foreground">
                More aggressive cleanup for critical storage situations
              </p>
              <Button
                onClick={handleEmergencyCleanup}
                disabled={isCleaningUp}
                className="w-full"
                variant="destructive"
              >
                {isCleaningUp ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Cleaning...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Emergency Cleanup
                  </>
                )}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Button
              onClick={refreshStorageInfo}
              variant="ghost"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Storage Info
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Storage Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p>Local storage is limited to about 5-10MB per website</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p>Old chat messages and temporary data are automatically cleaned up</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p>Product listings and user data are preserved during cleanup</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p>Regular cleanup prevents storage errors and keeps the app running smoothly</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}