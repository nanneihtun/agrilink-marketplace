import React, { useState, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { PhoneVerification } from "./PhoneVerification";
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, 
  CheckCircle, 
  Phone, 
  FileText, 
  Building,
  ChevronRight,
  ChevronLeft,
  Edit,
  Shield,
  X,
  Eye
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  userType: 'farmer' | 'trader' | 'buyer' | 'admin';
  accountType?: 'individual' | 'business';
  location?: string;
  phone?: string;
  phoneVerified?: boolean;
  verified?: boolean;
  businessName?: string;
  businessDescription?: string;
  businessLicenseNumber?: string;
  verificationStatus?: 'pending' | 'under_review' | 'verified' | 'rejected';
  verificationDocuments?: {
    idCard?: {
      status?: 'pending' | 'uploaded' | 'under_review' | 'verified' | 'rejected';
      name?: string;
      size?: number;
      type?: string;
      uploadedAt?: string;
      data?: string;
    };
    businessLicense?: {
      status?: 'pending' | 'uploaded' | 'under_review' | 'verified' | 'rejected';
      name?: string;
      size?: number;
      type?: string;
      uploadedAt?: string;
      data?: string;
    };
    farmCertification?: {
      status?: 'pending' | 'uploaded' | 'under_review' | 'verified' | 'rejected';
      name?: string;
      size?: number;
      type?: string;
      uploadedAt?: string;
      data?: string;
    };
  };
  agriLinkVerificationRequested?: boolean;
  agriLinkVerificationRequestedAt?: string;
  agriLinkVerificationDate?: string;
  verificationSubmittedAt?: string;
  phoneVerificationDate?: string;
}

interface AccountTypeVerificationProps {
  currentUser: User;
  onClose: () => void;
  onUpdate: (updates: Partial<User>) => Promise<void>;
}

export function AccountTypeVerification({ currentUser, onClose, onUpdate }: AccountTypeVerificationProps) {
  // Initialize uploaded documents from current user state
  const [uploadedDocuments, setUploadedDocuments] = useState<{[key: string]: { file: File | null, url: string, name: string, verified: boolean, status?: string }}>(() => {
    const documents: any = {};
    
    
    // Restore from user's verification documents if they exist
    if ((currentUser as any).verificationDocuments) {
      const userDocs = (currentUser as any).verificationDocuments;
      
      // Restore ID Card - check if it's an object with status
      if (userDocs.idCard && typeof userDocs.idCard === 'object' && userDocs.idCard.status && userDocs.idCard.status !== 'pending') {
        documents.idCard = {
          file: null,
          url: '', // We can't restore the file URL, but we know it was uploaded
          name: userDocs.idCard.name || 'ID Card Document',
          verified: userDocs.idCard.status === 'verified',
          status: userDocs.idCard.status
        };
      }
      
      // Restore Business License - check if it's an object with status
      if (userDocs.businessLicense && typeof userDocs.businessLicense === 'object' && userDocs.businessLicense.status && userDocs.businessLicense.status !== 'pending') {
        documents.businessLicense = {
          file: null,
          url: '',
          name: userDocs.businessLicense.name || 'Business License Document',
          verified: userDocs.businessLicense.status === 'verified',
          status: userDocs.businessLicense.status
        };
      }
    }
    return documents;
  });
  

  // Sync uploadedDocuments state when currentUser.verificationDocuments changes
  useEffect(() => {
    const userDocs = (currentUser as any).verificationDocuments;
    if (userDocs) {
      setUploadedDocuments(prev => {
        const updated = { ...prev };
        
        // Sync ID Card status
        if (userDocs.idCard && typeof userDocs.idCard === 'object' && userDocs.idCard.status && userDocs.idCard.status !== 'pending' && !prev.idCard) {
          updated.idCard = {
            file: null,
            url: '',
            name: userDocs.idCard.name || 'ID Card Document',
            verified: userDocs.idCard.status === 'verified',
            status: userDocs.idCard.status
          };
        }
        
        // Sync Business License status  
        if (userDocs.businessLicense && typeof userDocs.businessLicense === 'object' && userDocs.businessLicense.status && userDocs.businessLicense.status !== 'pending' && !prev.businessLicense) {
          updated.businessLicense = {
            file: null,
            url: '',
            name: userDocs.businessLicense.name || 'Business License Document',
            verified: userDocs.businessLicense.status === 'verified',
            status: userDocs.businessLicense.status
          };
        }
        
        return updated;
      });
    }
  }, [currentUser.verificationDocuments]);
  
  
  // Business form state
  const [businessForm, setBusinessForm] = useState({
    businessName: currentUser.businessName || '',
    businessDescription: currentUser.businessDescription || '',
    businessLicenseNumber: currentUser.businessLicenseNumber || ''
  });
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  
  // Sync business form state when currentUser business info changes
  useEffect(() => {
    setBusinessForm({
      businessName: currentUser.businessName || '',
      businessDescription: currentUser.businessDescription || '',
      businessLicenseNumber: currentUser.businessLicenseNumber || ''
    });
  }, [currentUser.businessName, currentUser.businessDescription, currentUser.businessLicenseNumber]);
  
  // Initialize AgriLink verification state from user data
  const [agriLinkVerificationRequested, setAgriLinkVerificationRequested] = useState(() => {
    console.log('🔄 Initializing AgriLink verification state');
    console.log('📋 User agriLinkVerificationRequested:', (currentUser as any).agriLinkVerificationRequested);
    console.log('📋 User verified:', currentUser.verified);
    
    // Check if AgriLink verification was already requested or completed
    const userRequested = (currentUser as any).agriLinkVerificationRequested;
    const isVerified = currentUser.verified;
    
    console.log('✅ AgriLink verification state:', userRequested || isVerified ? 'true' : 'false');
    return userRequested || isVerified;
  });
  
  const [showSuccessMessage, setShowSuccessMessage] = useState(() => {
    // Show success message if verification was requested but user is still under review
    const hasRequestedVerification = (currentUser as any).agriLinkVerificationRequested;
    const isUnderReview = currentUser.verificationStatus === 'under_review';
    const isNotYetVerified = !currentUser.verified;
    
    console.log('🔄 Initializing success message state:', {
      hasRequestedVerification,
      isUnderReview,
      isNotYetVerified,
      shouldShow: hasRequestedVerification && isUnderReview && isNotYetVerified
    });
    
    return hasRequestedVerification && isUnderReview && isNotYetVerified;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Monitor verification status changes to hide success message when status changes
  useEffect(() => {
    // Hide success message if verification is completed (verified) or explicitly rejected
    if (showSuccessMessage) {
      if (currentUser.verified || currentUser.verificationStatus === 'rejected') {
        setShowSuccessMessage(false);
      }
    }
  }, [currentUser.verified, currentUser.verificationStatus, showSuccessMessage]);
  
  // Phone verification state
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  
  // All documents state
  const [showDocumentsDetail, setShowDocumentsDetail] = useState(false);
  
  // Business details state  
  const [showBusinessDetail, setShowBusinessDetail] = useState(false);
  
  // Determine account type
  const isBusinessAccount = currentUser.accountType === 'business';
  
  // Helper function to check document completion status
  const getDocumentCompletionStatus = useMemo(() => {
    const userDocs = (currentUser as any).verificationDocuments;
    
    const hasIdCard = uploadedDocuments.idCard || 
                     (userDocs?.idCard && userDocs.idCard !== 'pending');
    
    // For BOTH individual and business accounts: Identity Documents only requires ID card
    // Business license is handled in separate Business Details step for business accounts
    const isComplete = hasIdCard;
    
    return { hasIdCard, hasBusinessLicense: false, isComplete };
  }, [uploadedDocuments.idCard, currentUser.verificationDocuments, isBusinessAccount]);
  
  // Calculate progress more comprehensively
  const getProgress = () => {
    let completed = 0;
    let total = isBusinessAccount ? 4 : 3; // Phone, Documents, Business (if business account), AgriLink verification

    // 1. Phone verification
    if (currentUser.phoneVerified) completed++;
    
    // 2. Documents verification (Identity Documents)
    const userDocs = (currentUser as any).verificationDocuments;
    const hasIdCard = uploadedDocuments.idCard || (userDocs?.idCard && userDocs.idCard !== 'pending');
    
    // For BOTH individual and business accounts, Identity Documents step only requires ID card
    // Business license is handled separately in the Business Details step
    if (hasIdCard) {
      completed++;
    }
    
    // 3. Business details (only for business accounts)
    if (isBusinessAccount) {
      // Business details are complete if business name is filled (business description is optional)
      const hasBusinessInfo = currentUser.businessName && currentUser.businessName.trim() !== '';
      const hasBusinessLicense = (currentUser as any).verificationDocuments?.businessLicense && 
                                (currentUser as any).verificationDocuments.businessLicense !== 'pending';
      if (hasBusinessInfo && hasBusinessLicense) completed++;
    }
    
    // 4. AgriLink verification
    if (currentUser.verified) completed++;
    
    return Math.round((completed / total) * 100);
  };

  // Handler functions

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create object URL for preview
      const url = URL.createObjectURL(file);
      
      // Store document info as uploaded (not verified yet)
      setUploadedDocuments(prev => ({
        ...prev,
        [documentType]: {
          file,
          url,
          name: file.name,
          verified: false,
          status: 'uploaded'
        }
      }));

      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user's verification documents
      const updatedDocuments = {
        ...(currentUser.verificationDocuments || {}),
        [documentType]: {
          status: 'uploaded',
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          // Store the file as base64 for admin download
          data: await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          })
        }
      };
      
      // Update user profile
      await onUpdate({
        ...currentUser,
        verificationDocuments: updatedDocuments
      });
      
      // Small delay to ensure state propagation
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveDocument = (documentType: string) => {
    setUploadedDocuments(prev => {
      const updated = { ...prev };
      delete updated[documentType];
      return updated;
    });
  };

  const handleRequestAgriLinkVerification = async () => {
    setIsSubmitting(true);
    
    // Add timeout to prevent infinite processing
    const timeoutId = setTimeout(() => {
      console.error('❌ Verification request timeout - stopping processing');
      setIsSubmitting(false);
    }, 10000); // 10 second timeout
    
    try {
      console.log('🛡️ Requesting AgriLink verification for user:', currentUser.email);
      
      // Check if documents are uploaded in the database
      const userDocs = currentUser.verificationDocuments || {};
      const hasIdCard = userDocs.idCard && userDocs.idCard.status === 'uploaded';
      const hasBusinessLicense = !isBusinessAccount || (userDocs.businessLicense && userDocs.businessLicense.status === 'uploaded');
      const hasUploadedDocs = hasIdCard && hasBusinessLicense;
      
      console.log('🔍 Debug - Document check results:');
      console.log('  - hasIdCard:', hasIdCard);
      console.log('  - hasBusinessLicense:', hasBusinessLicense);
      console.log('  - hasUploadedDocs:', hasUploadedDocs);
      console.log('  - userDocs:', userDocs);
      console.log('  - isBusinessAccount:', isBusinessAccount);
      
      if (hasUploadedDocs) {
        // Create verification request for admin review
        const verificationRequest = {
          id: `req-${Date.now()}`,
          userId: currentUser.id,
          userEmail: currentUser.email,
          userName: currentUser.name,
          userType: currentUser.userType,
          accountType: currentUser.accountType,
          requestType: 'standard',
          status: 'pending',
          submittedAt: new Date().toISOString(),
          documents: {
            nationalId: userDocs.idCard ? {
              status: userDocs.idCard.status,
              name: userDocs.idCard.name,
              uploadedAt: userDocs.idCard.uploadedAt
            } : undefined,
            businessLicense: userDocs.businessLicense ? {
              status: userDocs.businessLicense.status,
              name: userDocs.businessLicense.name,
              uploadedAt: userDocs.businessLicense.uploadedAt
            } : undefined,
          },
          businessInfo: isBusinessAccount ? {
            businessName: currentUser.businessName,
            businessDescription: currentUser.businessDescription,
            businessLicenseNumber: currentUser.businessLicenseNumber,
            location: currentUser.location
          } : undefined,
          phoneVerified: currentUser.phoneVerified
        };

        // Store verification request in Supabase database for admin review
        console.log('🔄 Inserting verification request into database...');
        console.log('📋 Request data:', {
          user_id: currentUser.id,
          user_email: currentUser.email,
          user_name: currentUser.name,
          user_type: currentUser.userType,
          account_type: currentUser.accountType,
          request_type: 'standard',
          status: 'under_review',
          submitted_at: new Date().toISOString(),
          verification_documents: userDocs,
          business_info: isBusinessAccount ? {
            business_name: currentUser.businessName,
            business_description: currentUser.businessDescription,
            business_license_number: currentUser.businessLicenseNumber,
            location: currentUser.location
          } : null,
          phone_verified: currentUser.phoneVerified
        });
        
        const { data: insertData, error: requestError } = await supabase
          .from('verification_requests')
          .insert([{
            user_id: currentUser.id,
            user_email: currentUser.email,
            user_name: currentUser.name,
            user_type: currentUser.userType,
            account_type: currentUser.accountType,
            request_type: 'standard',
            status: 'under_review',
            submitted_at: new Date().toISOString(),
            verification_documents: userDocs,
            business_info: isBusinessAccount ? {
              business_name: currentUser.businessName,
              business_description: currentUser.businessDescription,
              business_license_number: currentUser.businessLicenseNumber,
              location: currentUser.location
            } : null,
            phone_verified: currentUser.phoneVerified
          }])
          .select();

        if (requestError) {
          console.error('❌ Error storing verification request:', requestError);
          console.error('❌ Full error details:', requestError);
          throw new Error('Failed to submit verification request');
        }
        
        console.log('✅ Verification request inserted successfully:', insertData);

        // Simulate request processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Set AgriLink verification as requested
        setAgriLinkVerificationRequested(true);
        setShowSuccessMessage(true);
        
        // Update user profile to track the request
        console.log('🔄 Updating user profile with verification request data...');
        const userUpdateData = {
          ...currentUser,
          agriLinkVerificationRequested: true,
          agriLinkVerificationRequestedAt: new Date().toISOString(),
          verificationStatus: 'under_review',
          verificationSubmittedAt: new Date().toISOString(),
          verificationDocuments: userDocs
        };
        
        console.log('📋 User update data:', userUpdateData);
        
        try {
          await onUpdate(userUpdateData);
          console.log('✅ User profile updated successfully');
        } catch (updateError) {
          console.error('❌ Error updating user profile:', updateError);
          // Don't throw here, as the verification request was already submitted
        }

        console.log('✅ AgriLink verification request submitted successfully:', verificationRequest);
        
        // Success message will remain visible until admin accepts/rejects the request
        
      } else {
        alert('Please upload all required documents before requesting verification.');
      }
    } catch (error) {
      console.error('❌ Failed to request AgriLink verification:', error);
      alert('Failed to request verification. Please try again.');
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  const handleSaveBusinessInfo = async () => {
    if (!businessForm.businessName.trim()) {
      alert('Please enter your business name');
      return;
    }

    if (!businessForm.businessLicenseNumber.trim()) {
      alert('Please enter your business license number');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('💼 Saving business information:', {
        businessName: businessForm.businessName,
        businessDescription: businessForm.businessDescription,
        businessLicenseNumber: businessForm.businessLicenseNumber
      });
      
      // Save to database first
      const { error: dbError } = await supabase
        .from('users')
        .update({
          business_name: businessForm.businessName,
          business_description: businessForm.businessDescription,
          business_license_number: businessForm.businessLicenseNumber,
          business_details_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (dbError) {
        console.error('❌ Database error:', dbError);
        throw new Error('Failed to save to database');
      }

      // Then update local state
      await onUpdate({
        ...currentUser,
        businessName: businessForm.businessName,
        businessDescription: businessForm.businessDescription,
        businessLicenseNumber: businessForm.businessLicenseNumber,
        businessDetailsCompleted: true
      });
      
      console.log('✅ Business information saved to database and user profile');
      setIsEditingBusiness(false);
    } catch (error) {
      console.error('❌ Error saving business info:', error);
      alert('Failed to save business information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  // If showing new phone verification, render that instead
  if (showPhoneVerification) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl font-semibold text-primary">Phone Verification</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Verify your phone number with Supabase backend integration
            </p>
          </div>
        </div>

        <PhoneVerification
          currentUser={currentUser}
          onVerificationComplete={(verifiedPhoneNumber) => {
            // Update user state with verified phone
            onUpdate({
              ...currentUser,
              phone: verifiedPhoneNumber,
              phoneVerified: true,
              phoneVerificationDate: new Date().toISOString()
            });
            
            // Go back to main verification view
            setShowPhoneVerification(false);
          }}
          onBack={() => setShowPhoneVerification(false)}
        />
      </div>
    );
  }


  // If showing documents detail, render that instead
  if (showDocumentsDetail) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl font-semibold text-primary">Identity Documents</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentUser.verified ? 'Documents submitted for identity verification' : 'Upload your government-issued ID to verify your identity'}
            </p>
          </div>
        </div>

        {currentUser.verified ? (
          /* Already Verified - Show Submitted Documents */
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 text-primary">Submitted Documents</h3>
              
              {/* National ID Card */}
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">National ID Card</p>
                        <p className="text-sm text-muted-foreground">Government-issued identification</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        Verified
                      </Badge>
                      {uploadedDocuments.businessLicense && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(uploadedDocuments.businessLicense.url, '_blank')}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    {uploadedDocuments.businessLicense 
                      ? `Uploaded: ${uploadedDocuments.businessLicense.name}` 
                      : 'Document verified and stored securely'
                    }
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <p className="font-medium text-primary">Verification Complete</p>
                </div>
                <p className="text-sm text-primary/80">
                  Your documents have been successfully verified. You now have full access to AgriLink platform features.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : currentUser.verificationStatus === 'under_review' && !agriLinkVerificationRequested ? (
          /* Under Review - Show Status */
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 text-orange-800">Documents Under Review</h3>
              
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-orange-600" />
                    <p className="font-medium text-orange-800">Review in Progress</p>
                  </div>
                  <p className="text-sm text-orange-700 mb-2">
                    We'll notify you once the review is complete, typically within 1-2 business days.
                  </p>
                  {currentUser.verificationSubmittedAt && (
                    <p className="text-xs text-orange-600 mt-2">
                      Submitted on {new Date(currentUser.verificationSubmittedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Show submitted documents */}
                {uploadedDocuments.idCard && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium text-orange-800">
                            {uploadedDocuments.idCard.name}
                          </p>
                          <p className="text-xs text-orange-700">
                            Under Review
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(uploadedDocuments.idCard.url, '_blank')}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                          Under Review
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Business document if applicable */}
                {isBusinessAccount && uploadedDocuments.businessLicense && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium text-orange-800">
                            {uploadedDocuments.businessLicense.name}
                          </p>
                          <p className="text-xs text-orange-700">
                            Under Review
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(uploadedDocuments.businessLicense.url, '_blank')}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                          Under Review
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Upload Form */
          <>
            
            <Card className="border-primary/20 bg-primary/2">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-primary/80 mb-4">
                      Please upload a clear photo of your government-issued ID (National ID card, passport, or driver's license).
                    </p>
                    
                    {/* ID Document Upload */}
                    <div className="space-y-4">
                      {/* Only show upload card if no document uploaded yet AND AgriLink verification not yet requested */}
                      {!uploadedDocuments.idCard && !agriLinkVerificationRequested && (
                        <div className="border-2 border-dashed border-primary/30 bg-primary/5 rounded-lg p-6 text-center hover:border-primary/50 hover:bg-primary/8 transition-all duration-200">
                          <FileText className="w-12 h-12 text-primary/70 mx-auto mb-4" />
                          <p className="text-sm font-medium mb-2 text-primary">Upload Identity Document</p>
                          <p className="text-xs text-primary/70 mb-4">
                            National ID, Passport, or Driver's License • JPG, PNG up to 10MB
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="id-upload"
                            onChange={(e) => handleFileUpload(e, 'idCard')}
                          />
                          <Button variant="outline" size="sm" asChild className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground">
                            <label htmlFor="id-upload" className="cursor-pointer">
                              Choose File
                            </label>
                          </Button>
                        </div>
                      )}

                      {/* Show uploaded ID document */}
                      {uploadedDocuments.idCard && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-primary" />
                              <div>
                                <button 
                                  onClick={() => window.open(uploadedDocuments.idCard.url, '_blank')}
                                  className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors text-left"
                                >
                                  {uploadedDocuments.idCard.name}
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Only show remove button if not submitted for review and AgriLink verification not requested */}
                              {currentUser.verificationStatus !== 'under_review' && !currentUser.verified && !agriLinkVerificationRequested && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleRemoveDocument('idCard')}
                                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                Uploaded
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Back Button - Bottom Left */}
        <div className="flex justify-start">
          <Button variant="ghost" size="sm" onClick={() => setShowDocumentsDetail(false)} className="px-3 py-2 text-primary/70 hover:text-primary hover:bg-primary/10">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Overview
          </Button>
        </div>
      </div>
    );
  }

  // If showing business detail, render that instead
  if (showBusinessDetail) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Business Details</h1>
            <p className="text-sm text-muted-foreground">
              {currentUser.businessName ? 'Your business information' : 'Complete your business information'}
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">
              {isEditingBusiness ? 'Update Business Information' : 'Business Information'}
            </h3>
            
            <div className="space-y-6">
              {/* Business Information Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Business Name *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={businessForm.businessName}
                      onChange={(e) => setBusinessForm(prev => ({ ...prev, businessName: e.target.value }))}
                      placeholder="Enter your business name"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        currentUser.businessName && !isEditingBusiness
                          ? 'bg-muted text-muted-foreground border-muted cursor-not-allowed'
                          : 'border-muted bg-background text-foreground'
                      }`}
                      disabled={Boolean(currentUser.businessName) && !isEditingBusiness}
                    />
                    {currentUser.businessName && !isEditingBusiness && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingBusiness(true)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Business License Number *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={businessForm.businessLicenseNumber}
                      onChange={(e) => setBusinessForm(prev => ({ ...prev, businessLicenseNumber: e.target.value }))}
                      placeholder="Enter your business license number"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        currentUser.businessLicenseNumber && !isEditingBusiness
                          ? 'bg-muted text-muted-foreground border-muted cursor-not-allowed'
                          : 'border-muted bg-background text-foreground'
                      }`}
                      disabled={Boolean(currentUser.businessLicenseNumber) && !isEditingBusiness}
                    />
                    {currentUser.businessLicenseNumber && !isEditingBusiness && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingBusiness(true)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Business Description</label>
                  <textarea
                    value={businessForm.businessDescription}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, businessDescription: e.target.value }))}
                    placeholder="Describe your business activities"
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                      currentUser.businessName && !isEditingBusiness
                        ? 'bg-muted text-muted-foreground border-muted cursor-not-allowed'
                        : 'border-muted bg-background text-foreground'
                    }`}
                    disabled={Boolean(currentUser.businessName) && !isEditingBusiness}
                  />
                </div>

                {currentUser.businessName && !isEditingBusiness && (
                  <div className="bg-muted/50 border border-muted rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      <p className="text-muted-foreground text-sm">Business information saved to your profile</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isEditingBusiness || !currentUser.businessName ? (
                    <>
                      <Button 
                        onClick={handleSaveBusinessInfo}
                        disabled={isSubmitting || (currentUser as any).verificationStatus === 'under_review'}
                        className="flex-1"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Business Info'}
                      </Button>
                      
                      {isEditingBusiness && (
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setIsEditingBusiness(false);
                            setBusinessForm({
                              businessName: currentUser.businessName || '',
                              businessDescription: currentUser.businessDescription || '',
                              businessLicenseNumber: currentUser.businessLicenseNumber || ''
                            });
                          }}
                          className="px-4"
                        >
                          Cancel
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button 
                      onClick={() => setIsEditingBusiness(true)}
                      variant="outline"
                      className="flex-1"
                    >
                      Edit Business Info
                    </Button>
                  )}
                  

                  

                </div>
              </div>

              {/* Business License Document Section */}
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Business License Document *</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your business registration or license document to complete your business verification. This is mandatory for business account verification.
                </p>

                {/* Only show upload card if no business document uploaded yet AND AgriLink verification not yet requested */}
                {!uploadedDocuments.businessLicense && !agriLinkVerificationRequested && (
                  <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                    <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm font-medium mb-2">Upload Business Registration</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Business License or Registration • JPG, PNG up to 10MB
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="business-detail-upload"
                      onChange={(e) => handleFileUpload(e, 'businessLicense')}
                    />
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor="business-detail-upload" className="cursor-pointer">
                        Choose File
                      </label>
                    </Button>
                  </div>
                )}

                {/* Show uploaded business document */}
                {uploadedDocuments.businessLicense && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building className="w-5 h-5 text-primary" />
                        <div>
                          <button 
                            onClick={() => window.open(uploadedDocuments.businessLicense.url, '_blank')}
                            className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors text-left"
                          >
                            {uploadedDocuments.businessLicense.name}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Only show remove button if not submitted for review and AgriLink verification not requested */}
                        {currentUser.verificationStatus !== 'under_review' && !currentUser.verified && !agriLinkVerificationRequested && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveDocument('businessLicense')}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          Uploaded
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button - Bottom Left */}
        <div className="flex justify-start">
          <Button variant="ghost" size="sm" onClick={() => setShowBusinessDetail(false)} className="px-3 py-2">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Overview
          </Button>
        </div>
      </div>
    );
  }

  // Main verification overview
  return (
    <div className="max-w-2xl mx-auto space-y-4 md:space-y-6 pb-20">
      {/* Progress Header - Left Aligned */}
      <div className="space-y-2">
        <div>
          <h1 className="text-xl font-semibold">AgriLink Verification</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Complete your verification in {isBusinessAccount ? '4' : '3'} steps to build trust and credibility
        </p>
        <div className="w-full bg-muted rounded-full h-2 mt-4">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500" 
            style={{ width: `${getProgress()}%` }}
          ></div>
        </div>
        <p className="text-xs text-muted-foreground">{getProgress()}% Complete</p>
      </div>

      <div className="space-y-4">
        {/* Step 1: Phone Verification */}
        <Card className={
          currentUser.phoneVerified 
            ? "bg-primary/5 border-primary/20" 
            : "bg-primary/5 border-primary/20"
        }>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  currentUser.phoneVerified 
                    ? 'bg-primary' 
                    : 'bg-primary/10 border-2 border-primary/40'
                }`}>
                  {currentUser.phoneVerified ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <Phone className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${currentUser.phoneVerified ? 'text-primary' : 'text-primary/90'}`}>
                    Phone Verification
                  </p>
                  <p className={`text-sm truncate ${currentUser.phoneVerified ? 'text-primary/80' : 'text-primary'}`}>
                    {currentUser.phoneVerified ? 'Phone number verified' : 'Verify your phone number'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge 
                  variant="secondary" 
                  className={
                    currentUser.phoneVerified 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : 'bg-red-100 text-red-700 border-red-200'
                  }
                >
                  {currentUser.phoneVerified ? 'Complete' : 'Required'}
                </Badge>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowPhoneVerification(true)}
                  className={`p-1 h-8 w-8 ${
                    currentUser.phoneVerified 
                      ? 'text-primary hover:bg-primary/10' 
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Documents Upload */}
        <Card className={
          currentUser.verified 
            ? "bg-primary/5 border-primary/20" 
            : getDocumentCompletionStatus.isComplete 
            ? "bg-primary/5 border-primary/20" 
            : "bg-primary/5 border-primary/20"
        }>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  currentUser.verified 
                    ? 'bg-primary' 
                    : getDocumentCompletionStatus.isComplete 
                    ? 'bg-primary' 
                    : 'bg-primary/10 border-2 border-primary/40'
                }`}>
                  {currentUser.verified ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : getDocumentCompletionStatus.isComplete ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <FileText className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${
                    currentUser.verified 
                      ? 'text-primary' 
                      : getDocumentCompletionStatus.isComplete 
                      ? 'text-primary' 
                      : 'text-primary/90'
                  }`}>
                    Identity Documents
                  </p>
                  <p className={`text-sm truncate ${
                    currentUser.verified 
                      ? 'text-primary/80' 
                      : getDocumentCompletionStatus.isComplete 
                      ? 'text-primary/80' 
                      : 'text-primary'
                  }`}>
                    {currentUser.verified 
                      ? 'Documents verified' 
                      : getDocumentCompletionStatus.isComplete 
                      ? 'Documents uploaded' 
                      : 'Upload identity documents'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge 
                  variant="secondary" 
                  className={
                    currentUser.verified 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : getDocumentCompletionStatus.isComplete 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : 'bg-red-100 text-red-700 border-red-200'
                  }
                >
                  {currentUser.verified 
                    ? 'Complete' 
                    : getDocumentCompletionStatus.isComplete 
                    ? 'Complete' 
                    : 'Required'
                  }
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowDocumentsDetail(true)}
                  className={`p-1 h-8 w-8 ${
                    currentUser.verified 
                      ? 'text-primary hover:bg-primary/10' 
                      : getDocumentCompletionStatus.isComplete 
                      ? 'text-primary hover:bg-primary/10' 
                      : 'text-primary hover:bg-primary/10'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Details - Only show for business accounts */}
        {isBusinessAccount && (() => {
          // Check business completion status more comprehensively
          const hasBusinessInfo = Boolean(currentUser.businessName); // businessDescription is optional
          const hasBusinessLicense = Boolean(uploadedDocuments.businessLicense) || 
                                   (Boolean(currentUser.verificationDocuments?.businessLicense) && 
                                    currentUser.verificationDocuments?.businessLicense?.status !== 'pending');
          
          // If user is verified, business details should be considered complete
          const isBusinessComplete = currentUser.verified || (hasBusinessInfo && hasBusinessLicense);
          
          return (
            <Card className={isBusinessComplete ? "bg-primary/5 border-primary/20" : "bg-primary/5 border-primary/20"}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isBusinessComplete 
                        ? 'bg-primary' 
                        : 'bg-primary/10 border-2 border-primary/40'
                    }`}>
                      {isBusinessComplete ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <Building className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isBusinessComplete ? 'text-primary' : 'text-primary/90'}`}>
                        Business Details
                      </p>
                      <p className={`text-sm truncate ${isBusinessComplete ? 'text-primary/80' : 'text-primary'}`}>
                        {isBusinessComplete 
                          ? 'Business information & license completed' 
                          : hasBusinessInfo 
                          ? 'Business license needed'
                          : 'Complete business information'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge 
                      variant="secondary" 
                      className={isBusinessComplete ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}
                    >
                      {isBusinessComplete ? 'Complete' : 'Required'}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowBusinessDetail(true)}
                      className={`p-1 h-8 w-8 ${
                        isBusinessComplete 
                          ? 'text-primary hover:bg-primary/10' 
                          : 'text-primary hover:bg-primary/10'
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Step 3: AgriLink Verification */}
        {currentUser.verified ? (
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-emerald-700 truncate">AgriLink Verification</p>
                    <p className="text-sm text-emerald-600 truncate">Your account is fully verified!</p>
                    {currentUser.agriLinkVerificationDate && (
                      <p className="text-xs text-emerald-600 mt-1 truncate">
                        on {new Date(currentUser.agriLinkVerificationDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 flex-shrink-0">
                  Verified
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : agriLinkVerificationRequested ? (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-blue-800 truncate">AgriLink Verification</p>
                    <p className="text-sm text-blue-700 truncate">Verification submitted for review</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button 
                    size="sm"
                    disabled={true}
                    variant="secondary"
                    className="text-xs px-3 py-2 bg-blue-100 text-blue-700 border-blue-200"
                  >
                    Verification Requested
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        ) : (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary/90 truncate">AgriLink Verification</p>
                    <p className="text-sm text-primary truncate">Complete all steps to get verified</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Always show the Request Verification button for better UX visibility */}
                  {(() => {
                    // Check business completion properly
                    const hasBusinessInfo = !isBusinessAccount || Boolean(currentUser.businessName); // businessDescription is optional
                    const hasBusinessLicense = !isBusinessAccount || Boolean(uploadedDocuments.businessLicense) || 
                                             (Boolean(currentUser.verificationDocuments?.businessLicense) && 
                                              currentUser.verificationDocuments?.businessLicense?.status !== 'pending');
                    
                    // If user is verified, business details should be considered complete
                    const isBusinessComplete = currentUser.verified || (!isBusinessAccount || (hasBusinessInfo && hasBusinessLicense));
                    
                    const canRequest = currentUser.phoneVerified && 
                                      uploadedDocuments.idCard && 
                                      hasBusinessInfo && 
                                      hasBusinessLicense && 
                                      !agriLinkVerificationRequested;
                    
                    if (canRequest) {
                      return (
                    <Button 
                      size="sm"
                      onClick={handleRequestAgriLinkVerification}
                      disabled={isSubmitting}
                      className="text-xs px-3 py-2"
                    >
                          {isSubmitting ? 'Processing...' : 'Request Verification'}
                        </Button>
                      );
                    } else {
                      // Show disabled button with helpful tooltip
                      const missingSteps: string[] = [];
                      if (!currentUser.phoneVerified) missingSteps.push('phone verification');
                      if (!uploadedDocuments.idCard) missingSteps.push('ID documents');
                      if (isBusinessAccount && !hasBusinessInfo) missingSteps.push('business information');
                      if (isBusinessAccount && !hasBusinessLicense) missingSteps.push('business license');
                      
                      const tooltipText = missingSteps.length > 0 
                        ? `Complete ${missingSteps.join(', ')} first`
                        : 'Complete required steps above';
                      
                      return (
                        <Button 
                          size="sm"
                          disabled={true}
                          variant="outline"
                          className="text-xs px-3 py-2 opacity-60 cursor-not-allowed"
                          title={tooltipText}
                        >
                          Request Verification
                        </Button>
                      );
                    }
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Message for Verified Users */}
        {currentUser.verified && (
          <p className="text-sm text-emerald-600">
            Congratulations! Your AgriLink verification is complete. You now have enhanced buyer trust and credibility.
          </p>
        )}

        {/* Success Message - shown below AgriLink Verification card */}
        {showSuccessMessage && (
          <p className="text-sm text-blue-700">
            AgriLink verification requested successfully! We will review your documents within 1-2 business days and notify you of the outcome.
          </p>
        )}




        {/* Back to Profile Button */}
        <div className="mt-8 pt-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="px-3 py-2"
          >
            <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Profile
          </Button>
        </div>

      </div>
    </div>
  );
}