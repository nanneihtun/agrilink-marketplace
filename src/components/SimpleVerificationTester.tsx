import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Plus, 
  Trash2, 
  Eye, 
  CheckCircle,
  Clock,
  User,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface VerificationRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userType: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  documents: {
    nationalId?: {
      front: string;
      back: string;
      status: string;
    };
    businessLicense?: {
      document: string;
      status: string;
    };
    selfieWithId?: string;
  };
  additionalInfo?: {
    fullName?: string;
    phoneNumber?: string;
    address?: string;
  };
}

interface SimpleVerificationTesterProps {
  currentUser?: any;
}

export function SimpleVerificationTester({ currentUser: propCurrentUser }: SimpleVerificationTesterProps) {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load data from localStorage
  useEffect(() => {
    loadData();
    // Use prop currentUser if available, otherwise use localStorage
    if (propCurrentUser) {
      setCurrentUser(propCurrentUser);
    }
  }, [propCurrentUser]);

  const loadData = () => {
    try {
      // Load verification requests
      const savedRequests = JSON.parse(localStorage.getItem('agriconnect-verification-requests') || '[]');
      
      // Filter out any malformed requests and ensure they have required properties
      const validRequests = savedRequests.filter((request: any) => {
        return request && 
               typeof request.id === 'string' && 
               typeof request.userId === 'string' && 
               typeof request.userEmail === 'string' &&
               typeof request.userName === 'string';
      });
      
      setRequests(validRequests);

      // Load current user - only use if not provided via props
      if (!propCurrentUser) {
        const savedUser = JSON.parse(localStorage.getItem('agriconnect-myanmar-current-user') || 'null');
        setCurrentUser(savedUser);
      }

      console.log('📋 Loaded data:', {
        requestCount: validRequests.length,
        filteredOut: savedRequests.length - validRequests.length,
        currentUser: (propCurrentUser || currentUser)?.email || 'None'
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load verification data');
      // Set empty arrays as fallback
      setRequests([]);
      if (!propCurrentUser) {
        setCurrentUser(null);
      }
    }
  };

  // Quick login functions
  const quickLogin = (userType: 'admin' | 'farmer' | 'buyer') => {
    const users = {
      admin: {
        id: 'admin-001',
        email: 'admin@agrilink.com',
        name: 'Admin User',
        userType: 'admin',
        verified: true
      },
      farmer: {
        id: 'farmer-001', 
        email: 'farmer@demo.com',
        name: 'Test Farmer',
        userType: 'farmer',
        verified: false
      },
      buyer: {
        id: 'buyer-001',
        email: 'buyer@demo.com', 
        name: 'Test Buyer',
        userType: 'buyer',
        verified: false
      }
    };

    const user = users[userType];
    localStorage.setItem('agriconnect-myanmar-current-user', JSON.stringify(user));
    setCurrentUser(user);
    toast.success(`Logged in as ${user.name}`);
  };

  const logout = () => {
    localStorage.removeItem('agriconnect-myanmar-current-user');
    setCurrentUser(null);
    toast.success('Logged out');
  };

  // Create test verification request
  const createTestRequest = () => {
    const mockImage = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    const testRequest: VerificationRequest = {
      id: `verification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: 'test-user-001',
      userEmail: 'testuser@demo.com',
      userName: 'Test User',
      userType: 'farmer',
      type: 'id',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      documents: {
        nationalId: {
          front: mockImage,
          back: mockImage,
          status: 'pending'
        },
        selfieWithId: mockImage
      },
      additionalInfo: {
        fullName: 'Test User',
        phoneNumber: '+95 9 123 456 789',
        address: 'Yangon, Myanmar'
      }
    };

    try {
      const existingRequests = JSON.parse(localStorage.getItem('agriconnect-verification-requests') || '[]');
      existingRequests.push(testRequest);
      localStorage.setItem('agriconnect-verification-requests', JSON.stringify(existingRequests));
      
      setRequests(existingRequests);
      toast.success('✅ Test verification request created');
    } catch (error) {
      console.error('Failed to create test request:', error);
      toast.error('❌ Failed to create test request');
    }
  };

  // Approve/Reject verification request
  const handleVerificationAction = (requestId: string, action: 'approved' | 'rejected') => {
    try {
      const existingRequests = JSON.parse(localStorage.getItem('agriconnect-verification-requests') || '[]');
      const updatedRequests = existingRequests.map((req: VerificationRequest) => 
        req.id === requestId ? { ...req, status: action } : req
      );
      
      localStorage.setItem('agriconnect-verification-requests', JSON.stringify(updatedRequests));
      setRequests(updatedRequests);
      
      toast.success(`✅ Request ${action}`);
    } catch (error) {
      console.error('Failed to update request:', error);
      toast.error('❌ Failed to update request');
    }
  };

  // Clear all requests
  const clearAllRequests = () => {
    localStorage.removeItem('agriconnect-verification-requests');
    setRequests([]);
    toast.success('🗑️ All requests cleared');
  };

  // Initialize demo users
  const initializeDemoUsers = () => {
    try {
      const demoUsers = [
        {
          id: 'admin-001',
          email: 'admin@agrilink.com',
          password: 'admin123',
          name: 'Admin User',
          userType: 'admin',
          verified: true
        },
        {
          id: 'farmer-001',
          email: 'farmer@demo.com', 
          password: 'demo123',
          name: 'Test Farmer',
          userType: 'farmer',
          verified: false
        }
      ];

      localStorage.setItem('agriconnect-myanmar-users', JSON.stringify(demoUsers));
      toast.success('🎯 Demo users initialized');
    } catch (error) {
      console.error('Failed to initialize demo users:', error);
      toast.error('❌ Failed to initialize demo users');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Simple Verification Tester
          </CardTitle>
          <CardDescription>
            Direct localStorage testing for verification system - No authentication complexity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current User Status */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Current User:</p>
            {currentUser ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{currentUser.name} ({currentUser.email})</span>
                  <Badge variant="secondary">{currentUser.userType}</Badge>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not logged in</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button variant="outline" size="sm" onClick={() => quickLogin('admin')}>
              Login as Admin
            </Button>
            <Button variant="outline" size="sm" onClick={() => quickLogin('farmer')}>
              Login as Farmer  
            </Button>
            <Button variant="outline" size="sm" onClick={() => quickLogin('buyer')}>
              Login as Buyer
            </Button>
            <Button variant="outline" size="sm" onClick={initializeDemoUsers}>
              Init Demo Users
            </Button>
          </div>

          {/* Verification Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button onClick={createTestRequest} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Test Request
            </Button>
            <Button variant="outline" onClick={loadData} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
            <Button variant="destructive" onClick={clearAllRequests} className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 py-2">
            <div className="text-center">
              <div className="text-lg font-bold">{requests.filter(r => r.status === 'pending').length}</div>
              <div className="text-sm text-muted-foreground">Under Review</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{requests.filter(r => r.status === 'approved').length}</div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{requests.filter(r => r.status === 'rejected').length}</div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Requests ({requests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <Alert>
              <Clock className="w-4 h-4" />
              <AlertDescription>
                No verification requests found. Create a test request to get started.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{request.userName}</span>
                      <Badge variant="secondary">{request.userType}</Badge>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(request.submittedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>Email: {request.userEmail}</p>
                    <p>Phone: {request.additionalInfo?.phoneNumber || 'Not provided'}</p>
                    <p>Address: {request.additionalInfo?.address || 'Not provided'}</p>
                  </div>

                  {currentUser?.userType === 'admin' && request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleVerificationAction(request.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleVerificationAction(request.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}