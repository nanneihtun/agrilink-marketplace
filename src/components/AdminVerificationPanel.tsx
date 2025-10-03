import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
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
  Download,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { products as sampleProducts } from "../data/products";

interface VerificationRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userType: 'farmer' | 'trader' | 'buyer';
  accountType: 'individual' | 'business';
  verificationStatus: 'not_started' | 'in_progress' | 'under_review' | 'verified' | 'rejected';
  verificationSubmitted: boolean;
  verificationDocuments?: {
    idCard?: {
      status?: 'pending' | 'uploaded' | 'verified' | 'rejected';
      name?: string;
      uploadedAt?: string;
      data?: string;
    };
    businessLicense?: {
      status?: 'pending' | 'uploaded' | 'verified' | 'rejected';
      name?: string;
      uploadedAt?: string;
      data?: string;
    };
    selfieWithId?: string;
    taxCertificate?: string;
    bankStatement?: string;
    farmCertification?: {
      status?: 'pending' | 'uploaded' | 'verified' | 'rejected';
      name?: string;
      uploadedAt?: string;
      data?: string;
    };
  };
  businessDetailsCompleted: boolean;
  businessName?: string;
  businessDescription?: string;
  location?: string;
  region?: string;
  phone?: string;
  phoneVerified?: boolean;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  // Additional properties used in the component
  type?: string;
  status?: 'pending' | 'approved' | 'rejected';
  documents?: any;
  businessInfo?: {
    businessName?: string;
    businessDescription?: string;
    location?: string;
    region?: string;
    phone?: string;
    phoneVerified?: boolean;
    businessType?: string;
    registrationNumber?: string;
  };
  adminNotes?: string;
}

// Sample Product Management Component
function SampleProductManagement() {
  const [hiddenProducts, setHiddenProducts] = useState<string[]>([]);
  
  useEffect(() => {
    // Load hidden sample products
    try {
      const hidden = JSON.parse(localStorage.getItem('agriconnect-myanmar-hidden-sample-products') || '[]');
      setHiddenProducts(hidden);
    } catch (error) {
      console.error('Failed to load hidden sample products:', error);
    }
  }, []);
  
  const handleRestoreProduct = (productId: string) => {
    try {
      const updatedHidden = hiddenProducts.filter(id => id !== productId);
      localStorage.setItem('agriconnect-myanmar-hidden-sample-products', JSON.stringify(updatedHidden));
      setHiddenProducts(updatedHidden);
      window.dispatchEvent(new Event('sample-products-changed'));
      toast.success('Sample product restored to marketplace');
    } catch (error) {
      console.error('Failed to restore sample product:', error);
      toast.error('Failed to restore product');
    }
  };
  
  const handleHideProduct = (productId: string) => {
    try {
      const updatedHidden = [...hiddenProducts, productId];
      localStorage.setItem('agriconnect-myanmar-hidden-sample-products', JSON.stringify(updatedHidden));
      setHiddenProducts(updatedHidden);
      window.dispatchEvent(new Event('sample-products-changed'));
      toast.success('Sample product hidden from marketplace');
    } catch (error) {
      console.error('Failed to hide sample product:', error);
      toast.error('Failed to hide product');
    }
  };
  
  const clearAllHidden = () => {
    try {
      localStorage.setItem('agriconnect-myanmar-hidden-sample-products', JSON.stringify([]));
      setHiddenProducts([]);
      window.dispatchEvent(new Event('sample-products-changed'));
      toast.success('All sample products restored to marketplace');
    } catch (error) {
      console.error('Failed to clear hidden products:', error);
      toast.error('Failed to restore products');
    }
  };
  
  const visibleProducts = sampleProducts.filter(product => !hiddenProducts.includes(product.id));
  const hiddenProductDetails = sampleProducts.filter(product => hiddenProducts.includes(product.id));
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Sample Product Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage visibility of sample products in the marketplace
          </p>
        </div>
        {hiddenProducts.length > 0 && (
          <Button variant="outline" onClick={clearAllHidden}>
            Restore All Hidden Products
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visible Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-500" />
              Visible Products ({visibleProducts.length})
            </CardTitle>
            <CardDescription>
              These sample products are currently shown in the marketplace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {visibleProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.price.toLocaleString()} MMK • {product.sellerName}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleHideProduct(product.id)}
                >
                  Hide
                </Button>
              </div>
            ))}
            {visibleProducts.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                All sample products are currently hidden
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Hidden Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Hidden Products ({hiddenProducts.length})
            </CardTitle>
            <CardDescription>
              These sample products are hidden from the marketplace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {hiddenProductDetails.map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50/50">
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.price.toLocaleString()} MMK • {product.sellerName}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestoreProduct(product.id)}
                >
                  Restore
                </Button>
              </div>
            ))}
            {hiddenProducts.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No sample products are currently hidden
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Alert>
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          <strong>Note:</strong> Sample products are demonstration data included with the platform. 
          Hiding them removes them from the marketplace view but they can be restored at any time. 
          This feature is useful for customizing the initial product display for specific deployments.
        </AlertDescription>
      </Alert>
    </div>
  );
}

interface AdminVerificationPanelProps {
  currentAdmin: any;
  onBack: () => void;
}

export function AdminVerificationPanel({ currentAdmin, onBack }: AdminVerificationPanelProps) {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load verification requests from localStorage
  useEffect(() => {
    const loadRequests = async () => {
      try {
        console.log('🔍 Loading verification requests from Supabase...');
        
        // First try a simple query to test connection
        console.log('🔍 Testing basic Supabase connection...');
        const { data: testData, error: testError } = await supabase
          .from('users')
          .select('id, email, name, verification_status')
          .limit(5);

        if (testError) {
          console.error('❌ Basic connection test failed:', testError);
          throw testError;
        }

        console.log('✅ Basic connection test successful:', testData);
        
        // Debug: Check what verification_status values exist
        const { data: statusCheck } = await supabase
          .from('users')
          .select('verification_status')
          .limit(10);
        console.log('🔍 Sample verification_status values:', statusCheck?.map(u => u.verification_status));

        // Try to fetch users with verification requests
        let users, error;
        
        try {
          const result = await supabase
            .from('users')
            .select(`
              id,
              email,
              name,
              user_type,
              account_type,
              verification_status,
              verification_documents,
              business_name,
              business_description,
              location,
              region,
              phone,
              phone_verified,
              created_at,
              updated_at
            `)
            .in('verification_status', ['pending', 'under_review', 'verified', 'rejected'])
            .neq('user_type', 'admin')
            .order('updated_at', { ascending: false });
          
          users = result.data;
          error = result.error;
        } catch (filterError) {
          console.log('⚠️ Filter query failed, trying fallback approach...', filterError);
          
          // Fallback: fetch all users and filter in JavaScript
          const fallbackResult = await supabase
            .from('users')
            .select(`
              id,
              email,
              name,
              user_type,
              account_type,
              verification_status,
              verification_documents,
              business_name,
              business_description,
              location,
              region,
              phone,
              phone_verified,
              created_at,
              updated_at
            `)
            .order('updated_at', { ascending: false });
          
          users = fallbackResult.data?.filter(user => 
            user.verification_status && 
            user.verification_status !== 'not_started' &&
            ['pending', 'under_review', 'verified', 'rejected'].includes(user.verification_status) &&
            user.user_type !== 'admin'
          ) || [];
          error = fallbackResult.error;
        }

        if (error) {
          console.error('❌ Error fetching verification requests:', error);
          console.error('❌ Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          toast.error(`Failed to load verification requests: ${error.message}`);
          return;
        }

        console.log('📊 Raw users data:', users);
        
        // Debug verification documents for each user
        users.forEach((user, index) => {
          console.log(`🔍 User ${index + 1} verification_documents:`, user.verification_documents);
          console.log(`🔍 User ${index + 1} verification_documents type:`, typeof user.verification_documents);
          console.log(`🔍 User ${index + 1} verification_documents keys:`, user.verification_documents ? Object.keys(user.verification_documents) : 'null/undefined');
        });

        // Transform database data to VerificationRequest format
        const transformedRequests: VerificationRequest[] = users.map(user => ({
          id: user.id,
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          userType: user.user_type as 'farmer' | 'trader' | 'buyer',
          accountType: user.account_type as 'individual' | 'business',
          verificationStatus: user.verification_status as 'not_started' | 'in_progress' | 'under_review' | 'verified' | 'rejected',
          verificationSubmitted: user.verification_status !== 'not_started', // True if verification has been started
          status: user.verification_status === 'verified' ? 'approved' : 
                  user.verification_status === 'rejected' ? 'rejected' : 'pending',
          verificationDocuments: user.verification_documents || {},
          businessDetailsCompleted: false, // Default value since column doesn't exist
          businessName: user.business_name,
          businessDescription: user.business_description,
          location: user.location,
          region: user.region,
          phone: user.phone,
          phoneVerified: user.phone_verified,
          submittedAt: user.updated_at || user.created_at,
          reviewedAt: user.verification_status === 'verified' || user.verification_status === 'rejected' ? user.updated_at : undefined,
          reviewedBy: 'admin', // TODO: Track actual reviewer
          reviewNotes: '',
          adminNotes: ''
        }));

        console.log('✅ Transformed verification requests:', transformedRequests);
        
        // Debug the verification documents in transformed requests
        transformedRequests.forEach((request, index) => {
          console.log(`🔍 Transformed request ${index + 1} verificationDocuments:`, request.verificationDocuments);
          console.log(`🔍 Transformed request ${index + 1} verificationDocuments keys:`, Object.keys(request.verificationDocuments || {}));
        });
        
        setRequests(transformedRequests);
      } catch (error) {
        console.error('❌ Failed to load verification requests:', error);
        toast.error('Failed to load verification requests');
      }
    };

    loadRequests();
    // Refresh every 30 seconds to catch new requests
    const interval = setInterval(loadRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-500';
      case 'under_review': return 'bg-yellow-500';
      case 'verified': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'not_started': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRequestTypeLabel = (request: VerificationRequest) => {
    const { userType, accountType, verificationStatus } = request;
    
    // Determine verification type based on user type and account type
    if (userType === 'buyer') {
      return 'Buyer Verification';
    } else if (userType === 'farmer') {
      return accountType === 'business' ? 'Business Farmer Verification' : 'Individual Farmer Verification';
    } else if (userType === 'trader') {
      return accountType === 'business' ? 'Business Trader Verification' : 'Individual Trader Verification';
    }
    
    // Fallback based on verification status
    switch (verificationStatus) {
      case 'in_progress':
        return 'Verification In Progress';
      case 'under_review':
        return 'Verification Under Review';
      case 'verified':
        return 'Verified Account';
      case 'rejected':
        return 'Verification Rejected';
      default:
        return 'Verification Request';
    }
  };

  const handleApproveRequest = async (request: VerificationRequest) => {
    setIsProcessing(true);
    try {
      console.log('✅ Approving verification request:', request.id);
      
      // Update user verification status in database
      const { error } = await supabase
        .from('users')
        .update({
          verification_status: 'verified',
          verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.userId);

      if (error) {
        console.error('❌ Error updating user verification status:', error);
        throw error;
      }

      // Update local state
      const updatedRequests = requests.map(r => 
        r.id === request.id ? {
          ...r,
          verificationStatus: 'verified' as const,
          reviewedAt: new Date().toISOString(),
          reviewedBy: currentAdmin.email,
          reviewNotes: reviewNotes || 'Request approved'
        } : r
      );
      setRequests(updatedRequests);

      toast.success(`Verification request approved for ${request.userName}`);
      setSelectedRequest(null);
      setReviewNotes('');
    } catch (error) {
      console.error('❌ Failed to approve request:', error);
      toast.error('Failed to approve verification request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectRequest = async (request: VerificationRequest) => {
    if (!reviewNotes.trim()) {
      toast.error('Please provide rejection reason in review notes');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('❌ Rejecting verification request:', request.id);
      
      // Update user verification status in database
      const { error } = await supabase
        .from('users')
        .update({
          verification_status: 'rejected',
          verified: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.userId);

      if (error) {
        console.error('❌ Error updating user verification status:', error);
        throw error;
      }

      // Update local state
      const updatedRequests = requests.map(r => 
        r.id === request.id ? {
          ...r,
          verificationStatus: 'rejected' as const,
          reviewedAt: new Date().toISOString(),
          reviewedBy: currentAdmin.email,
          reviewNotes: reviewNotes
        } : r
      );
      setRequests(updatedRequests);

      // Update user verification status in main users
      const mainUsers = JSON.parse(localStorage.getItem('agriconnect-myanmar-users') || '[]');
      const updatedUsers = mainUsers.map((user: any) => {
        if (user.id === request.userId) {
          const updates: any = {
            ...user,
            verificationStatus: 'rejected',
            verificationRejectedAt: new Date().toISOString(),
            verificationRejectionReason: reviewNotes,
            verificationSubmitted: false // Clear the submission flag
          };
          
          // Reset verification flags based on request type
          if (request.type === 'id') {
            updates.verified = false;
          } else if (request.type === 'business') {
            updates.businessVerified = false;
          }
          
          return updates;
        }
        return user;
      });

      localStorage.setItem('agriconnect-myanmar-users', JSON.stringify(updatedUsers));

      // Also update the current user if they're logged in and this is their request
      const currentUser = JSON.parse(localStorage.getItem('agriconnect-myanmar-current-user') || 'null');
      if (currentUser && (currentUser.id === request.userId || currentUser.email === request.userEmail)) {
        // Find updated user from main users
        const updatedCurrentUser = updatedUsers.find((acc: any) => acc.id === request.userId || acc.email === request.userEmail);
        if (updatedCurrentUser) {
          localStorage.setItem('agriconnect-myanmar-current-user', JSON.stringify(updatedCurrentUser));
        }
      }

      toast.success(`Verification request rejected for ${request.userName}`);
      setSelectedRequest(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Failed to reject request:', error);
      toast.error('Failed to reject verification request');
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingRequests = requests.filter(r => 
    r.verificationStatus === 'under_review'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Verification Panel</h1>
          <p className="text-muted-foreground">
            Review and approve user verification requests
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Back to Admin Panel
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{requests.filter(r => r.verificationStatus === 'verified').length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{requests.filter(r => r.verificationStatus === 'rejected').length}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{requests.length}</p>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Verification Requests */}
      <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Alert>
              <Clock className="w-4 h-4" />
              <AlertDescription>
                No pending verification requests at the moment.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="border-yellow-200 bg-yellow-50/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="font-semibold">{request.userName}</span>
                        </div>
                        <Badge variant="secondary">
                          {request.userType || 'Unknown'}
                        </Badge>
                        <Badge className={getStatusColor(request.status || 'pending')}>
                          {request.status || 'pending'}
                        </Badge>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Verification Request Review
                            </DialogTitle>
                            <DialogDescription>
                              {getRequestTypeLabel(request)} for {request.userName}
                            </DialogDescription>
                          </DialogHeader>

                          {selectedRequest && (
                            <div className="space-y-6">
                              {/* User Information */}
                              <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  User Information
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <Label>Name</Label>
                                    <p className="text-foreground">{selectedRequest.userName}</p>
                                  </div>
                                  <div>
                                    <Label>Email</Label>
                                    <p className="text-foreground">{selectedRequest.userEmail}</p>
                                  </div>
                                  <div>
                                    <Label>User Type</Label>
                                    <p className="text-foreground">{selectedRequest.userType}</p>
                                  </div>
                                  <div>
                                    <Label>Request Type</Label>
                                    <p className="text-foreground">
                                      {getRequestTypeLabel(selectedRequest)}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Business Information */}
                              {selectedRequest.businessInfo && (
                                <div className="space-y-4">
                                  <h3 className="font-semibold flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    Business Information
                                  </h3>
                                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    {selectedRequest.businessInfo.businessName && (
                                      <div>
                                        <Label>Business Name</Label>
                                        <p className="text-foreground">{selectedRequest.businessInfo.businessName}</p>
                                      </div>
                                    )}
                                    {selectedRequest.businessInfo.businessType && (
                                      <div>
                                        <Label>Business Type</Label>
                                        <p className="text-foreground">{selectedRequest.businessInfo.businessType}</p>
                                      </div>
                                    )}
                                    {selectedRequest.businessInfo.location && (
                                      <div>
                                        <Label>Location</Label>
                                        <p className="text-foreground">{selectedRequest.businessInfo.location}</p>
                                      </div>
                                    )}
                                    {selectedRequest.businessInfo.registrationNumber && (
                                      <div>
                                        <Label>Registration Number</Label>
                                        <p className="text-foreground">{selectedRequest.businessInfo.registrationNumber}</p>
                                      </div>
                                    )}
                                  </div>
                                  {selectedRequest.businessInfo.businessDescription && (
                                    <div>
                                      <Label>Business Description</Label>
                                      <p className="text-foreground text-sm mt-1">
                                        {selectedRequest.businessInfo.businessDescription}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Documents */}
                              <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  Submitted Documents
                                </h3>
                                
                                {/* Debug: Show verification documents structure */}
                                {process.env.NODE_ENV === 'development' && (
                                  <div className="bg-gray-100 p-2 rounded text-xs">
                                    <strong>Debug - Verification Documents:</strong>
                                    <pre>{JSON.stringify(selectedRequest.verificationDocuments, null, 2)}</pre>
                                  </div>
                                )}
                                
                                {/* Debug: Show raw verification documents data */}
                                {process.env.NODE_ENV === 'development' && (
                                  <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
                                    <strong>Debug - Raw verificationDocuments:</strong>
                                    <pre>{JSON.stringify(selectedRequest.verificationDocuments, null, 2)}</pre>
                                  </div>
                                )}
                                
                                {selectedRequest.verificationDocuments?.idCard && (
                                  <div className="border rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <Label className="text-base font-medium">National ID</Label>
                                      <Badge variant="outline">
                                        {selectedRequest.verificationDocuments?.idCard?.status || 'uploaded'}
                                      </Badge>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <div className="flex items-center space-x-2">
                                          <FileText className="h-4 w-4 text-blue-600" />
                                          <div>
                                            <span className="text-sm font-medium">ID Document</span>
                                            <div className="text-xs text-muted-foreground">
                                              {selectedRequest.verificationDocuments?.idCard?.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              Uploaded: {selectedRequest.verificationDocuments?.idCard?.uploadedAt ? 
                                                new Date(selectedRequest.verificationDocuments.idCard.uploadedAt).toLocaleString() : 
                                                'Unknown'
                                              }
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex space-x-1">
                                          {selectedRequest.verificationDocuments?.idCard?.data && (
                                            <Button 
                                              size="sm" 
                                              variant="outline" 
                                              className="h-8 w-8 p-0"
                                              onClick={() => {
                                                const newWindow = window.open();
                                                if (newWindow) {
                                                  newWindow.document.write(`
                                                    <html>
                                                      <head><title>ID Document</title></head>
                                                      <body style="margin:0; padding:20px; text-align:center;">
                                                        <img src="${selectedRequest.verificationDocuments?.idCard?.data}" style="max-width:100%; height:auto;" />
                                                      </body>
                                                    </html>
                                                  `);
                                                }
                                              }}
                                            >
                                              <Eye className="h-4 w-4" />
                                            </Button>
                                          )}
                                          {selectedRequest.verificationDocuments?.idCard?.data && (
                                            <Button 
                                              size="sm" 
                                              variant="outline" 
                                              className="h-8 w-8 p-0"
                                              onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = selectedRequest.verificationDocuments?.idCard?.data || '';
                                                link.download = selectedRequest.verificationDocuments?.idCard?.name || 'id-document';
                                                link.click();
                                              }}
                                            >
                                              <Download className="h-4 w-4" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {selectedRequest.verificationDocuments?.businessLicense && (
                                  <div className="border rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <Label className="text-base font-medium">Business License</Label>
                                      <Badge variant="outline">
                                        {selectedRequest.verificationDocuments?.businessLicense?.status || 'uploaded'}
                                      </Badge>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <div className="flex items-center space-x-2">
                                          <FileText className="h-4 w-4 text-green-600" />
                                          <div>
                                            <span className="text-sm font-medium">Business License Document</span>
                                            <div className="text-xs text-muted-foreground">
                                              {selectedRequest.verificationDocuments?.businessLicense?.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              Uploaded: {selectedRequest.verificationDocuments?.businessLicense?.uploadedAt ? 
                                                new Date(selectedRequest.verificationDocuments.businessLicense.uploadedAt).toLocaleString() : 
                                                'Unknown'
                                              }
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex space-x-1">
                                          {selectedRequest.verificationDocuments?.businessLicense?.data && (
                                            <Button 
                                              size="sm" 
                                              variant="outline" 
                                              className="h-8 w-8 p-0"
                                              onClick={() => {
                                                const newWindow = window.open();
                                                if (newWindow) {
                                                  newWindow.document.write(`
                                                    <html>
                                                      <head><title>Business License</title></head>
                                                      <body style="margin:0; padding:20px; text-align:center;">
                                                        <img src="${selectedRequest.verificationDocuments?.businessLicense?.data}" style="max-width:100%; height:auto;" />
                                                      </body>
                                                    </html>
                                                  `);
                                                }
                                              }}
                                            >
                                              <Eye className="h-4 w-4" />
                                            </Button>
                                          )}
                                          {selectedRequest.verificationDocuments?.businessLicense?.data && (
                                            <Button 
                                              size="sm" 
                                              variant="outline" 
                                              className="h-8 w-8 p-0"
                                              onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = selectedRequest.verificationDocuments?.businessLicense?.data || '';
                                                link.download = selectedRequest.verificationDocuments?.businessLicense?.name || 'business-license';
                                                link.click();
                                              }}
                                            >
                                              <Download className="h-4 w-4" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {selectedRequest.verificationDocuments?.farmCertification && (
                                  <div className="border rounded-lg p-4 space-y-2">
                                    <Label>Farm Certification</Label>
                                    <div className="text-sm text-muted-foreground">
                                      {selectedRequest.verificationDocuments?.farmCertification?.data && 
                                        <div>✓ Farm certification uploaded</div>
                                      }
                                      <Badge variant="outline" className="mt-2">
                                        {selectedRequest.verificationDocuments?.farmCertification?.status || 'pending'}
                                      </Badge>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Fallback when no documents are present */}
                                {!selectedRequest.verificationDocuments?.idCard && 
                                 !selectedRequest.verificationDocuments?.businessLicense && 
                                 !selectedRequest.verificationDocuments?.farmCertification && (
                                  <div className="border rounded-lg p-6 text-center text-muted-foreground">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <h3 className="font-semibold text-lg mb-2">No Documents Uploaded</h3>
                                    <p className="text-sm mb-3">This user has requested verification but hasn't uploaded any documents yet.</p>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left">
                                      <p className="text-sm text-yellow-800">
                                        <strong>Note:</strong> This appears to be a system issue. Users should not be able to request verification without uploading required documents.
                                      </p>
                                    </div>
                                    <div className="mt-4 space-y-2 text-sm">
                                      <p><strong>Required for Individual Accounts:</strong> National ID (front & back)</p>
                                      <p><strong>Required for Business Accounts:</strong> National ID + Business License</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <Separator />

                              {/* Review Actions */}
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="reviewNotes">Review Notes</Label>
                                  <Textarea
                                    id="reviewNotes"
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    placeholder="Add notes about your decision..."
                                    className="mt-2"
                                  />
                                </div>

                                <div className="flex gap-3">
                                  <Button
                                    onClick={() => handleApproveRequest(selectedRequest)}
                                    disabled={isProcessing}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve Request
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleRejectRequest(selectedRequest)}
                                    disabled={isProcessing || !reviewNotes.trim()}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject Request
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <p className="text-muted-foreground">
                        <strong>Type:</strong> {getRequestTypeLabel(request)}
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Submitted:</strong> {new Date(request.submittedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Email:</strong> {request.userEmail}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}