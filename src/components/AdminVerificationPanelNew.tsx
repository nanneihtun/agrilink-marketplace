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
  };
  businessInfo?: {
    businessName?: string;
    businessDescription?: string;
    location?: string;
    region?: string;
  };
  phoneVerified: boolean;
  submittedAt: string;
  type: string;
  status: string;
  documents: any;
  businessType: string;
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

  // Load verification requests from database
  useEffect(() => {
    const loadRequests = async () => {
      try {
        const { data: requests, error } = await supabase
          .from('verification_requests')
          .select(`
            id,
            user_id,
            user_email,
            user_name,
            user_type,
            account_type,
            request_type,
            status,
            submitted_at,
            reviewed_at,
            reviewed_by,
            verification_documents,
            business_info,
            phone_verified,
            admin_notes,
            created_at,
            updated_at
          `)
          .order('submitted_at', { ascending: false });

        if (error) {
          console.error('❌ Error fetching verification requests:', error);
          throw error;
        }

        // Show all requests (pending, approved, rejected) for admin review
        const allRequests = requests || [];

        // Transform database data to component format (all requests)
        const transformedRequests: VerificationRequest[] = allRequests.map(req => ({
          id: req.id,
          userId: req.user_id,
          userEmail: req.user_email,
          userName: req.user_name,
          userType: req.user_type,
          accountType: req.account_type,
          verificationStatus: req.status === 'under_review' ? 'under_review' : 
                             req.status === 'approved' ? 'verified' : 
                             req.status === 'rejected' ? 'rejected' : 'under_review',
          verificationSubmitted: true, // All records in this table are submitted
          verificationDocuments: req.verification_documents || {},
          businessInfo: req.business_info || {},
          phoneVerified: req.phone_verified,
          submittedAt: req.submitted_at,
          type: req.account_type === 'business' ? 'Business Account' : 'Individual Account',
          status: req.status,
          documents: req.verification_documents || {},
          businessType: req.account_type
        }));

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

  const handleApprove = async (requestId: string) => {
    setIsProcessing(true);
    try {
      // Check admin user's actual database record
      const { data: adminCheck, error: adminError } = await supabase
        .from('users')
        .select('id, email, user_type, name')
        .eq('id', currentAdmin.id)
        .single();
      
      // Update verification request status
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: currentAdmin.id,
          admin_notes: reviewNotes || 'Approved by admin'
        })
        .eq('id', requestId);

      if (requestError) {
        throw requestError;
      }

        // Update user verification status
        const request = requests.find(r => r.id === requestId);
        if (request) {
          // First, let's check if the user exists in the database
          const { data: userCheck, error: checkError } = await supabase
            .from('users')
            .select('id, email, verification_status, verified')
            .eq('id', request.userId)
            .single();
          
          if (checkError) {
            console.error('❌ User not found in database:', checkError);
            return;
          }
        
        // Try to update user verification status
        // Note: This might fail due to RLS policies, so we'll handle it gracefully
        const { data: updateData, error: userError } = await supabase
          .from('users')
          .update({
            verification_status: 'verified',
            verified: true,
            verified_at: new Date().toISOString()
          })
          .eq('id', request.userId)
          .select('id, email, verification_status, verified, verified_at');

        if (userError) {
          console.error('❌ Error updating user status:', userError);
          console.log('⚠️ This is likely due to RLS policies - admin cannot update other users directly');
        }
      } else {
        console.error('❌ Request not found for ID:', requestId);
        console.error('❌ Available requests:', requests.map(r => ({ id: r.id, userId: r.userId })));
      }

      // Refresh requests from database to get updated counts
      const loadRequests = async () => {
        try {
          const { data: requests, error } = await supabase
            .from('verification_requests')
            .select(`
              id,
              user_id,
              user_email,
              user_name,
              user_type,
              account_type,
              request_type,
              status,
              submitted_at,
              reviewed_at,
              reviewed_by,
              verification_documents,
              business_info,
              phone_verified,
              admin_notes,
              created_at,
              updated_at
            `)
            .order('submitted_at', { ascending: false });

          if (error) throw error;

          const transformedRequests: VerificationRequest[] = (requests || []).map(req => ({
            id: req.id,
            userId: req.user_id,
            userEmail: req.user_email,
            userName: req.user_name,
            userType: req.user_type,
            accountType: req.account_type,
            verificationStatus: req.status === 'under_review' ? 'under_review' : 
                               req.status === 'approved' ? 'verified' : 
                               req.status === 'rejected' ? 'rejected' : 'under_review',
            verificationSubmitted: true,
            verificationDocuments: req.verification_documents || {},
            businessInfo: req.business_info || {},
            phoneVerified: req.phone_verified,
            submittedAt: req.submitted_at,
            type: req.account_type === 'business' ? 'Business Account' : 'Individual Account',
            status: req.status,
            documents: req.verification_documents || {},
            businessType: req.account_type
          }));

          setRequests(transformedRequests);
        } catch (error) {
          console.error('❌ Failed to refresh requests:', error);
        }
      };

      // Refresh the requests list to update counts
      await loadRequests();

      setSelectedRequest(null);
      setReviewNotes('');
      toast.success('Verification request approved');
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (requestId: string) => {
    setIsProcessing(true);
    try {
      // Update verification request status
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: currentAdmin.id,
          admin_notes: reviewNotes || 'Rejected by admin'
        })
        .eq('id', requestId);

      if (requestError) {
        throw requestError;
      }

      // Update user verification status
      const request = requests.find(r => r.id === requestId);
      if (request) {
        const { error: userError } = await supabase
          .from('users')
          .update({
            verification_status: 'rejected',
            verified: false
          })
          .eq('id', request.userId);

        if (userError) {
          console.error('Error updating user status:', userError);
        }
      }

      // Refresh requests
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, verificationStatus: 'rejected', status: 'rejected' }
          : req
      ));

      setSelectedRequest(null);
      setReviewNotes('');
      toast.success('Verification request rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'under_review':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>;
      case 'approved':
      case 'verified':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getAccountTypeIcon = (accountType: string) => {
    return accountType === 'business' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />;
  };

  const pendingRequests = requests.filter(r => r.verificationStatus === 'under_review');
  const processedRequests = requests.filter(r => r.verificationStatus !== 'under_review');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Verification Requests</h2>
          <p className="text-gray-600">Review and manage user verification requests</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          ← Back to Dashboard
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{requests.filter(r => r.verificationStatus === 'verified').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{requests.filter(r => r.verificationStatus === 'rejected').length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Review ({pendingRequests.length})
            </CardTitle>
            <CardDescription>
              Verification requests awaiting admin review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getAccountTypeIcon(request.accountType)}
                      <div>
                        <h3 className="font-medium text-gray-900">{request.userName}</h3>
                        <p className="text-sm text-gray-600">{request.userEmail}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(request.verificationStatus)}
                          <span className="text-xs text-gray-500">
                            {new Date(request.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
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
                          <DialogTitle>Review Verification Request</DialogTitle>
                          <DialogDescription>
                            Review documents and information for {request.userName}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          {/* User Information */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">User Information</Label>
                              <div className="mt-2 space-y-2">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm">{request.userName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">Email:</span>
                                  <span className="text-sm">{request.userEmail}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">Type:</span>
                                  <span className="text-sm">{request.type}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">Phone Verified:</span>
                                  <span className="text-sm">{request.phoneVerified ? 'Yes' : 'No'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Business Information */}
                            {request.businessInfo && (
                              <div>
                                <Label className="text-sm font-medium">Business Information</Label>
                                <div className="mt-2 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm">{request.businessInfo.businessName}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm">{request.businessInfo.location}</span>
                                  </div>
                                  <p className="text-sm text-gray-600">{request.businessInfo.businessDescription}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <Separator />

                          {/* Documents */}
                          <div>
                            <Label className="text-sm font-medium">Uploaded Documents</Label>
                            <div className="mt-2 space-y-3">
                              {request.verificationDocuments?.idCard && (
                                <div className="border rounded-lg p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-blue-600" />
                                      <span className="text-sm font-medium">ID Card</span>
                                      <Badge variant="outline" className="text-xs">
                                        {request.verificationDocuments.idCard.status}
                                      </Badge>
                                    </div>
                                    <div className="flex gap-2">
                                      <div className="text-xs text-gray-500">
                                        {request.verificationDocuments.idCard.name}
                                      </div>
                                      {request.verificationDocuments.idCard.data ? (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = request.verificationDocuments?.idCard?.data || '';
                                            link.download = request.verificationDocuments?.idCard?.name || 'id-card';
                                            link.click();
                                          }}
                                        >
                                          <Download className="w-3 h-3 mr-1" />
                                          Download
                                        </Button>
                                      ) : (
                                        <div className="text-xs text-gray-400">
                                          File content not stored
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Uploaded: {request.verificationDocuments.idCard.uploadedAt ? 
                                      new Date(request.verificationDocuments.idCard.uploadedAt).toLocaleString() : 'Unknown'}
                                  </p>
                                </div>
                              )}

                              {request.verificationDocuments?.businessLicense && (
                                <div className="border rounded-lg p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-green-600" />
                                      <span className="text-sm font-medium">Business License</span>
                                      <Badge variant="outline" className="text-xs">
                                        {request.verificationDocuments.businessLicense.status}
                                      </Badge>
                                    </div>
                                    <div className="flex gap-2">
                                      <div className="text-xs text-gray-500">
                                        {request.verificationDocuments.businessLicense.name}
                                      </div>
                                      {request.verificationDocuments.businessLicense.data ? (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = request.verificationDocuments?.businessLicense?.data || '';
                                            link.download = request.verificationDocuments?.businessLicense?.name || 'business-license';
                                            link.click();
                                          }}
                                        >
                                          <Download className="w-3 h-3 mr-1" />
                                          Download
                                        </Button>
                                      ) : (
                                        <div className="text-xs text-gray-400">
                                          File content not stored
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Uploaded: {request.verificationDocuments.businessLicense.uploadedAt ? 
                                      new Date(request.verificationDocuments.businessLicense.uploadedAt).toLocaleString() : 'Unknown'}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <Separator />

                          {/* Admin Actions */}
                          <div>
                            <Label htmlFor="admin-notes" className="text-sm font-medium">Admin Notes (Optional)</Label>
                            <Textarea
                              id="admin-notes"
                              placeholder="Add notes about this verification request..."
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              className="mt-2"
                            />
                          </div>

                          <div className="flex justify-end gap-3">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest(null);
                                setReviewNotes('');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleReject(request.id)}
                              disabled={isProcessing}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              onClick={() => handleApprove(request.id)}
                              disabled={isProcessing}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Processed Requests ({processedRequests.length})
            </CardTitle>
            <CardDescription>
              Previously reviewed verification requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processedRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getAccountTypeIcon(request.accountType)}
                      <div>
                        <h3 className="font-medium text-gray-900">{request.userName}</h3>
                        <p className="text-sm text-gray-600">{request.userEmail}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(request.verificationStatus)}
                          <span className="text-xs text-gray-500">
                            {new Date(request.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {requests.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Verification Requests</h3>
            <p className="text-gray-600">No verification requests have been submitted yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
