import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
// No StorageDebugPanel needed with Supabase
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
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { products as sampleProducts } from "../data/products";

interface VerificationRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userType: 'farmer' | 'trader' | 'buyer';
  type: 'id' | 'business' | 'buyer'; // New split verification types
  requestType?: 'tier1' | 'tier2' | 'buyer'; // Legacy support
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  adminNotes?: string;
  documents: {
    nationalId?: string | {
      front?: string;
      back?: string;
      status: 'pending' | 'verified' | 'rejected';
    };
    selfieWithId?: string;
    businessLicense?: string | {
      document?: string;
      status: 'pending' | 'verified' | 'rejected';
    };
    taxCertificate?: string;
    bankStatement?: string;
    farmCertification?: {
      document?: string;
      status: 'pending' | 'verified' | 'rejected';
    };
  };
  additionalInfo?: {
    fullName?: string;
    phoneNumber?: string;
    address?: string;
    businessName?: string;
    businessType?: string;
    taxId?: string;
    businessAddress?: string;
    yearsInBusiness?: string;
    employeeCount?: string;
  };
  businessInfo?: {
    businessName?: string;
    businessType?: string;
    businessDescription?: string;
    location?: string;
    registrationNumber?: string;
  };
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
    const loadRequests = () => {
      try {
        const storedRequests = localStorage.getItem('agriconnect-verification-requests');
        if (storedRequests) {
          const parsedRequests = JSON.parse(storedRequests);
          setRequests(parsedRequests);
        }
      } catch (error) {
        console.error('Failed to load verification requests:', error);
      }
    };

    loadRequests();
    // Refresh every 30 seconds to catch new requests
    const interval = setInterval(loadRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRequestTypeLabel = (request: VerificationRequest) => {
    // Handle new split verification system
    if (request.type) {
      switch (request.type) {
        case 'id':
          return 'ID Verification';
        case 'business':
          return 'Business Verification';
        case 'buyer':
          return 'Buyer Verification';
        default:
          return 'Unknown Verification Type';
      }
    }
    
    // Legacy support for old requestType field
    const { requestType, userType } = request;
    switch (requestType) {
      case 'tier1':
        return userType === 'trader' ? 'Tier 1 Trader Verification' : 'Basic Farmer Verification';
      case 'tier2':
        return userType === 'trader' ? 'Tier 2 Business Trader Verification' : 'Business Farmer Verification';
      case 'buyer':
        return 'Buyer Verification';
      default:
        return 'Unknown Verification Type';
    }
  };

  const handleApproveRequest = async (request: VerificationRequest) => {
    setIsProcessing(true);
    try {
      // Update the request status
      const updatedRequest = {
        ...request,
        status: 'approved' as const,
        reviewedAt: new Date().toISOString(),
        reviewedBy: currentAdmin.email,
        reviewNotes: reviewNotes || 'Request approved',
        documents: {
          ...request.documents,
          nationalId: request.documents.nationalId ? {
            ...request.documents.nationalId,
            status: 'verified' as const
          } : undefined,
          businessLicense: request.documents.businessLicense ? {
            ...request.documents.businessLicense,
            status: 'verified' as const
          } : undefined,
          farmCertification: request.documents.farmCertification ? {
            ...request.documents.farmCertification,
            status: 'verified' as const
          } : undefined,
        }
      };

      // Update requests in localStorage
      const updatedRequests = requests.map(r => 
        r.id === request.id ? updatedRequest : r
      );
      localStorage.setItem('agriconnect-verification-requests', JSON.stringify(updatedRequests));
      setRequests(updatedRequests);

      // Update user verification status in demo accounts and main users
      const updateUserVerification = (users: any[], storageKey: string) => {
        const updatedUsers = users.map((account: any) => {
          if (account.id === request.userId || account.email === request.userEmail) {
            const updates: any = { ...account };

            // Handle new split verification system
            if (request.type === 'id') {
              updates.verified = true;
              updates.verificationStatus = 'verified';
              updates.verificationDate = new Date().toISOString();
              updates.verificationSubmitted = false; // Clear the submission flag
              
              // Update personal info from request
              if (request.additionalInfo) {
                if (request.additionalInfo.fullName) updates.name = request.additionalInfo.fullName;
                if (request.additionalInfo.phoneNumber) updates.phone = request.additionalInfo.phoneNumber;
                if (request.additionalInfo.address) updates.location = request.additionalInfo.address;
              }
            } 
            else if (request.type === 'business') {
              updates.businessVerified = true;
              updates.verificationStatus = 'verified';
              updates.verificationDate = new Date().toISOString();
              updates.verificationSubmitted = false; // Clear the submission flag
              updates.verificationDocuments = {
                ...account.verificationDocuments,
                businessLicense: 'verified'
              };
              
              // Update business info from request
              if (request.additionalInfo) {
                if (request.additionalInfo.businessName) updates.businessName = request.additionalInfo.businessName;
                if (request.additionalInfo.businessType) updates.businessType = request.additionalInfo.businessType;
                if (request.additionalInfo.businessAddress) updates.location = request.additionalInfo.businessAddress;
              }
            }
            // Legacy support for old system
            else if (request.requestType) {
              updates.verified = true;
              updates.verificationStatus = 'verified';
              updates.verificationDate = new Date().toISOString();
              updates.verificationSubmitted = false; // Clear the submission flag

              // Update verification documents for tier2/business verification
              if (request.requestType === 'tier2' || request.requestType === 'buyer') {
                updates.verificationDocuments = {
                  ...account.verificationDocuments,
                  businessLicense: 'verified'
                };
              }

              // Update business information if provided
              if (request.businessInfo) {
                updates.businessName = request.businessInfo.businessName || account.businessName;
                updates.businessDescription = request.businessInfo.businessDescription || account.businessDescription;
                updates.businessType = request.businessInfo.businessType || account.businessType;
                if (request.businessInfo.location) {
                  updates.location = request.businessInfo.location;
                }
              }
            }

            return updates;
          }
        return account;
      });
      localStorage.setItem(storageKey, JSON.stringify(updatedUsers));
      return updatedUsers;
    };

    // Update main users only (no demo accounts)
      const mainUsers = JSON.parse(localStorage.getItem('agriconnect-myanmar-users') || '[]');
      const updatedMainUsers = updateUserVerification(mainUsers, 'agriconnect-myanmar-users');

      // Also update the current user if they're logged in and this is their request
      const currentUser = JSON.parse(localStorage.getItem('agriconnect-myanmar-current-user') || 'null');
      if (currentUser && (currentUser.id === request.userId || currentUser.email === request.userEmail)) {
        // Find updated user from main users
        const updatedCurrentUser = updatedMainUsers.find((acc: any) => acc.id === request.userId || acc.email === request.userEmail);
        if (updatedCurrentUser) {
          localStorage.setItem('agriconnect-myanmar-current-user', JSON.stringify(updatedCurrentUser));
        }
      }

      toast.success(`Verification request approved for ${request.userName}`);
      setSelectedRequest(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Failed to approve request:', error);
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
      // Update the request status
      const updatedRequest = {
        ...request,
        status: 'rejected' as const,
        reviewedAt: new Date().toISOString(),
        reviewedBy: currentAdmin.email,
        reviewNotes: reviewNotes,
        documents: {
          ...request.documents,
          nationalId: request.documents.nationalId ? {
            ...request.documents.nationalId,
            status: 'rejected' as const
          } : undefined,
          businessLicense: request.documents.businessLicense ? {
            ...request.documents.businessLicense,
            status: 'rejected' as const
          } : undefined,
          farmCertification: request.documents.farmCertification ? {
            ...request.documents.farmCertification,
            status: 'rejected' as const
          } : undefined,
        }
      };

      // Update requests in localStorage
      const updatedRequests = requests.map(r => 
        r.id === request.id ? updatedRequest : r
      );
      localStorage.setItem('agriconnect-verification-requests', JSON.stringify(updatedRequests));
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

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

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
                <p className="text-2xl font-bold">{requests.filter(r => r.status === 'approved').length}</p>
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
                <p className="text-2xl font-bold">{requests.filter(r => r.status === 'rejected').length}</p>
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

      {/* Requests Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Under Review ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="processed">
            Processed ({processedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="sample-products">
            Sample Products
          </TabsTrigger>
          <TabsTrigger value="storage">
            Storage Management
          </TabsTrigger>
          <TabsTrigger value="debug">
            Storage Debug
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
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
                          {request.userType}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
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
                                
                                {selectedRequest.documents.nationalId && (
                                  <div className="border rounded-lg p-4 space-y-2">
                                    <Label>National ID</Label>
                                    <div className="text-sm text-muted-foreground">
                                      {selectedRequest.documents.nationalId.front && 
                                        <div>✓ Front side uploaded</div>
                                      }
                                      {selectedRequest.documents.nationalId.back && 
                                        <div>✓ Back side uploaded</div>
                                      }
                                      <Badge variant="outline" className="mt-2">
                                        {selectedRequest.documents.nationalId.status}
                                      </Badge>
                                    </div>
                                  </div>
                                )}

                                {selectedRequest.documents.businessLicense && (
                                  <div className="border rounded-lg p-4 space-y-2">
                                    <Label>Business License</Label>
                                    <div className="text-sm text-muted-foreground">
                                      {selectedRequest.documents.businessLicense.document && 
                                        <div>✓ Business license uploaded</div>
                                      }
                                      <Badge variant="outline" className="mt-2">
                                        {selectedRequest.documents.businessLicense.status}
                                      </Badge>
                                    </div>
                                  </div>
                                )}

                                {selectedRequest.documents.farmCertification && (
                                  <div className="border rounded-lg p-4 space-y-2">
                                    <Label>Farm Certification</Label>
                                    <div className="text-sm text-muted-foreground">
                                      {selectedRequest.documents.farmCertification.document && 
                                        <div>✓ Farm certification uploaded</div>
                                      }
                                      <Badge variant="outline" className="mt-2">
                                        {selectedRequest.documents.farmCertification.status}
                                      </Badge>
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
        </TabsContent>

        <TabsContent value="processed" className="space-y-4">
          {processedRequests.length === 0 ? (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                No processed verification requests yet.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              {processedRequests.map((request) => (
                <Card key={request.id} className={
                  request.status === 'approved' 
                    ? 'border-green-200 bg-green-50/50' 
                    : 'border-red-200 bg-red-50/50'
                }>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="font-semibold">{request.userName}</span>
                        </div>
                        <Badge variant="secondary">
                          {request.userType}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <p className="text-muted-foreground">
                        <strong>Type:</strong> {getRequestTypeLabel(request)}
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Reviewed:</strong> {request.reviewedAt ? new Date(request.reviewedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Reviewed by:</strong> {request.reviewedBy || 'N/A'}
                      </p>
                      {request.reviewNotes && (
                        <p className="text-muted-foreground">
                          <strong>Notes:</strong> {request.reviewNotes}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sample-products" className="space-y-4">
          <SampleProductManagement />
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          {/* No StorageMonitor needed with Supabase */}
        </TabsContent>

        <TabsContent value="debug" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            Debug panel removed - using Supabase backend
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}