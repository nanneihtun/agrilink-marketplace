// Helper function to get seller verification status - checks actual user data
export function getSellerVerificationStatus(sellerId: string, currentUser?: any): {
  idVerified: boolean;
  businessVerified: boolean;
  verified: boolean;
  trustLevel:
    | "unverified"
    | "under-review"
    | "id-verified"
    | "business-verified";
  tierLabel: string;
  levelBadge: string;
  level: number;
  userType?: string;
  accountType?: string;
} {
  // Check if this is the current user
  if (currentUser && sellerId === currentUser.id) {
    const isVerified = currentUser.verified || false;
    const isBusinessVerified = currentUser.businessVerified || false;
    const verificationStatus = currentUser.verificationStatus || 'unverified';
    
    return {
      idVerified: isVerified,
      businessVerified: isBusinessVerified,
      verified: isVerified,
      trustLevel: isBusinessVerified ? "business-verified" : 
                 isVerified ? "id-verified" : 
                 verificationStatus === 'under_review' ? "under-review" : "unverified",
      tierLabel: isBusinessVerified ? "Business Verified" : 
                isVerified ? "Verified" : 
                verificationStatus === 'under_review' ? "Under Review" : "Unverified",
      levelBadge: isBusinessVerified ? "Tier 2" : 
                 isVerified ? "Tier 1" : 
                 verificationStatus === 'under_review' ? "Under Review" : "Unverified",
      level: isBusinessVerified ? 2 : isVerified ? 1 : 0,
      userType: currentUser.userType,
      accountType: currentUser.accountType,
    };
  }
  
  
  // Check localStorage for other users as fallback
  try {
    const users = JSON.parse(localStorage.getItem('agriconnect-myanmar-users') || '[]');
    const seller = users.find((user: any) => user.id === sellerId);
    
    if (seller) {
      const isVerified = seller.verified || false;
      const isBusinessVerified = seller.businessVerified || false;
      const verificationStatus = seller.verificationStatus || 'unverified';
      
      return {
        idVerified: isVerified,
        businessVerified: isBusinessVerified,
        verified: isVerified,
        trustLevel: isBusinessVerified ? "business-verified" : 
                   isVerified ? "id-verified" : 
                   verificationStatus === 'under_review' ? "under-review" : "unverified",
        tierLabel: isBusinessVerified ? "Business Verified" : 
                  isVerified ? "Verified" : 
                  verificationStatus === 'under_review' ? "Under Review" : "Unverified",
        levelBadge: isBusinessVerified ? "Tier 2" : 
                   isVerified ? "Tier 1" : 
                   verificationStatus === 'under_review' ? "Under Review" : "Unverified",
        level: isBusinessVerified ? 2 : isVerified ? 1 : 0,
        userType: seller.userType,
        accountType: seller.accountType,
      };
    }
  } catch (error) {
    console.error('Error checking seller verification status in localStorage:', error);
  }
  
  // Default unverified status - will be updated when user cache is populated
  return {
    idVerified: false,
    businessVerified: false,
    verified: false,
    trustLevel: "unverified",
    tierLabel: "Unverified",
    levelBadge: "Unverified",
    level: 0,
    userType: undefined,
    accountType: undefined,
  };
}

// Legacy helper for backwards compatibility
export function isSellerVerified(sellerId: string, currentUser?: any): boolean {
  return getSellerVerificationStatus(sellerId, currentUser).verified;
}