import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Database,
  Eye,
  Trash2,
  RefreshCw,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

export function LocalStorageDebugger() {
  const [isOpen, setIsOpen] = useState(false);

  const getLocalStorageData = () => {
    const keys = [
      'agriconnect-myanmar-users',
      'agriconnect-myanmar-current-user', 
      'agriconnect-verification-requests',
      'agriconnect-myanmar-local-products',
      'agriconnect-myanmar-product-overrides',
      'agriconnect-myanmar-deleted-products'
    ];

    const data: Record<string, any> = {};
    
    keys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          data[key] = JSON.parse(value);
        } else {
          data[key] = null;
        }
      } catch (error) {
        data[key] = `Error: ${error}`;
      }
    });

    return data;
  };

  const clearAllData = () => {
    const keys = [
      'agriconnect-myanmar-users',
      'agriconnect-myanmar-current-user', 
      'agriconnect-verification-requests',
      'agriconnect-myanmar-local-products',
      'agriconnect-myanmar-product-overrides',
      'agriconnect-myanmar-deleted-products'
    ];

    keys.forEach(key => {
      localStorage.removeItem(key);
    });

    toast.success('🗑️ All localStorage data cleared');
  };

  const exportData = () => {
    const data = getLocalStorageData();
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `agrilink-localStorage-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('📁 Data exported successfully');
  };

  if (!isOpen) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 opacity-50 hover:opacity-100"
      >
        <Database className="w-4 h-4" />
      </Button>
    );
  }

  const data = getLocalStorageData();

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[90vw]">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4" />
                LocalStorage Debug
              </CardTitle>
              <CardDescription className="text-xs">
                AgriLink data inspection
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {Object.entries(data).map(([key, value]) => {
            const shortKey = key.replace('agriconnect-myanmar-', '').replace('agriconnect-', '');
            let displayValue = '';
            let count = 0;
            
            if (Array.isArray(value)) {
              count = value.length;
              displayValue = `${count} items`;
            } else if (value && typeof value === 'object') {
              count = Object.keys(value).length;
              displayValue = `${count} properties`;
            } else if (value === null) {
              displayValue = 'Empty';
            } else {
              displayValue = String(value).substring(0, 30) + '...';
            }

            return (
              <div key={key} className="border rounded p-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{shortKey}</span>
                  {count > 0 && <Badge variant="secondary" className="text-xs">{count}</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">{displayValue}</div>
              </div>
            );
          })}

          <div className="pt-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={exportData} className="text-xs">
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
              <Button variant="destructive" size="sm" onClick={clearAllData} className="text-xs">
                <Trash2 className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}