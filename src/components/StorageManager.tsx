import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { AlertCircle, Trash2, Database, CheckCircle } from "lucide-react";
import { cleanupStorage, formatBytes, getStorageUsageByCategory } from "../utils/storage";
import { getStorageSummary } from "../utils/simpleStorage";

interface StorageManagerProps {
  onClose?: () => void;
  onStorageCleared?: () => void;
}

export function StorageManager({ onClose, onStorageCleared }: StorageManagerProps) {
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<{ cleaned: number; errors: string[] } | null>(null);
  
  const storageInfo = getStorageSummary();
  const usageByCategory = getStorageUsageByCategory();
  const usagePercentage = storageInfo.usagePercentage;
  
  const handleCleanup = async () => {
    setIsCleaningUp(true);
    try {
      // Wait a bit to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = cleanupStorage();
      setCleanupResult(result);
      
      // Call callback to refresh parent component
      if (onStorageCleared) {
        onStorageCleared();
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
      setCleanupResult({ cleaned: 0, errors: ['Cleanup failed: ' + error] });
    } finally {
      setIsCleaningUp(false);
    }
  };
  
  const handleClearAll = () => {
    if (confirm('⚠️ This will clear ALL app data including your profile, products, and messages. Are you sure?')) {
      try {
        // Clear all AgriLink data
        const keysToRemove = [
          'agriconnect-myanmar-users',
          'agriconnect-myanmar-current-user',
          'agriconnect-verification-requests',
          'agriconnect-myanmar-user-products',
          'agriconnect-myanmar-product-overrides',
          'agriconnect-myanmar-deleted-products',

          'agriconnect-myanmar-messages',
          'agriconnect-myanmar-conversations',
          'agriconnect-myanmar-local-products'
        ];
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
        
        alert('✅ All app data has been cleared. The page will now reload.');
        
        if (onStorageCleared) {
          onStorageCleared();
        }
        
        // Reload to reset the app
        window.location.reload();
      } catch (error) {
        alert('Failed to clear data: ' + error);
      }
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Storage Manager
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage your browser storage space for AgriLink
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Storage Usage */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Storage Used</span>
              <span>{storageInfo.formattedUsed} / {storageInfo.formattedTotal}</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {usagePercentage.toFixed(1)}% of browser storage used
            </div>
          </div>
          
          {/* Storage Warning */}
          {usagePercentage > 80 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium text-sm">Storage Nearly Full</span>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                Your browser storage is {usagePercentage.toFixed(1)}% full. Consider cleaning up data to avoid issues.
              </p>
            </div>
          )}
          
          {/* Storage Breakdown */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Storage Usage by Category</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>User Data</span>
                <span>{formatBytes(usageByCategory.users)}</span>
              </div>
              <div className="flex justify-between">
                <span>Products</span>
                <span>{formatBytes(usageByCategory.products)}</span>
              </div>
              <div className="flex justify-between">
                <span>Images</span>
                <span>{formatBytes(usageByCategory.images)}</span>
              </div>
              <div className="flex justify-between">
                <span>Other</span>
                <span>{formatBytes(usageByCategory.other)}</span>
              </div>
            </div>
          </div>
          
          {/* Cleanup Result */}
          {cleanupResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium text-sm">Cleanup Complete</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                {cleanupResult.cleaned > 0 
                  ? `Successfully cleaned ${cleanupResult.cleaned} items. ` 
                  : 'No items needed cleaning. '
                }
                {cleanupResult.errors.length > 0 && `${cleanupResult.errors.length} errors occurred.`}
              </p>
              {cleanupResult.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer">Show errors</summary>
                  <ul className="text-xs mt-1 pl-4">
                    {cleanupResult.errors.map((error, i) => (
                      <li key={i} className="list-disc">{error}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleCleanup}
              disabled={isCleaningUp}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isCleaningUp ? 'Cleaning up...' : 'Clean Up Storage'}
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleClearAll}
              className="w-full"
            >
              <Database className="w-4 h-4 mr-2" />
              Clear All App Data
            </Button>
            
            {onClose && (
              <Button variant="outline" onClick={onClose} className="w-full">
                Close
              </Button>
            )}
          </div>
          
          {/* Help Text */}
          <div className="text-xs text-muted-foreground bg-muted/50 rounded p-3">
            <h5 className="font-medium mb-1">Storage Tips:</h5>
            <ul className="space-y-1 list-disc pl-4">
              <li>Profile images are compressed automatically to save space</li>
              <li>Clean up regularly if you upload many large images</li>
              <li>Clearing app data will log you out and remove all local data</li>
              <li>You will need to create a new account after clearing all data</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}