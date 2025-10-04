import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Building2, 
  MapPin, 
  FileText, 
  Eye, 
  Shield, 
  AlertTriangle, 
  Users, 
  Flag, 
  Settings, 
  Package, 
  DollarSign,
  TrendingUp,
  Ban,
  RefreshCw
} from 'lucide-react';
import { AdminVerificationPanel } from './AdminVerificationPanelNew';
import { supabase } from '../lib/supabase';

interface AdminStats {
  totalUsers: number;
  pendingVerifications: number;
  totalProducts: number;
  activeTransactions: number;
  reportedContent: number;
  platformRevenue: number;
}

// Note: VerificationRequest interface removed since we no longer show detailed verification data

interface RecentUser {
  id: string;
  name: string;
  user_type: string;
  created_at: string;
  email: string;
}

interface AdminDashboardProps {
  currentAdmin: any;
  onBack: () => void;
  onNavigateToVerification?: () => void;
  onUpdateUser?: (updates: any) => Promise<void>;
}

export function AdminDashboard({ currentAdmin, onBack, onNavigateToVerification, onUpdateUser }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    pendingVerifications: 0,
    totalProducts: 0,
    activeTransactions: 0,
    reportedContent: 0,
    platformRevenue: 0,
  });

  // Note: verificationRequests state removed since we redirect to dedicated page
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [reportedProducts] = useState([
    { id: '1', name: 'Spam Product', seller: 'Unknown', price: 100, reportedCount: 5 },
    { id: '2', name: 'Fake Listing', seller: 'Suspicious', price: 200, reportedCount: 3 },
  ]);

  const [recentTransactions] = useState([
    { id: '1', amount: 150, buyer: 'John Doe', seller: 'Jane Smith', date: '2 hours ago' },
    { id: '2', amount: 300, buyer: 'Mike Johnson', seller: 'John Doe', date: '4 hours ago' },
  ]);

  // Function to fetch admin data
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch total users count (excluding admins)
      const { count: totalUsersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .neq('user_type', 'admin');

      // Debug: Check what verification statuses exist in the database
      const { data: debugUsers } = await supabase
        .from('users')
        .select('verification_status, user_type')
        .neq('user_type', 'admin');
      
      console.log('🔍 Debug - All verification statuses:', debugUsers?.map(u => u.verification_status));
      console.log('🔍 Debug - Under review count:', debugUsers?.filter(u => u.verification_status === 'under_review').length);
      console.log('🔍 Debug - Pending count:', debugUsers?.filter(u => u.verification_status === 'pending').length);

      // Fetch pending verifications count (excluding admins)
      // Only count 'under_review' status as these are users who have actually submitted for review
      const { count: pendingVerificationsCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'under_review')
        .neq('user_type', 'admin');

      // Fetch total products count
      const { count: totalProductsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Note: We no longer fetch detailed verification requests data
      // since we redirect to the dedicated verification page

      // Fetch recent users (excluding admins)
      const { data: recentUsersData } = await supabase
        .from('users')
        .select('id, name, user_type, created_at, email')
        .neq('user_type', 'admin')
        .order('created_at', { ascending: false })
        .limit(5);

      // Update stats
      setStats({
        totalUsers: totalUsersCount || 0,
        pendingVerifications: pendingVerificationsCount || 0,
        totalProducts: totalProductsCount || 0,
        activeTransactions: 156, // Keep mock data for now
        reportedContent: 8, // Keep mock data for now
        platformRevenue: 45670, // Keep mock data for now
      });

      // Note: We no longer update verification requests state
      // since we redirect to the dedicated verification page

      // Update recent users
      setRecentUsers(recentUsersData || []);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch real data from Supabase
  useEffect(() => {
    fetchAdminData();
  }, []);

  // Refresh data when window regains focus (e.g., when returning from verification panel)
  useEffect(() => {
    const handleFocus = () => {
      fetchAdminData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleProductAction = (productId: string, action: string) => {
    console.log(`${action} product ${productId}`);
  };

  // Helper function to format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {currentAdmin.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchAdminData}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={onBack}>
              ← Back to App
            </Button>
          </div>
        </div>

        {/* Key Statistics - Split into 2 rows - ABOVE Quick Actions */}
        <div className="space-y-4 mb-8">
          {/* First row - 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">
                      {loading ? '...' : stats.totalUsers.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {loading ? '...' : stats.pendingVerifications}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold">
                      {loading ? '...' : stats.totalProducts.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Second row - 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Transactions</p>
                    <p className="text-2xl font-bold">{stats.activeTransactions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Flag className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Reported Content</p>
                    <p className="text-2xl font-bold text-red-600">{stats.reportedContent}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Platform Revenue</p>
                    <p className="text-2xl font-bold">${stats.platformRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions - After statistics */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common admin tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => {
                    if (onNavigateToVerification) {
                      onNavigateToVerification();
                    } else {
                      // Fallback to window location if navigation function not provided
                      window.location.href = '/admin-verification';
                    }
                  }}
                >
                  <Shield className="h-6 w-6" />
                  <span className="text-sm">Review Verifications</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                >
                  <Package className="h-6 w-6" />
                  <span className="text-sm">Moderate Products</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                >
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Manage Users</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                >
                  <DollarSign className="h-6 w-6" />
                  <span className="text-sm">View Transactions</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {/* Top Row - Priority Items */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            {/* Verification Requests - Quick Overview */}
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-yellow-600" />
                  Verification Requests
                  <Badge variant="destructive" className="ml-2">
                    {stats.pendingVerifications} pending
                  </Badge>
                </CardTitle>
                <CardDescription>User verification requests requiring review</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Loading verification requests...</div>
                  </div>
                ) : stats.pendingVerifications === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-2xl font-bold text-green-600 mb-2">✓</div>
                    <div className="text-gray-500 mb-4">No pending verification requests</div>
                    <div className="text-sm text-gray-400">
                      All users are verified or no requests submitted
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl font-bold text-yellow-600 mb-2">
                      {stats.pendingVerifications}
                    </div>
                    <div className="text-gray-600 mb-4">
                      {stats.pendingVerifications === 1 ? 'verification request' : 'verification requests'} pending review
                    </div>
                    <Button 
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      onClick={() => {
                        if (onNavigateToVerification) {
                          onNavigateToVerification();
                        } else {
                          // Fallback to window location if navigation function not provided
                          window.location.href = '/admin-verification';
                        }
                      }}
                    >
                      Review Verification Requests
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Users
                </CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Loading recent users...</p>
                    </div>
                  ) : recentUsers.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No recent users</p>
                    </div>
                  ) : (
                    recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{user.name}</p>
                          <p className="text-sm text-gray-600 truncate">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={user.user_type === 'farmer' ? 'default' : 'secondary'} className="text-xs">
                              {user.user_type}
                            </Badge>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getRelativeTime(user.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Shield className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row - Reported Content */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* Reported Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  Reported Content
                </CardTitle>
                <CardDescription>Items requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {reportedProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-gray-600 truncate">by {product.seller}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="destructive" className="text-xs">
                            {product.reportedCount} reports
                          </Badge>
                          <span className="text-sm text-gray-600">${product.price}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => handleProductAction(product.id, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => handleProductAction(product.id, 'remove')}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

    </div>
  );
}