import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { ProductCard } from "./components/ProductCard";
import { SearchFilters } from "./components/SearchFilters";
import { PriceComparison } from "./components/PriceComparison";
import { ChatInterface } from "./components/ChatInterface";
import { ProductDetails } from "./components/ProductDetails";
import { SellerStorefront } from "./components/SellerStorefront";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { ForgotPassword } from "./components/ForgotPassword";
import { AccountTypeGuide } from "./components/AccountTypeGuide";
import { UserMenu } from "./components/UserMenu";
import { AddListing } from "./components/AddListing";
import { ComprehensiveProductForm } from "./components/ComprehensiveProductForm";
import { FreshDashboard } from "./components/FreshDashboard";
import { ProfileVerificationPage } from "./components/ProfileVerificationPage";
import { BuyerVerification } from "./components/BuyerVerification";
import { SplitVerificationPage } from "./components/SplitVerificationPage";
import { AccountTypeVerification } from "./components/AccountTypeVerification";
import { EditProfile } from "./components/EditProfile";
import { Profile } from "./components/Profile";
import { Messages } from "./components/Messages";
import { VerificationPrompt } from "./components/VerificationPrompt";
import { AdminVerificationPanel } from "./components/AdminVerificationPanel";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";

import { products as demoProducts, Product } from "./data/products";
import { sellers } from "./data/sellers";
import { freshDemoProducts, freshDemoAccounts } from "./data/fresh-demo-accounts";
import { generatePriceComparisonData } from "./utils/priceComparison";
import { useProductFiltering, FilterState } from "./hooks/useProductFiltering";
import { useAuth } from "./hooks/useAuth";
import { useProducts } from "./hooks/useProducts";
import { useChat } from "./hooks/useChat";
import { useBackendFallback } from "./hooks/useBackendFallback";
import { 
  Leaf,
  LogIn,
  UserPlus,
  Sprout,
  Truck,
  ShoppingCart,
  ArrowRight,
  CheckCircle
} from "lucide-react";

type ViewType = 'marketplace' | 'product-details' | 'price-comparison' | 'seller-storefront' | 'dashboard' | 'profile' | 'edit-profile' | 'add-listing' | 'register' | 'login' | 'forgot-password' | 'messages' | 'verification' | 'admin-verification';
type AuthModalType = 'login' | 'register' | null;

// Helper function to get seller verification status with trust levels, tiers, and level badges
function getSellerVerificationStatus(sellerId: string): { 
  idVerified: boolean; 
  businessVerified: boolean; 
  verified: boolean;
  trustLevel: 'unverified' | 'under-review' | 'id-verified' | 'business-verified';
  tierLabel: string;
  levelBadge: string;
  level: number;
  userType?: string;
} {
  // Check in fresh demo accounts first
  const demoAccount = freshDemoAccounts.find(account => account.id === sellerId);
  if (demoAccount) {
    const hasBusinessLicense = demoAccount.verificationDocuments?.businessLicense === 'verified';
    const hasIdVerification = demoAccount.verified; // Basic verification
    const userType = demoAccount.userType;
    const verificationStatus = demoAccount.verificationStatus;
    
    // Check for under-review status
    const isUnderReview = verificationStatus === 'under_review' || 
                         demoAccount.verificationDocuments?.idCard === 'uploaded' ||
                         demoAccount.verificationDocuments?.businessLicense === 'uploaded';
    
    // Determine level and badges based on verification status
    let level = 0;
    let levelBadge = 'Unverified';
    let tierLabel = 'Unverified';
    let trustLevel: 'unverified' | 'under-review' | 'id-verified' | 'business-verified' = 'unverified';
    
    if (hasIdVerification && hasBusinessLicense) {
      // Enhanced business verification - for users with formal business credentials
      level = 2;
      levelBadge = 'Business Verified';
      trustLevel = 'business-verified';
      if (userType === 'trader') {
        tierLabel = 'Business Verified Trader';
      } else if (userType === 'farmer') {
        tierLabel = 'Business Verified Farmer';
      } else {
        tierLabel = 'Business Verified';
      }
    } else if (hasIdVerification) {
      // Individual verification - this is COMPLETE verification for individual users
      level = 1;
      levelBadge = 'Verified';
      trustLevel = 'id-verified';
      if (userType === 'trader') {
        tierLabel = 'Verified Trader';
      } else if (userType === 'farmer') {
        tierLabel = 'Verified Farmer';
      } else {
        tierLabel = 'Verified';
      }
    } else if (isUnderReview) {
      // Under review state - verification submitted but not approved yet
      level = 0;
      levelBadge = 'Under Review';
      trustLevel = 'under-review';
      if (userType === 'trader') {
        tierLabel = 'Trader (Under Review)';
      } else if (userType === 'farmer') {
        tierLabel = 'Farmer (Under Review)';
      } else {
        tierLabel = 'Under Review';
      }
    }
    
    return {
      idVerified: hasIdVerification,
      businessVerified: hasBusinessLicense,
      verified: hasIdVerification, // Base verified status
      trustLevel,
      tierLabel,
      levelBadge,
      level,
      userType
    };
  }
  
  // Check in sellers data
  const seller = sellers.find(s => s.id === sellerId);
  if (seller) {
    const hasBusinessLicense = (seller as any).businessVerified || false;
    const hasIdVerification = seller.verified || false;
    const userType = (seller as any).userType || 'farmer'; // default to farmer for legacy data
    const verificationStatus = (seller as any).verificationStatus;
    
    // Check for under-review status in legacy sellers data
    const isUnderReview = verificationStatus === 'under_review';
    
    // Determine level and badges
    let level = 0;
    let levelBadge = 'Unverified';
    let tierLabel = 'Unverified';
    let trustLevel: 'unverified' | 'under-review' | 'id-verified' | 'business-verified' = 'unverified';
    
    if (hasIdVerification && hasBusinessLicense) {
      // Enhanced business verification - for users with formal business credentials
      level = 2;
      levelBadge = 'Business Verified';
      trustLevel = 'business-verified';
      if (userType === 'trader') {
        tierLabel = 'Business Verified Trader';
      } else if (userType === 'farmer') {
        tierLabel = 'Business Verified Farmer';
      } else {
        tierLabel = 'Business Verified';
      }
    } else if (hasIdVerification) {
      // Individual verification - this is COMPLETE verification for individual users
      level = 1;
      levelBadge = 'Verified';
      trustLevel = 'id-verified';
      if (userType === 'trader') {
        tierLabel = 'Verified Trader';
      } else if (userType === 'farmer') {
        tierLabel = 'Verified Farmer';
      } else {
        tierLabel = 'Verified';
      }
    } else if (isUnderReview) {
      // Under review state - verification submitted but not approved yet
      level = 0;
      levelBadge = 'Under Review';
      trustLevel = 'under-review';
      if (userType === 'trader') {
        tierLabel = 'Trader (Under Review)';
      } else if (userType === 'farmer') {
        tierLabel = 'Farmer (Under Review)';
      } else {
        tierLabel = 'Under Review';
      }
    }
    
    return {
      idVerified: hasIdVerification,
      businessVerified: hasBusinessLicense,
      verified: hasIdVerification,
      trustLevel,
      tierLabel,
      levelBadge,
      level,
      userType
    };
  }
  
  return {
    idVerified: false,
    businessVerified: false,
    verified: false,
    trustLevel: 'unverified',
    tierLabel: 'Unverified',
    levelBadge: 'Unverified',
    level: 0,
    userType: undefined
  };
}

// Legacy helper for backwards compatibility
function isSellerVerified(sellerId: string): boolean {
  return getSellerVerificationStatus(sellerId).verified;
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>("marketplace");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState<AuthModalType>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previousView, setPreviousView] = useState<ViewType>('marketplace');
  const [verificationInitialStep, setVerificationInitialStep] = useState<number>(1);

  const [showVerification, setShowVerification] = useState(false);
  const [verificationPrompt, setVerificationPrompt] = useState<{
    show: boolean;
    feature: 'chat' | 'contact' | 'listing' | 'storefront';
    sellerName?: string;
  }>({ show: false, feature: 'chat' });
  const [localProducts, setLocalProducts] = useState<Product[]>(() => {
    // Load locally added products from localStorage on initialization
    try {
      const stored = localStorage.getItem('agriconnect-myanmar-local-products');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load local products:', error);
      return [];
    }
  }); // For demo mode additions
  // Persist local products to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('agriconnect-myanmar-local-products', JSON.stringify(localProducts));
    } catch (error) {
      console.error('Failed to save local products:', error);
    }
  }, [localProducts]);

  // Admin mode is now based on user role instead of temporary toggle
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    location: '',
    region: '',
    city: '',
    sellerType: '',
    verifiedStatus: '',
    priceRange: '',
    sortBy: 'newest'
  });

  // Use custom hooks for backend integration
  const { backendAvailable, checking: backendChecking } = useBackendFallback();
  const { user: currentUser, loading: authLoading, signUp, signIn, signOut, updateProfile } = useAuth();
  const { products: backendProducts, loading: productsLoading, createProduct, updateProduct, deleteProduct, getUserProducts } = useProducts();
  // Only initialize chat hook when user is authenticated
  const { startConversation } = useChat(currentUser?.id && !authLoading ? currentUser.id : undefined);

  // Combine backend products with demo products for fallback
  const allProducts = useMemo(() => {
    // Always show demo products if backend is empty, loading, or not available
    if (!backendAvailable || !backendProducts || backendProducts.length === 0) {
      console.log('Using demo products, backend available:', backendAvailable, 'backend products:', backendProducts?.length || 0);
      
      // Get product overrides and deletions from localStorage
      const overrides = JSON.parse(localStorage.getItem('agriconnect-myanmar-product-overrides') || '{}');
      const deletedIds = JSON.parse(localStorage.getItem('agriconnect-myanmar-deleted-products') || '[]');
      
      console.log('📦 Product overrides loaded:', {
        overrideCount: Object.keys(overrides).length,
        deletedCount: deletedIds.length,
        overrideIds: Object.keys(overrides),
        demoProductsCount: demoProducts.length,
        freshDemoProductsCount: freshDemoProducts.length
      });
      
      // Apply overrides and filter out deleted products
      let processedDemoProducts = demoProducts
        .filter(p => !deletedIds.includes(p.id))
        .map(p => {
          const hasOverride = overrides[p.id];
          if (hasOverride) {
            console.log('🔄 Applying override for product:', p.id, {
              originalDescription: p.description || 'UNDEFINED',
              overrideDescription: hasOverride.description || 'UNDEFINED',
              originalCategory: p.category || 'UNDEFINED',
              overrideCategory: hasOverride.category || 'UNDEFINED',
              overrideKeys: Object.keys(hasOverride).length + ' keys total',
              hasDescriptionField: 'description' in hasOverride,
              hasCategoryField: 'category' in hasOverride
            });
            return hasOverride; // Return the override directly
          }
          return p; // Return original product
        });
      
      // Add fresh demo products (convert to Product format) and filter out deleted ones
      // Also apply overrides to fresh demo products
      const convertedFreshProducts = freshDemoProducts
        .filter(fp => !deletedIds.includes(fp.id))
        .map(fp => {
          const hasOverride = overrides[fp.id];
          if (hasOverride) {
            console.log('🔄 Applying override for fresh product:', fp.id, {
              originalDescription: fp.description || 'UNDEFINED',
              overrideDescription: hasOverride.description || 'UNDEFINED',
              originalCategory: fp.category || 'UNDEFINED',
              overrideCategory: hasOverride.category || 'UNDEFINED',
              overrideKeys: Object.keys(hasOverride).length + ' keys total',
              hasDescriptionField: 'description' in hasOverride,
              hasCategoryField: 'category' in hasOverride
            });
            return hasOverride; // Return the override directly
          }
          
          // Return converted fresh product if no override
          return {
            id: fp.id,
            sellerId: fp.sellerId,
            name: fp.name,
            price: fp.price,
            unit: fp.unit,
            location: fp.location,
            sellerType: fp.sellerType,
            sellerName: fp.sellerName,
            image: fp.image,
            quantity: fp.quantity,
            lastUpdated: fp.lastUpdated,
            variations: fp.variations || []
          };
        });
      
      // In demo mode, combine processed demo products with fresh demo products and any locally added products
      return [...processedDemoProducts, ...convertedFreshProducts, ...localProducts];
    }
    console.log('Using backend products:', backendProducts.length);
    return backendProducts;
  }, [backendProducts, backendAvailable, localProducts]);

  // Set initial view based on user type when user loads (but don't redirect if already on certain pages)
  useEffect(() => {
    if (currentUser && !authLoading) {
      if (currentUser.userType === 'farmer' || currentUser.userType === 'trader') {
        // Only redirect to dashboard if not currently on verification, profile, storefront, marketplace, add-listing, or other user-specific pages
        if (currentView !== 'verification' && currentView !== 'profile' && currentView !== 'edit-profile' && currentView !== 'messages' && currentView !== 'seller-storefront' && currentView !== 'marketplace' && currentView !== 'add-listing' && currentView !== 'product-details' && currentView !== 'price-comparison') {
          setCurrentView('dashboard');
        }
      } else if (currentUser.userType === 'admin') {
        // Admins default to marketplace view with admin controls
        if (currentView !== 'verification' && currentView !== 'profile' && currentView !== 'edit-profile' && currentView !== 'messages' && currentView !== 'seller-storefront' && currentView !== 'add-listing' && currentView !== 'product-details' && currentView !== 'price-comparison') {
          setCurrentView('marketplace');
        }
      }
    }
  }, [currentUser, authLoading, currentView]);

  // Check if current user is an admin
  const isAdmin = currentUser?.userType === 'admin';

  // Use custom hook for filtering
  const { filteredProducts, getActiveFiltersCount } = useProductFiltering(allProducts, filters, isSellerVerified);

  // Memoized selectors with null checks
  const selectedProduct = useMemo(() => 
    selectedChat ? allProducts.find(p => p.id === selectedChat) : null, 
    [allProducts, selectedChat]
  );
  
  const productToView = useMemo(() => 
    selectedProductId ? allProducts.find(p => p.id === selectedProductId) : null, 
    [allProducts, selectedProductId]
  );

  // Authentication handlers
  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      await signIn(email, password);
      setAuthModal(null);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [signIn]);

  const handleRegister = useCallback(async (userData: any) => {
    try {
      await signUp(userData);
      setAuthModal(null);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }, [signUp]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      setSelectedChat(null);
      setCurrentView('marketplace');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [signOut]);

  const handleUpdateUser = useCallback(async (updates: any) => {
    try {
      await updateProfile(updates);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }, [updateProfile]);

  const handleAddListing = useCallback(async (listing: Product) => {
    try {
      console.log('🚀 handleAddListing called with:', {
        productName: listing.name,
        isEditing: listing.isEditing,
        hasImage: !!listing.image,
        imageSize: listing.image?.length || 0,
        totalSize: JSON.stringify(listing).length
      });

      // Check if we're in demo mode (backend not available)
      if (!backendAvailable || !backendProducts || backendProducts.length === 0) {
        console.log('📱 Demo mode: handling locally');
        
        // Demo mode: handle locally
        if (listing.isEditing) {
          console.log('✏️ Updating existing product:', listing.id);
          
          // Update existing listing - check if it's in demo products or local products
          const isInDemoProducts = demoProducts.some(p => p.id === listing.id);
          const isInFreshDemoProducts = freshDemoProducts.some(p => p.id === listing.id);
          
          if (isInDemoProducts || isInFreshDemoProducts) {
            console.log('�� Saving to localStorage overrides');
            try {
              // For demo products, we need to store the updated version in localStorage
              const existingOverrides = JSON.parse(localStorage.getItem('agriconnect-myanmar-product-overrides') || '{}');
              
              // Debug what we're about to save
              console.log('💾 About to save listing:', {
                id: listing.id,
                name: listing.name,
                description: listing.description || 'UNDEFINED',
                category: listing.category || 'UNDEFINED',
                listingKeys: Object.keys(listing).length + ' keys total',
                hasDescription: 'description' in listing,
                hasCategory: 'category' in listing
              });
              
              existingOverrides[listing.id] = listing;
              
              // Test localStorage write
              const testData = JSON.stringify(existingOverrides);
              console.log('💾 Attempting to save to localStorage, data size:', testData.length);
              
              localStorage.setItem('agriconnect-myanmar-product-overrides', testData);
              
              console.log('✅ Successfully saved to localStorage');
              
              // Verify the save worked
              const verification = localStorage.getItem('agriconnect-myanmar-product-overrides');
              console.log('✅ Verification: localStorage contains', verification ? 'data' : 'no data');
            } catch (storageError) {
              console.error('❌ localStorage error:', storageError);
              if (storageError instanceof DOMException && storageError.code === 22) {
                throw new Error('Storage quota exceeded. Please try with a smaller image or clear browser data.');
              }
              throw new Error('Failed to save to local storage. The image may be too large.');
            }
            
            // Also update local products if it exists there
            setLocalProducts(prev => 
              prev.some(p => p.id === listing.id) 
                ? prev.map(p => p.id === listing.id ? listing : p)
                : prev
            );
          } else {
            console.log('🔄 Updating in local products state');
            // Update in local products
            setLocalProducts(prev => 
              prev.map(p => p.id === listing.id ? listing : p)
            );
          }
        } else {
          console.log('➕ Adding new product');
          // Add new listing to local state
          const newProduct = {
            ...listing,
            id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            lastUpdated: new Date().toISOString().split('T')[0],
            sellerId: currentUser?.id || listing.sellerId
          };
          setLocalProducts(prev => [newProduct, ...prev]);
          console.log('✅ Added new product:', newProduct.id);
        }
        
        console.log('🎉 Product operation completed successfully');
        toast.success(listing.isEditing ? 'Product updated successfully!' : 'Product added successfully!');
      } else {
        console.log('🌐 Backend mode: using API');
        // Backend mode: use backend functions
        if (listing.isEditing) {
          await updateProduct(listing.id, listing);
          toast.success('Product updated successfully!');
        } else {
          await createProduct(listing);
          toast.success('Product added successfully!');
        }
      }
      
      // Clear editing state and navigate back to where we came from
      console.log('🧹 Clearing editing state and navigating back to:', previousView);
      setEditingProduct(null);
      setCurrentView(previousView);
    } catch (error) {
      console.error('❌ Product operation failed:', error);
      
      if (error instanceof Error) {
        toast.error(`Failed to save product: ${error.message}`);
      } else {
        toast.error('Failed to save product. Please try again.');
      }
      throw error;
    }
  }, [createProduct, updateProduct, backendAvailable, backendProducts, previousView, currentUser]);

  const handleEditListing = useCallback((product: Product) => {
    console.log('✏️ Edit Product:', product.id);
    console.log('Edit Listing clicked:', product.id);
    if (!currentUser) {
      setAuthModal('login');
      return;
    }

    // Only allow farmers and traders to edit listings
    if (currentUser.userType === 'buyer') {
      return;
    }

    // Debug: Check where this product comes from
    const isDemoProduct = demoProducts.some(p => p.id === product.id);
    const isFreshDemoProduct = freshDemoProducts.some(p => p.id === product.id);
    const isLocalProduct = localProducts.some(p => p.id === product.id);
    
    console.log('🔍 Product source analysis:', {
      id: product.id,
      name: product.name,
      isDemoProduct,
      isFreshDemoProduct,
      isLocalProduct,
      originalProduct: product
    });

    // Make sure we're working with the latest product data from allProducts
    // This ensures we get any localStorage overrides
    const productToEdit = allProducts.find(p => p.id === product.id);
    
    if (!productToEdit) {
      console.error('❌ Product not found in allProducts:', product.id);
      toast.error('Product not found. Please refresh and try again.');
      return;
    }

    console.log('📦 Product to edit:', {
      id: productToEdit.id,
      name: productToEdit.name,
      description: productToEdit.description?.substring(0, 50) + '...' || 'UNDEFINED',
      category: productToEdit.category || 'UNDEFINED',
      hasImage: !!productToEdit.image,
      source: 'from allProducts (includes overrides)',
      descriptionType: typeof productToEdit.description,
      categoryType: typeof productToEdit.category
    });

    setEditingProduct(productToEdit);
    setPreviousView(currentView);
    setCurrentView('add-listing');
  }, [allProducts, currentView, currentUser, demoProducts, freshDemoProducts, localProducts]);

  const handleShowAddListing = useCallback(() => {
    console.log('🚀 handleShowAddListing called');
    console.log('Current user:', currentUser?.email, currentUser?.userType);
    console.log('Current view:', currentView);
    
    if (!currentUser) {
      console.log('❌ No current user - showing login modal');
      setAuthModal('login');
      return;
    }

    // Only allow farmers and traders to create listings
    if (currentUser.userType === 'buyer') {
      console.log('❌ User is buyer - cannot create listings');
      return;
    }

    console.log('✅ Setting up add listing form');
    setEditingProduct(null);
    setPreviousView(currentView);
    setCurrentView('add-listing');
    console.log('✅ View changed to add-listing');
  }, [currentView, currentUser]);



  const handleDeleteListing = useCallback(async (productId: string) => {
    console.log('Deleting product:', productId);
    try {
      // Check if we're in demo mode (backend not available)
      if (!backendAvailable || !backendProducts || backendProducts.length === 0) {
        // Demo mode: handle locally
        const isInDemoProducts = demoProducts.some(p => p.id === productId);
        const isInFreshDemoProducts = freshDemoProducts.some(p => p.id === productId);
        
        if (isInDemoProducts || isInFreshDemoProducts) {
          // For demo products (both original and fresh), mark as deleted in localStorage
          const existingDeleted = JSON.parse(localStorage.getItem('agriconnect-myanmar-deleted-products') || '[]');
          if (!existingDeleted.includes(productId)) {
            existingDeleted.push(productId);
            localStorage.setItem('agriconnect-myanmar-deleted-products', JSON.stringify(existingDeleted));
          }
          
          // Also remove from local products if it exists there
          setLocalProducts(prev => prev.filter(p => p.id !== productId));
        } else {
          // Remove from local products only (user-added products)
          setLocalProducts(prev => prev.filter(p => p.id !== productId));
        }
        console.log('Deleted product in demo mode:', productId);
        toast.success('Product deleted successfully');
      } else {
        // Backend mode: use backend function
        await deleteProduct(productId);
        toast.success('Product deleted successfully');
      }
    } catch (error) {
      console.error('Delete product failed:', error);
      toast.error('Failed to delete product');
      throw error;
    }
  }, [deleteProduct, backendAvailable, backendProducts]);

  // Navigation handlers
  const handleChat = useCallback(async (productId: string) => {
    if (!currentUser) {
      setAuthModal('login');
      return;
    }

    // Chat is now open to all users - no verification blocking
    // Warnings and trust indicators are shown in the chat interface
    try {
      const product = allProducts.find(p => p.id === productId);
      if (product) {
        await startConversation(product.sellerId, productId);
        setSelectedChat(productId);
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      if (error instanceof Error && !error.message.includes('Not authenticated')) {
        toast.error('Failed to start conversation. Please try again.');
      }
    }
  }, [currentUser, allProducts, startConversation]);

  const handleViewDetails = useCallback((productId: string) => {
    setSelectedProductId(productId);
    setCurrentView("product-details");
  }, []);

  const handlePriceCompare = useCallback((productId: string) => {
    setSelectedProductId(productId);
    setCurrentView("price-comparison");
  }, []);

  const handleBackToMarketplace = useCallback(() => {
    console.log('Marketplace button clicked');
    setSelectedProductId(null);
    setSelectedChat(null);
    setCurrentView("marketplace");
  }, []);

  const handleGoToDashboard = useCallback(() => {
    setSelectedProductId(null);
    setSelectedChat(null);
    setSelectedSellerId(null);
    if (currentUser?.userType === 'farmer' || currentUser?.userType === 'trader') {
      setCurrentView('dashboard');
    } else if (currentUser?.userType === 'admin') {
      setCurrentView('marketplace'); // Admins use marketplace as their dashboard with admin controls
    } else {
      setCurrentView('marketplace');
    }
  }, [currentUser]);

  const handleEditProfile = useCallback(() => {
    // Profile editing is now handled inline
    // This function can be used for any additional editing logic if needed
    console.log('Edit profile clicked - using inline editing');
  }, []);

  const handleViewProfile = useCallback(() => {
    setCurrentView('profile');
  }, []);

  const handleViewMessages = useCallback(() => {
    setCurrentView('messages');
  }, []);

  const handleShowVerification = useCallback((initialStep: number = 1) => {
    setVerificationInitialStep(initialStep);
    setCurrentView('verification');
  }, []);

  const handleShowAdminVerification = useCallback(() => {
    setCurrentView('admin-verification');
  }, []);

  const handleEditStorefrontImage = useCallback(async () => {
    // Create a temporary file input to handle image selection
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !currentUser) return;

      try {
        // For demo mode, we'll use a URL.createObjectURL to simulate image upload
        const imageUrl = URL.createObjectURL(file);
        
        // Update user profile with new storefront image
        await handleUpdateUser({
          ...currentUser,
          storefrontImage: imageUrl
        });

        console.log('Storefront image updated successfully');
      } catch (error) {
        console.error('Failed to update storefront image:', error);
      }
    };
    input.click();
  }, [currentUser, handleUpdateUser]);

  const handleBackToProfile = useCallback(() => {
    setCurrentView('profile');
    // Scroll to top when returning to profile page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleGoToRegister = useCallback(() => {
    setCurrentView('register');
  }, []);

  const handleGoToLogin = useCallback(() => {
    setCurrentView('login');
  }, []);

  const handleGoToForgotPassword = useCallback(() => {
    setCurrentView('forgot-password');
  }, []);

  const handleBackToProductDetails = useCallback(() => {
    if (selectedProductId) {
      setCurrentView("product-details");
    } else {
      handleBackToMarketplace();
    }
  }, [selectedProductId, handleBackToMarketplace]);

  const handleViewStorefront = useCallback((sellerId: string) => {
    setSelectedSellerId(sellerId);
    setCurrentView("seller-storefront");
  }, []);

  const handleBackToStorefront = useCallback(() => {
    if (selectedSellerId) {
      setCurrentView("seller-storefront");
    } else {
      handleBackToMarketplace();
    }
  }, [selectedSellerId, handleBackToMarketplace]);

  const handleBackFromAddListing = useCallback(() => {
    setEditingProduct(null);
    setCurrentView(previousView);
  }, [previousView]);

  // Generate price comparison data with memoization
  const priceComparisonData = useMemo(() => {
    if (!productToView) return [];
    const basePrice = productToView.price || 45000;
    
    // Real listings for the same product
    const realListings = allProducts
      .filter(p => p.name === productToView.name)
      .map(product => ({
        id: product.id,
        sellerName: product.sellerName,
        sellerType: product.sellerType,
        price: product.price,
        location: product.location,
        quantity: product.quantity,
        lastUpdated: product.lastUpdated
      }));
    
    // Add mock data
    const mockData = generatePriceComparisonData(productToView.name, basePrice);
    
    return [...realListings, ...mockData];
  }, [productToView, allProducts]);

  // Show loading screen during initial backend check and auth
  if (backendChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto animate-pulse">
            <Leaf className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-semibold">AgriLink</h2>
          <p className="text-muted-foreground">Connecting to server...</p>
          <div className="w-32 h-1 bg-muted rounded-full mx-auto overflow-hidden">
            <div className="w-full h-full bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }



  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">AgriLink</h1>
                <p className="text-sm text-muted-foreground">Linking agriculture to opportunity</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              

              
              {/* Mobile Navigation - Compact */}
              <div className="flex md:hidden items-center gap-1">
                {currentView !== 'marketplace' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleBackToMarketplace}
                    className="px-2"
                  >
                    Home
                  </Button>
                )}
              </div>
              
              {/* Desktop Navigation - Full labels */}
              <div className="hidden md:flex items-center gap-2">
                <Button 
                  variant={currentView === 'marketplace' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={handleBackToMarketplace}
                >
                  Marketplace
                </Button>
                
                {/* User-specific navigation when logged in */}
                {currentUser && (
                  <>
                    {(currentUser.userType === 'farmer' || currentUser.userType === 'trader') && (
                      <Button 
                        variant={currentView === 'dashboard' ? 'default' : 'ghost'} 
                        size="sm"
                        onClick={handleGoToDashboard}
                      >
                        Dashboard
                      </Button>
                    )}
                    {currentUser.userType === 'admin' && (
                      <Button 
                        variant={currentView === 'marketplace' ? 'default' : 'ghost'} 
                        size="sm"
                        onClick={handleGoToDashboard}
                      >
                        Admin Panel
                      </Button>
                    )}
                    {currentView === 'profile' && (
                      <Button 
                        variant="default"
                        size="sm"
                        disabled
                      >
                        Profile
                      </Button>
                    )}

                    {currentView === 'add-listing' && (
                      <Button 
                        variant="default"
                        size="sm"
                        disabled
                      >
                        {editingProduct ? 'Edit Listing' : 'Add Listing'}
                      </Button>
                    )}
                    {currentView === 'messages' && (
                      <Button 
                        variant="default"
                        size="sm"
                        disabled
                      >
                        Messages
                      </Button>
                    )}
                    {currentView === 'verification' && (
                      <Button 
                        variant="default"
                        size="sm"
                        disabled
                      >
                        Verification
                      </Button>
                    )}
                    {currentView === 'admin-verification' && (
                      <Button 
                        variant="default"
                        size="sm"
                        disabled
                      >
                        Admin Verification
                      </Button>
                    )}
                  </>
                )}
                
                {/* Current page indicators for non-auth pages */}
                {!currentUser && currentView === 'forgot-password' && (
                  <Button 
                    variant="ghost"
                    size="sm"
                    disabled
                  >
                    Reset Password
                  </Button>
                )}
              </div>
              
              {/* Authentication Buttons */}
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden md:inline">
                    Welcome, {currentUser.name.split(' ')[0]}
                  </span>
                  <UserMenu 
                    user={currentUser} 
                    onLogout={handleLogout}
                    onViewStorefront={handleViewStorefront}
                    onUpdateUser={handleUpdateUser}
                    onGoToDashboard={handleGoToDashboard}
                    onShowVerification={handleShowVerification}
                    onEditProfile={handleEditProfile}
                    onViewProfile={handleViewProfile}
                    onViewMessages={handleViewMessages}
                    onShowAdminVerification={handleShowAdminVerification}
                  />
                </div>
              ) : (
                // Always show auth buttons
                <div className="flex items-center gap-1 md:gap-2">
                  {/* Mobile: Icon only buttons */}
                  <Button 
                    variant={currentView === 'login' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={handleGoToLogin} 
                    className="md:hidden px-2"
                  >
                    <LogIn className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={currentView === 'register' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={handleGoToRegister} 
                    className="md:hidden px-2"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                  
                  {/* Desktop: Full label buttons */}
                  <Button 
                    variant={currentView === 'login' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={handleGoToLogin} 
                    className="hidden md:flex"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                  <Button 
                    variant={currentView === 'register' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={handleGoToRegister} 
                    className="hidden md:flex"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4">
        <div className="pt-8 pb-16 min-h-[calc(100vh-200px)]">
        
          {currentView === "login" && (
            <div className="max-w-2xl mx-auto">
              <Login
                onLogin={handleLogin}
                onSwitchToRegister={handleGoToRegister}
                onForgotPassword={handleGoToForgotPassword}
                onClose={handleBackToMarketplace}
              />
            </div>
          )}

          {currentView === "register" && (
            <div className="max-w-2xl mx-auto">
              <Register
                onRegister={handleRegister}
                onSwitchToLogin={handleGoToLogin}
                onClose={handleBackToMarketplace}
              />
            </div>
          )}

          {currentView === "forgot-password" && (
            <div className="max-w-2xl mx-auto">
              <ForgotPassword
                onBack={handleGoToLogin}
                onReturnToLogin={handleGoToLogin}
              />
            </div>
          )}

        {currentView === "profile" && currentUser && (
          <div className="max-w-6xl mx-auto">
            <Profile
              user={currentUser}
              onBack={handleBackToMarketplace}
              onEditProfile={handleEditProfile}
              onShowVerification={handleShowVerification}
              onUpdate={handleUpdateUser}
            />
          </div>
        )}



        {currentView === "add-listing" && currentUser && (
          <div className="max-w-7xl mx-auto">
            <ComprehensiveProductForm
              currentUser={currentUser}
              onBack={handleBackFromAddListing}
              onSave={handleAddListing}
              editingProduct={editingProduct}
            />
          </div>
        )}

        {currentView === "dashboard" && currentUser && (currentUser.userType === 'farmer' || currentUser.userType === 'trader') && (
          <FreshDashboard
            user={currentUser}
            userProducts={allProducts.filter(p => p.sellerId === currentUser.id)}
            onAddListing={handleShowAddListing}
            onEditListing={handleEditListing}
            onDeleteListing={handleDeleteListing}
            onViewStorefront={() => handleViewStorefront(currentUser.id)}
            onGoToMarketplace={handleBackToMarketplace}
            onViewProduct={handleViewDetails}
            onShowVerification={handleShowVerification}
            onViewMessages={handleViewMessages}
          />
        )}

        {currentView === "messages" && currentUser && (
          <div className="max-w-6xl mx-auto">
            <Messages
              currentUser={currentUser}
              onBack={handleBackToMarketplace}
              onStartChat={handleChat}
            />
          </div>
        )}

          {currentView === "verification" && currentUser && (
            <div className="max-w-4xl mx-auto">
              {currentUser.userType === 'buyer' ? (
                <BuyerVerification
                  currentUser={currentUser}
                  onClose={handleBackToProfile}
                  onUpdate={handleUpdateUser}
                />
              ) : currentUser.accountType ? (
                <AccountTypeVerification
                  currentUser={currentUser}
                  onClose={handleBackToProfile}
                  onUpdate={handleUpdateUser}
                />
              ) : (
                <SplitVerificationPage
                  currentUser={currentUser}
                  onClose={handleBackToProfile}
                  onUpdate={handleUpdateUser}
                />
              )}
            </div>
          )}

        {currentView === "admin-verification" && currentUser && isAdmin && (
          <div className="max-w-7xl mx-auto">
            <AdminVerificationPanel
              currentAdmin={currentUser}
              onBack={handleBackToMarketplace}
            />
          </div>
        )}

        {currentView === "marketplace" && (
          <div className="space-y-8">
            {/* Hero Section - Compact Design */}
            <section className="relative py-8 lg:py-12 overflow-hidden">
              {/* Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-stone-700/5 to-amber-900/5"></div>
              <div className="absolute top-6 right-6 w-32 h-32 bg-stone-700/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-6 left-6 w-40 h-40 bg-amber-900/10 rounded-full blur-2xl"></div>
              
              <div className="relative max-w-5xl mx-auto text-center space-y-6">
                {/* Header */}
                <div className="space-y-3">
                  <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                    <span className="text-foreground">Connect. </span>
                    <span className="text-primary">Discover. </span>
                    <span className="text-foreground">Thrive.</span>
                  </h1>
                  
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Connecting producers, distributors, businesses, and consumers across Myanmar. 
                    Quality products, transparent pricing, and trusted partnerships for all.
                  </p>
                </div>
                
                {/* Action Buttons */}
                {!currentUser ? (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <Button size="lg" onClick={handleGoToRegister} 
                            className="px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                      Get Started <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleGoToLogin} 
                            className="px-6 py-4 rounded-xl">
                      Sign In
                    </Button>
                  </div>
                ) : (
                  <div className="bg-card/50 backdrop-blur border rounded-2xl p-4 max-w-2xl mx-auto">
                    <p className="text-foreground mb-2">
                      Welcome back, <span className="font-semibold text-primary">{currentUser.name.split(' ')[0]}</span>! 
                    </p>
                    <p className="text-muted-foreground mb-3 text-sm">
                      {currentUser.userType === 'farmer' 
                        ? 'Ready to share your fresh products with customers across Myanmar?' 
                        : currentUser.userType === 'trader'
                        ? 'Ready to connect buyers with quality agricultural products?'
                        : 'Discover fresh products and connect directly with local farmers and suppliers.'
                      }
                    </p>
                    {(currentUser.userType === 'farmer' || currentUser.userType === 'trader') && (
                      <Button size="lg" onClick={handleShowAddListing} 
                              className="px-6 py-3 rounded-xl">
                        List Your Products <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}

                {/* Platform Features - Compact */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6">
                  <div className="bg-card/30 backdrop-blur border rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-foreground">{allProducts.length}+</div>
                    <div className="text-xs text-muted-foreground">Fresh Products</div>
                  </div>
                  
                  <div className="bg-card/30 backdrop-blur border rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-foreground">Connected</div>
                    <div className="text-xs text-muted-foreground">Supply Network</div>
                  </div>
                  
                  <div className="bg-card/30 backdrop-blur border rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-foreground">Fair</div>
                    <div className="text-xs text-muted-foreground">Transparent Pricing</div>
                  </div>
                  
                  <div className="bg-card/30 backdrop-blur border rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-foreground">Local</div>
                    <div className="text-xs text-muted-foreground">Myanmar Grown</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Search and Products Section */}
            <section className="space-y-6">

              {isAdmin && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-primary">
                    🛠️ Admin Dashboard - Product Management Mode Active
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You have administrator privileges to manage all products on the platform
                  </p>
                </div>
              )}
              
              <SearchFilters 
                filters={filters}
                onFiltersChange={setFilters}
                activeFiltersCount={getActiveFiltersCount}
              />
              

              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const verificationStatus = getSellerVerificationStatus(product.sellerId);
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onChat={handleChat}
                      onViewDetails={handleViewDetails}
                      onViewStorefront={handleViewStorefront}
                      onDelete={isAdmin ? handleDeleteListing : undefined}
                      currentUserId={currentUser?.id}
                      sellerVerified={verificationStatus.verified}
                      sellerVerificationStatus={verificationStatus}
                      adminMode={isAdmin}
                    />
                  );
                })}
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No products found matching your criteria.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setFilters({
                      search: '',
                      category: '',
                      location: '',
                      region: '',
                      city: '',
                      sellerType: '',
                      priceRange: '',
                      sortBy: 'newest'
                    })}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </section>
          </div>
        )}

        {currentView === "product-details" && productToView && (() => {
          const productSellerVerificationStatus = getSellerVerificationStatus(productToView.sellerId);
          
          // Get seller profile data from available sources
          let sellerProfile: any = null;
          
          // Check if it's the current user first
          if (productToView.sellerId === currentUser?.id) {
            sellerProfile = {
              id: currentUser.id,
              name: currentUser.businessName || currentUser.name,
              businessName: currentUser.businessName,
              userType: currentUser.userType,
              location: currentUser.location,
              experience: currentUser.experience,
              joinedDate: (currentUser as any).joinedDate || 'Recently',
              rating: (currentUser as any).rating || 4.2,
              totalReviews: (currentUser as any).totalReviews || 12,
              yearsActive: currentUser.experience ? parseInt(currentUser.experience.split(' ')[0]) || 1 : 3,
              responseTime: currentUser.userType === 'farmer' ? '3 hours' : '1 hour',
              phone: (currentUser as any).phone || `+95 9 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`,
              openingHours: (currentUser as any).openingHours || '9 AM - 6 PM'
            };
          } else {
            // Check in fresh demo accounts
            const demoAccount = freshDemoAccounts.find(account => account.id === productToView.sellerId);
            if (demoAccount) {
              sellerProfile = {
                id: demoAccount.id,
                name: demoAccount.businessName || demoAccount.name,
                businessName: demoAccount.businessName,
                userType: demoAccount.userType,
                location: demoAccount.location,
                experience: demoAccount.experience,
                joinedDate: demoAccount.joinedDate,
                rating: 4.2 + Math.random() * 0.6, // 4.2-4.8 range for demo
                totalReviews: Math.floor(Math.random() * 40) + 10, // 10-50 reviews
                yearsActive: demoAccount.experience ? parseInt(demoAccount.experience.split(' ')[0]) || 1 : 3,
                responseTime: demoAccount.userType === 'farmer' ? '3 hours' : '1 hour',
                phone: `+95 9 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`,
                openingHours: (demoAccount as any).openingHours || '9 AM - 6 PM'
              };
            } else {
              // Check in sellers data
              const seller = sellers.find(s => s.id === productToView.sellerId);
              if (seller) {
                sellerProfile = {
                  id: seller.id,
                  name: seller.name,
                  businessName: seller.name,
                  userType: seller.type,
                  location: seller.location,
                  experience: `${seller.yearsActive} years`,
                  joinedDate: seller.joinedDate,
                  rating: seller.rating,
                  totalReviews: seller.totalReviews,
                  yearsActive: seller.yearsActive,
                  responseTime: seller.responseTime,
                  phone: `+95 9 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`,
                  openingHours: (seller as any).openingHours || '9 AM - 6 PM'
                };
              }
            }
          }
          
          return (
            <ProductDetails
              product={productToView}
              onBack={handleBackToMarketplace}
              onChat={handleChat}
              onPriceCompare={handlePriceCompare}
              onViewStorefront={handleViewStorefront}
              onEditProduct={handleEditListing}
              currentUserId={currentUser?.id}
              isUserVerified={currentUser?.verified || false}
              userType={currentUser?.userType}
              isPhoneVerified={currentUser?.phoneVerified || false}
              sellerVerified={productSellerVerificationStatus.verified}
              sellerVerificationStatus={productSellerVerificationStatus}
              sellerProfile={sellerProfile}
            />
          );
        })()}

        {currentView === "price-comparison" && productToView && (
          <PriceComparison
            productName={productToView.name}
            priceData={priceComparisonData}
            unit={productToView.unit}
            onBack={handleBackToProductDetails}
            isOwnProduct={currentUser?.id === productToView.sellerId}
          />
        )}

        {currentView === "seller-storefront" && selectedSellerId && (() => {
          // Get seller info - either current user or from sellers data
          const sellerInfo = selectedSellerId === currentUser?.id 
            ? {
                id: currentUser.id,
                name: currentUser.businessName || currentUser.name,
                type: currentUser.userType,
                location: currentUser.location,
                description: currentUser.businessDescription || `${currentUser.userType} in ${currentUser.location}`,
                image: (currentUser as any).storefrontImage || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
                rating: (currentUser as any).rating || 0,
                totalReviews: (currentUser as any).totalReviews || 0,
                yearsActive: parseInt(currentUser.experience?.split(' ')[0] || '1'),
                responseTime: '1 hour',
                certifications: currentUser.qualityCertifications || [],
                joinedDate: (currentUser as any).joinedDate || 'Recently',
                verified: currentUser.verified || false
              }
            : sellers.find(s => s.id === selectedSellerId);

          // If no seller found, show error message
          if (!sellerInfo) {
            return (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Seller not found.</p>
                <Button onClick={handleBackToMarketplace}>
                  Back to Marketplace
                </Button>
              </div>
            );
          }

          return (
            <SellerStorefront
              seller={sellerInfo}
              products={allProducts.filter(p => p.sellerId === selectedSellerId)}
              onBack={handleBackToMarketplace}
              onViewProduct={handleViewDetails}
              onChat={handleChat}
              isOwnStorefront={selectedSellerId === currentUser?.id}
              onEditStorefrontImage={selectedSellerId === currentUser?.id ? handleEditStorefrontImage : undefined}
            />
          );
        })()}
        </div>
      </main>

      {/* Chat Interface - Mobile-First Design */}
      {selectedChat && selectedProduct && (() => {
        // Find seller info to get verification status
        const seller = selectedProduct.sellerId === currentUser?.id 
          ? currentUser 
          : sellers.find(s => s.id === selectedProduct.sellerId);
        
        // Get seller's verification status for chat warnings
        const sellerVerificationStatus = getSellerVerificationStatus(selectedProduct.sellerId);
        
        return (
          <>
            {/* Mobile: Full screen overlay */}
            <div className="fixed inset-0 bg-card shadow-2xl border-l border-t z-50 transition-transform duration-300 md:hidden">
              <ChatInterface
                sellerName={selectedProduct.sellerName}
                sellerType={selectedProduct.sellerType}
                sellerLocation={selectedProduct.location}
                sellerRating={4.5}
                productName={selectedProduct.name}
                onClose={() => setSelectedChat(null)}
                sellerVerified={seller?.verified || false}
                currentUserVerified={currentUser?.verified || false}
                currentUserType={currentUser?.userType}
                sellerVerificationStatus={sellerVerificationStatus}
              />
            </div>
            
            {/* Desktop: Side panel */}
            <div className="hidden md:block fixed right-0 bottom-0 h-[600px] w-96 bg-card shadow-2xl border-l border-t z-50 transition-transform duration-300">
              <ChatInterface
                sellerName={selectedProduct.sellerName}
                sellerType={selectedProduct.sellerType}
                sellerLocation={selectedProduct.location}
                sellerRating={4.5}
                productName={selectedProduct.name}
                onClose={() => setSelectedChat(null)}
                sellerVerified={seller?.verified || false}
                currentUserVerified={currentUser?.verified || false}
                currentUserType={currentUser?.userType}
                sellerVerificationStatus={sellerVerificationStatus}
              />
            </div>
          </>
        );
      })()}

      {/* Authentication Modals */}
      {authModal === 'register' && (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={handleGoToLogin}
          onClose={() => setAuthModal(null)}
        />
      )}





      {/* Verification Prompt Modal */}
      {verificationPrompt.show && (
        <VerificationPrompt
          feature={verificationPrompt.feature}
          sellerName={verificationPrompt.sellerName}
          userType={currentUser?.userType}
          onClose={() => setVerificationPrompt({ show: false, feature: 'chat' })}
          onStartVerification={() => {
            setVerificationPrompt({ show: false, feature: 'chat' });
            handleShowVerification();
          }}
        />
      )}



      {/* Compact Footer */}
      <footer className="border-t bg-card mt-8">
        <div className="container mx-auto px-4 py-6">
          {/* Core Mission Statement */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Leaf className="w-5 h-5 text-primary" />
              <span className="font-semibold">Connecting Myanmar's Agricultural Community</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Transparent pricing • Direct connections • Quality products • Trusted marketplace
            </p>
          </div>

          {/* Key Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sprout className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">For Farmers</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Direct sales • Fair pricing • Wider market reach
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Truck className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">For Traders</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Quality sourcing • Efficient distribution • Network growth
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <ShoppingCart className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">For Buyers</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Fresh products • Competitive prices • Verified sellers
              </p>
            </div>
          </div>
          
        </div>
        
        {/* Full-width separator */}
        <div className="border-t"></div>
        
        {/* Project Information */}
        <div className="container mx-auto px-4 py-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">
              <p>© 2024 AgriLink - Academic Project developed in partnership with Infinity Success Co. Ltd.</p>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
    </ErrorBoundary>
  );
}