import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  Eye,
  EyeOff,
  Copy,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface StorageDebugPanelProps {
  onClose?: () => void;
}

export function StorageDebugPanel({ onClose }: StorageDebugPanelProps) {
  const [storageData, setStorageData] = useState<Record<string, any>>({});
  const [showData, setShowData] = useState<Record<string, boolean>>({});
  const [copying, setCopying] = useState<string | null>(null);

  const refreshStorageData = () => {
    const data: Record<string, any> = {};
    
    // Get all AgriLink related localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('agriconnect-myanmar-')) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const parsed = JSON.parse(value);
            data[key] = {
              raw: value,
              parsed: parsed,
              size: value.length,
              type: Array.isArray(parsed) ? 'array' : typeof parsed,
              count: Array.isArray(parsed) ? parsed.length : 1
            };
          }
        } catch (error) {
          data[key] = {
            raw: localStorage.getItem(key),
            parsed: null,
            size: localStorage.getItem(key)?.length || 0,
            type: 'invalid-json',
            count: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    }
    
    setStorageData(data);
  };

  useEffect(() => {
    refreshStorageData();
  }, []);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const copyToClipboard = async (key: string) => {
    try {
      setCopying(key);
      await navigator.clipboard.writeText(storageData[key].raw);
      toast.success(`Copied ${key} to clipboard`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    } finally {
      setTimeout(() => setCopying(null), 1000);
    }
  };

  const clearStorageItem = (key: string) => {
    if (confirm(`Are you sure you want to delete ${key}? This cannot be undone.`)) {
      localStorage.removeItem(key);
      toast.success(`Deleted ${key}`);
      refreshStorageData();
    }
  };

  const clearAllAgriLinkData = () => {
    if (confirm('Are you sure you want to delete ALL AgriLink data? This will log you out and remove all products, messages, and settings. This cannot be undone.')) {
      Object.keys(storageData).forEach(key => {
        localStorage.removeItem(key);
      });
      toast.success('All AgriLink data cleared');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const totalSize = Object.values(storageData).reduce((sum, item) => sum + item.size, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6" />
            Storage Debug Panel
          </h1>
          <p className="text-muted-foreground">
            Inspect and manage localStorage data for AgriLink
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Overview</CardTitle>
          <CardDescription>
            Total AgriLink data: {formatSize(totalSize)} across {Object.keys(storageData).length} keys
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={refreshStorageData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={clearAllAgriLinkData} 
              variant="destructive" 
              size="sm"
              className="ml-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All AgriLink Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Storage Items */}
      <div className="space-y-4">
        {Object.entries(storageData).map(([key, data]) => (
          <Card key={key}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {key.replace('agriconnect-myanmar-', '').replace(/-/g, ' ')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{data.type}</Badge>
                  <Badge variant="secondary">{formatSize(data.size)}</Badge>
                  {data.count > 0 && (
                    <Badge>{data.count} items</Badge>
                  )}
                </div>
              </div>
              <CardDescription>
                Storage Key: <code className="bg-muted px-1 rounded text-xs">{key}</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
                  <strong>Error:</strong> {data.error}
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowData(prev => ({ ...prev, [key]: !prev[key] }))}
                >
                  {showData[key] ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showData[key] ? 'Hide' : 'Show'} Data
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(key)}
                  disabled={copying === key}
                >
                  {copying === key ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copying === key ? 'Copied!' : 'Copy Raw Data'}
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => clearStorageItem(key)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>

              {showData[key] && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Parsed Data Preview:</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-64">
                        {data.parsed ? JSON.stringify(data.parsed, null, 2) : 'Failed to parse JSON'}
                      </pre>
                    </div>
                    
                    {data.type === 'array' && data.parsed && (
                      <div>
                        <h4 className="font-medium mb-2">Array Items Summary:</h4>
                        <div className="grid gap-2">
                          {data.parsed.slice(0, 5).map((item: any, index: number) => (
                            <div key={index} className="bg-muted/50 p-2 rounded text-sm">
                              <strong>Item {index + 1}:</strong> {
                                typeof item === 'object' && item.id 
                                  ? `ID: ${item.id}${item.name ? `, Name: ${item.name}` : ''}` 
                                  : JSON.stringify(item).substring(0, 100) + '...'
                              }
                            </div>
                          ))}
                          {data.parsed.length > 5 && (
                            <div className="text-sm text-muted-foreground">
                              ... and {data.parsed.length - 5} more items
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(storageData).length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No AgriLink data found in localStorage</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}