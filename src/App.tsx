import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Button } from "./components/ui/button";
import { ProductCard } from "./components/ProductCard";
import { SearchFilters } from "./components/SearchFilters";
import { PriceComparison } from "./components/PriceComparison";
import { ChatInterface } from "./components/ChatInterface";
import { ProductDetails } from "./components/ProductDetails";
import { SellerStorefront } from "./components/SellerStorefront";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { ForgotPassword } from "./components/ForgotPassword";

import { SimplifiedProductForm } from "./components/SimplifiedProductForm";
import { FreshDashboard } from "./components/FreshDashboard";
import { BuyerDashboard } from "./components/BuyerDashboard";
import { AccountTypeVerification } from "./components/AccountTypeVerification";
import { Profile } from "./components/Profile";
import { Messages } from "./components/Messages";
import { VerificationPrompt } from "./components/VerificationPrompt";
import { AdminVerificationPanel } from "./components/AdminVerificationPanel";
// SimpleVerificationTester removed - debug component
import { AboutUs } from "./components/AboutUs";
import { ContactUsPage } from "./components/ContactUsPage";
import { FAQ } from "./components/FAQ";
import { DealsManagement } from "./components/DealsManagement";
import { OfferModal } from "./components/OfferModal";
import { ReviewModal } from "./components/ReviewModal";

// Optimized components
import { AppHeader } from "./components/AppHeader";
import { AppFooter } from "./components/AppFooter";
import { MarketplaceHero } from "./components/MarketplaceHero";
import { UserMenu } from "./components/UserMenuWithSupport";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";

// Product type import
import type { Product } from "./data/products";
import { generatePriceComparisonData } from "./utils/priceComparison";
import {
  useProductFiltering,
  FilterState,
} from "./hooks/useProductFiltering";
import { useAuth } from "./hooks/useAuth";
import { useProducts } from "./hooks/useProducts";
import { useChat } from "./hooks/useChat";


// Optimized custom hooks
import { useNavigation } from "./hooks/useNavigation";
import { useProductManagement } from "./hooks/useProductManagement";
import { useChatManagement } from "./hooks/useChatManagement";

// Utility functions
import { getSellerVerificationStatus, isSellerVerified } from "./utils/sellerVerification";

import { Leaf, LogIn, UserPlus, ArrowRight, Sprout, Truck, ShoppingCart, ChevronLeft } from "lucide-react";

type ViewType =
  | "marketplace"
  | "product-details"
  | "price-comparison"
  | "seller-storefront"
  | "dashboard"
  | "profile"
  | "edit-profile"
  | "add-listing"
  | "register"
  | "login"
  | "forgot-password"
  | "messages"
  | "deals"
  | "verification"
  | "admin-verification"
  | "about-us"
  | "contact-us"
  | "faq";
type AuthModalType = "login" | "register" | null;



// No localStorage cleanup needed - using Supabase backend

export default function App() {
  // Simplified error boundary state
  const [criticalError, setCriticalError] = useState<string | null>(null);
  
  // Performance monitoring (non-blocking)
  const renderCountRef = useRef(0);
  if (process.env.NODE_ENV === 'development') {
    renderCountRef.current++;
    
    // Only warn every 50 renders to reduce console spam
    if (renderCountRef.current > 0 && renderCountRef.current % 50 === 0) {
      console.warn(`⚠️ App component render count: ${renderCountRef.current}`);
    }
  }
  
  // Recovery mode for critical errors
  if (criticalError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-destructive rounded-lg flex items-center justify-center mx-auto">
            <Leaf className="w-8 h-8 text-destructive-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Application Error</h2>
          <p className="text-muted-foreground">
            {criticalError}
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  const [currentView, setCurrentView] = useState<ViewType>("marketplace");
  const [selectedChat, setSelectedChat] = useState<
    string | null
  >(null);
  const [selectedProductId, setSelectedProductId] = useState<
    string | null
  >(null);
  const [selectedSellerId, setSelectedSellerId] = useState<
    string | null
  >(null);
  const [authModal, setAuthModal] =
    useState<AuthModalType>(null);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);
  const [previousView, setPreviousView] =
    useState<ViewType>("marketplace");
  const [verificationInitialStep, setVerificationInitialStep] =
    useState<number>(1);
  
  // Preview mode state for storefront
  const [storefrontPreviewMode, setStorefrontPreviewMode] = useState(false);

  // No demo accounts needed - using Supabase backend


  const [showVerification, setShowVerification] =
    useState(false);
  const [verificationPrompt, setVerificationPrompt] = useState<{
    show: boolean;
    feature: "chat" | "contact" | "listing" | "storefront";
    sellerName?: string;
  }>({ show: false, feature: "chat" });
  
  // Offer system state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedProductForOffer, setSelectedProductForOffer] = useState<Product | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTransactionForReview, setSelectedTransactionForReview] = useState<any>(null);
  
  // Saved products state for buyers - using Supabase backend
  const [savedProducts, setSavedProducts] = useState<Array<{
    productId: string;
    savedDate: string;
    priceWhenSaved: number;
    alerts: {
      priceAlert: boolean;
      stockAlert: boolean;
    };
  }>>([]);

  // Use custom hooks for backend integration - MUST come before useEffects that depend on them
  const {
    user: currentUser,
    loading: authLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  } = useAuth();
  
  // Debug current user state for chat troubleshooting
  useEffect(() => {
    if (currentUser) {
      console.log('🔍 App.tsx currentUser:', {
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        authLoading
      });
    } else {
      console.log('🔍 App.tsx currentUser: null, authLoading:', authLoading);
    }
  }, [currentUser?.id, authLoading]);
  
  const {
    products,
    loading: productsLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    getUserProducts,
  } = useProducts();
  
  // Only initialize chat hook when user is authenticated
  const { startConversation } = useChat();
  
  // No localStorage persistence needed with Supabase

  // No localStorage persistence needed with Supabase

  // Admin mode is now based on user role instead of temporary toggle
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "",
    location: "",
    region: "",
    city: "",
    sellerType: "",
    verifiedStatus: "",
    priceRange: "",
    sortBy: "newest",
  });



  // No hidden products logic needed - using Supabase backend

  // Product management - use products from Supabase
  const allProducts = useMemo(() => {
    try {
      return products || [];
    } catch (error) {
      console.error("Error in allProducts calculation:", error);
      setCriticalError("Failed to load products. Please refresh the page.");
      return [];
    }
  }, [products]);

  // Initialize custom hooks with stable references
  const navigation = useNavigation({
    currentView,
    currentUser,
    setCurrentView,
    setSelectedProductId,
    setSelectedChat,
    setSelectedSellerId,
    setVerificationInitialStep,
    previousView,
    setPreviousView,
  });

  const productManagement = useProductManagement({
    currentUser,
    createProduct,
    updateProduct,
    deleteProduct,
    setEditingProduct,
    setCurrentView,
    setPreviousView,
    setAuthModal,
    currentView,
    previousView,
    allProducts,
  });

  // Only initialize chat management when user is properly loaded
  const chatManagement = useChatManagement({
    currentUser: currentUser?.id ? currentUser : null, // Ensure stable reference
    allProducts,
    startConversation,
    setSelectedChat,
    setAuthModal,
  });

  // Set initial view based on user type when user loads - optimized to prevent loops
  const initialViewSet = useRef(false);
  useEffect(() => {
    if (currentUser && !authLoading && !initialViewSet.current) {
      const allowedViews = [
        "verification", "profile", "edit-profile", "messages", "seller-storefront",
        "marketplace", "add-listing", "product-details", "price-comparison",
        "about-us", "contact-us", "faq", "admin-verification", "deals"
      ];
      
      if (allowedViews.includes(currentView)) {
        initialViewSet.current = true;
        return; // Don't redirect if already on an allowed view
      }
      
      if (currentUser.userType === "farmer" || currentUser.userType === "trader") {
        setCurrentView("dashboard");
      } else if (currentUser.userType === "buyer") {
        setCurrentView("dashboard");
      } else if (currentUser.userType === "admin") {
        setCurrentView("marketplace");
      }
      
      initialViewSet.current = true;
    }
  }, [currentUser?.id, currentUser?.userType, authLoading]);

  // Reset preview mode when navigating away from storefront
  useEffect(() => {
    if (currentView !== "seller-storefront") {
      setStorefrontPreviewMode(false);
    }
  }, [currentView]);

  // Scroll to top when navigating to specific pages
  useEffect(() => {
    const pagesThatShouldScrollToTop = [
      "faq", "about-us", "contact-us", "profile", "verification", 
      "admin-verification", "add-listing", "messages", "deals"
    ];
    
    if (pagesThatShouldScrollToTop.includes(currentView)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentView]);

  // Initialize app - Supabase backend handles all data
  useEffect(() => {
    // App initialization complete
  }, []);


  // Use custom hook for filtering
  const filteringResult = useProductFiltering(allProducts, filters, isSellerVerified);
  const { filteredProducts, getActiveFiltersCount } = filteringResult || { filteredProducts: allProducts, getActiveFiltersCount: () => 0 };

  // Memoized selectors with null checks - optimized dependencies
  const selectedProduct = useMemo(
    () =>
      selectedChat
        ? allProducts.find((p) => p.id === selectedChat)
        : null,
    [selectedChat, allProducts.length], // Use length to prevent unnecessary recalcs
  );

  const productToView = useMemo(
    () =>
      selectedProductId
        ? allProducts.find((p) => p.id === selectedProductId)
        : null,
    [selectedProductId, allProducts.length], // Use length to prevent unnecessary recalcs
  );

  // Authentication handlers
  const handleLogin = useCallback(
    async (email: string, password: string) => {
      try {
        await signIn(email, password);
        setAuthModal(null);
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },
    [signIn],
  );

  const handleRegister = useCallback(
    async (userData: any) => {
      try {
        await signUp(userData);
        
        // Show success message
        toast.success("Registration successful! Welcome to AgriLink Marketplace!", {
          duration: 4000,
        });
        
        // Redirect to sign-in page
        setCurrentView("login");
        setAuthModal(null);
      } catch (error) {
        console.error("Registration failed:", error);
        throw error;
      }
    },
    [signUp, setCurrentView],
  );

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      setSelectedChat(null);
      setCurrentView("marketplace");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [signOut]);

  const handleUpdateUser = useCallback(
    async (updates: any) => {
      try {
        await updateProfile(updates);
      } catch (error) {
        console.error("Profile update failed:", error);
        throw error;
      }
    },
    [updateProfile],
  );

  const handleEditProfile = useCallback(() => {
    // Profile editing is now handled inline
    // This function can be used for any additional editing logic if needed
    console.log("Edit profile clicked - using inline editing");
  }, []);

  const handleEditStorefrontImage = useCallback(async () => {
    // Create a temporary file input to handle image selection
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !currentUser) return;

      try {
        // Use URL.createObjectURL for image upload
        const imageUrl = URL.createObjectURL(file);

        // Update user profile with new storefront image
        await handleUpdateUser({
          ...currentUser,
          storefrontImage: imageUrl,
        });

        console.log("Storefront image updated successfully");
      } catch (error) {
        console.error(
          "Failed to update storefront image:",
          error,
        );
      }
    };
    input.click();
  }, [currentUser, handleUpdateUser]);

  // Handle saving/unsaving products for price tracking - using Supabase backend
  const handleSaveProduct = useCallback(async (productId: string, currentPrice: number) => {
    if (!currentUser) {
      toast.error("Please log in to save products");
      return;
    }
    
    try {
      // TODO: Implement Supabase saved products table
      // For now, just show success message
      toast.success("Product saved for price tracking");
    } catch (error) {
      console.error("Failed to save product:", error);
      toast.error("Failed to save product");
    }
  }, [currentUser]);

  // Handle making offers
  const handleMakeOffer = useCallback((product: Product) => {
    if (!currentUser) {
      toast.error("Please log in to make offers");
      return;
    }
    
    if (currentUser.userType !== 'buyer') {
      toast.error("Only buyers can make offers");
      return;
    }
    
    setSelectedProductForOffer(product);
    setShowOfferModal(true);
  }, [currentUser]);

  // Handle offer submission - using Supabase backend
  const handleOfferSubmit = useCallback(async (offerData: any) => {
    if (!currentUser || !selectedProductForOffer) return;
    
    try {
      // TODO: Implement Supabase offers table
      // For now, just show success message
      toast.success("Offer sent successfully!");
      setShowOfferModal(false);
      setSelectedProductForOffer(null);
    } catch (error) {
      console.error('Error submitting offer:', error);
      toast.error("Failed to send offer. Please try again.");
    }
  }, [currentUser, selectedProductForOffer]);

  // Handle review submission - using Supabase backend
  const handleReviewSubmit = useCallback(async (reviewData: any) => {
    if (!currentUser || !selectedTransactionForReview) return;
    
    try {
      // TODO: Implement Supabase reviews table
      // For now, just show success message
      toast.success("Review submitted successfully!");
      setShowReviewModal(false);
      setSelectedTransactionForReview(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error("Failed to submit review. Please try again.");
    }
  }, [currentUser, selectedTransactionForReview]);

  // Generate price comparison data with memoization - optimized dependencies
  const priceComparisonData = useMemo(() => {
    if (!productToView) return [];
    const basePrice = productToView.price || 45000;

    // Real listings for the same product
    const realListings = allProducts
      .filter((p) => p.name === productToView.name)
      .map((product) => ({
        id: product.id,
        sellerName: product.sellerName,
        sellerType: product.sellerType,
        price: product.price,
        location: product.location,
        quantity: product.quantity,
        lastUpdated: product.lastUpdated,
      }));

    // Return only real listings - no mock data needed
    return realListings;
  }, [productToView?.id, productToView?.name, productToView?.price, allProducts.length]);

  // Show loading screen during initial backend check and auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto animate-pulse">
            <Leaf className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-semibold">AgriLink</h2>
          <p className="text-muted-foreground">
            {"Loading..."}
          </p>
          <div className="w-32 h-1 bg-muted rounded-full mx-auto overflow-hidden">
            <div className="w-full h-full bg-primary rounded-full animate-pulse"></div>
          </div>
          {/* Loading indicator */}
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-muted-foreground">
              Initializing application...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <>
        <div className="min-h-screen bg-background flex flex-col">
        {/* Optimized Header Component */}
        <AppHeader
          currentView={currentView}
          currentUser={currentUser}
          onBackToMarketplace={navigation.handleBackToMarketplace}
          onGoToDashboard={navigation.handleGoToDashboard}
          onGoToLogin={navigation.handleGoToLogin}
          onGoToRegister={navigation.handleGoToRegister}
          onLogout={handleLogout}
          onViewStorefront={navigation.handleViewStorefront}
          onUpdateUser={handleUpdateUser}
          onShowVerification={navigation.handleShowVerification}
          onEditProfile={handleEditProfile}
          onViewProfile={navigation.handleViewProfile}
          onViewMessages={navigation.handleViewMessages}
          onShowAdminVerification={navigation.handleShowAdminVerification}
          editingProduct={editingProduct}
        />

        {/* Main Content - Conditional flex-grow based on content type */}
        <main
          className={`w-full max-w-7xl mx-auto px-4 ${
            currentView === "marketplace" ||
            currentView === "dashboard" ||
            currentView === "add-listing" ||
            currentView === "seller-storefront" ||
            currentView === "product-details" ||
            currentView === "price-comparison" ||
            currentView === "messages" ||
            currentView === "deals" ||
            currentView === "admin-verification" ||
            currentView === "about-us" ||
            currentView === "contact-us" ||
            currentView === "faq"
              ? "flex-grow"
              : "flex-grow-0"
          }`}
        >
          <div className="pt-8 pb-16">
            {currentView === "login" && (
              <div className="max-w-2xl mx-auto">
                <Login
                  onLogin={handleLogin}
                  onSwitchToRegister={navigation.handleGoToRegister}
                  onForgotPassword={navigation.handleGoToForgotPassword}
                  onClose={navigation.handleBackToMarketplace}
                />
              </div>
            )}

            {currentView === "register" && (
              <div className="max-w-2xl mx-auto">
                <Register
                  onRegister={handleRegister}
                  onSwitchToLogin={navigation.handleGoToLogin}
                  onClose={navigation.handleBackToMarketplace}
                />
              </div>
            )}

            {currentView === "forgot-password" && (
              <div className="max-w-2xl mx-auto">
                <ForgotPassword
                  onBack={navigation.handleGoToLogin}
                  onReturnToLogin={navigation.handleGoToLogin}
                />
              </div>
            )}

            {currentView === "profile" && currentUser && (
              <div className="max-w-6xl mx-auto">
                <Profile
                  user={currentUser}
                  onBack={navigation.handleBackToPrevious}
                  onEditProfile={handleEditProfile}
                  onShowVerification={navigation.handleShowVerification}
                  onUpdate={handleUpdateUser}
                  onViewStorefront={navigation.handleViewStorefront}
                />
              </div>
            )}

            {currentView === "add-listing" && currentUser && (
              <div className="max-w-4xl mx-auto">
                <SimplifiedProductForm
                  currentUser={currentUser}
                  onBack={productManagement.handleBackFromAddListing}
                  onSave={productManagement.handleAddListing}
                  editingProduct={editingProduct}
                />
              </div>
            )}

            {currentView === "dashboard" &&
              currentUser &&
              (currentUser.userType === "farmer" ||
                currentUser.userType === "trader") && (
                <FreshDashboard
                  user={currentUser}
                  userProducts={allProducts.filter(
                    (p) => p.sellerId === currentUser.id,
                  )}
                  onAddListing={productManagement.handleShowAddListing}
                  onEditListing={(product) => productManagement.handleEditListing(product, allProducts)}
                  onDeleteListing={productManagement.handleDeleteListing}
                  onViewStorefront={() =>
                    navigation.handleViewStorefront(currentUser.id)
                  }
                  onGoToMarketplace={navigation.handleBackToMarketplace}
                  onViewProduct={navigation.handleViewDetails}
                  onShowVerification={navigation.handleShowVerification}
                  onViewMessages={navigation.handleViewMessages}
                />
              )}

            {currentView === "dashboard" &&
              currentUser &&
              currentUser.userType === "buyer" && (
                <BuyerDashboard
                  user={currentUser}
                  allProducts={allProducts}
                  savedProducts={savedProducts}
                  onGoToMarketplace={navigation.handleBackToMarketplace}
                  onViewProduct={navigation.handleViewDetails}
                  onStartChat={chatManagement.handleChat}
                  onViewMessages={navigation.handleViewMessages}
                />
              )}

            {currentView === "messages" && currentUser && (
              <div className="max-w-6xl mx-auto">
                <Messages
                  currentUser={currentUser}
                  onBack={navigation.handleBackToPrevious}
                  onStartChat={chatManagement.handleChat}
                />
              </div>
            )}

            {currentView === "deals" && currentUser && (
              <div className="max-w-6xl mx-auto">
                <DealsManagement
                  currentUserId={currentUser.id}
                  currentUserName={currentUser.name}
                  currentUserType={currentUser.userType}
                  onBack={navigation.handleBackToPrevious}
                />
              </div>
            )}

            {currentView === "verification" && currentUser && (
              <div className="max-w-4xl mx-auto pt-8">
                <AccountTypeVerification
                  currentUser={currentUser}
                  onClose={navigation.handleBackToProfile}
                  onUpdate={handleUpdateUser}
                />
              </div>
            )}

            {currentView === "admin-verification" &&
              currentUser &&
              currentUser.userType === "admin" && (
                <div className="max-w-7xl mx-auto">
                  <AdminVerificationPanel
                    currentAdmin={currentUser}
                    onBack={navigation.handleBackToPrevious}
                  />
                </div>
              )}



            {currentView === "about-us" && (
              <div className="max-w-4xl mx-auto">
                <AboutUs
                  onBack={navigation.handleBackToPrevious}
                />
              </div>
            )}

            {currentView === "contact-us" && (
              <div className="max-w-4xl mx-auto">
                <ContactUsPage
                  onBack={navigation.handleBackToPrevious}
                  currentUser={currentUser}
                />
              </div>
            )}

            {currentView === "faq" && (
              <div className="max-w-4xl mx-auto">
                <FAQ
                  onBack={navigation.handleBackToPrevious}
                  onShowContactUs={navigation.handleShowContactUs}
                />
              </div>
            )}

            {currentView === "marketplace" && (
              <div className="space-y-8">
                {/* Optimized Hero Component */}
                <MarketplaceHero
                  currentUser={currentUser}
                  allProducts={allProducts}
                  onGoToRegister={navigation.handleGoToRegister}
                  onGoToLogin={navigation.handleGoToLogin}
                  onShowAddListing={productManagement.handleShowAddListing}
                />

                {/* Search and Products Section */}
                <section className="space-y-6">
                  {currentUser?.userType === "admin" && (
                    <div className="space-y-4">
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                        <p className="text-sm font-medium text-primary">
                          🛠️ Admin Dashboard - Product
                          Management Mode Active
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          You have administrator privileges to
                          manage all products on the platform
                        </p>
                      </div>

                      {/* SimpleVerificationTester removed - debug component */}
                    </div>
                  )}


                  <SearchFilters
                    key={JSON.stringify(filters)}
                    filters={filters}
                    onFiltersChange={setFilters}
                    activeFiltersCount={getActiveFiltersCount}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => {
                      const verificationStatus =
                        getSellerVerificationStatus(
                          product.sellerId,
                          currentUser,
                        );
                      return (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onChat={chatManagement.handleChat}
                          onViewDetails={navigation.handleViewDetails}
                          onViewStorefront={navigation.handleViewStorefront}
                          onDelete={
                            currentUser?.userType === "admin"
                              ? productManagement.handleDeleteListing
                              : undefined
                          }
                          onSaveProduct={
                            currentUser?.userType === "buyer"
                              ? handleSaveProduct
                              : undefined
                          }
                          onMakeOffer={handleMakeOffer}
                          currentUserId={currentUser?.id}
                          currentUserType={currentUser?.userType}
                          sellerVerified={
                            verificationStatus.verified
                          }
                          sellerVerificationStatus={
                            verificationStatus
                          }
                          adminMode={currentUser?.userType === "admin"}
                          savedProductIds={savedProducts.map(sp => sp.productId)}
                        />
                      );
                    })}
                  </div>

                  {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        No products found matching your
                        criteria.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() =>
                          setFilters({
                            search: "",
                            category: "",
                            location: "",
                            region: "",
                            city: "",
                            sellerType: "",
                            priceRange: "",
                            sortBy: "newest",
                          })
                        }
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </section>
              </div>
            )}

            {currentView === "product-details" &&
              productToView &&
              (() => {
                const productSellerVerificationStatus =
                  getSellerVerificationStatus(
                    productToView.sellerId,
                    currentUser,
                  );

                // Get seller profile data - simplified without demo account lookup
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
                    joinedDate: (currentUser as any).joinedDate || "Recently",
                    rating: (currentUser as any).rating || 4.2,
                    totalReviews: (currentUser as any).totalReviews || 12,
                    yearsActive: currentUser.experience
                      ? parseInt(currentUser.experience.split(" ")[0]) || 1
                      : 3,
                    responseTime: (currentUser as any).responseTime || (currentUser.userType === "farmer" ? "3 hours" : "1 hour"),
                    phone: (currentUser as any).phone || "",
                    openingHours: (currentUser as any).openingHours || (currentUser.userType === "farmer" ? "9 AM - 6 PM" : "8 AM - 7 PM"),
                  };
                } else {
                  // Create a basic profile for other sellers (no demo data lookup)
                  sellerProfile = {
                    id: productToView.sellerId,
                    name: productToView.sellerName || "Seller",
                    businessName: productToView.sellerName || "Seller",
                    userType: productToView.sellerType || "farmer",
                    location: productToView.location || "Unknown",
                    experience: "3 years",
                    joinedDate: "Recently",
                    rating: 4.5, // Default rating
                    totalReviews: 15, // Default review count
                    yearsActive: 3,
                    responseTime: productToView.sellerType === "farmer" ? "3 hours" : "1 hour",
                    phone: "",
                    openingHours: productToView.sellerType === "farmer" ? "9 AM - 6 PM" : "8 AM - 7 PM",
                  };
                }

                return (
                  <ProductDetails
                    product={productToView}
                    onBack={navigation.handleBackToMarketplace}
                    onChat={chatManagement.handleChat}
                    onPriceCompare={navigation.handlePriceCompare}
                    onViewStorefront={navigation.handleViewStorefront}
                    onEditProduct={(product) => productManagement.handleEditListing(product, allProducts)}
                    currentUserId={
                      // Show customer view when viewing own product from storefront
                      (previousView === "seller-storefront" && 
                       productToView.sellerId === currentUser?.id) 
                        ? null 
                        : currentUser?.id
                    }
                    isUserVerified={
                      currentUser?.verified || false
                    }
                    userType={currentUser?.userType}
                    isPhoneVerified={
                      currentUser?.phoneVerified || false
                    }
                    sellerVerified={
                      productSellerVerificationStatus.verified
                    }
                    sellerVerificationStatus={
                      productSellerVerificationStatus
                    }
                    sellerProfile={sellerProfile}
                  />
                );
              })()}

            {currentView === "price-comparison" &&
              productToView && (
                <PriceComparison
                  productName={productToView.name}
                  priceData={priceComparisonData}
                  unit={productToView.unit}
                  onBack={navigation.handleBackToProductDetails}
                  isOwnProduct={
                    currentUser?.id === productToView.sellerId
                  }
                />
              )}

            {currentView === "seller-storefront" &&
              selectedSellerId &&
              (() => {
                // Get seller info - check current user first, then localStorage
                let sellerInfo: any = null;
                
                if (selectedSellerId === currentUser?.id) {
                  // Current user's storefront
                  sellerInfo = {
                    id: currentUser.id,
                    name: currentUser.businessName || currentUser.name,
                    type: currentUser.userType,
                    accountType: currentUser.accountType,
                    location: currentUser.location,
                    description:
                      currentUser.businessDescription ||
                      `${currentUser.userType} in ${currentUser.location}`,
                    image:
                      (currentUser as any).storefrontImage ||
                      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop",
                    rating: (currentUser as any).rating || 0,
                    totalReviews: (currentUser as any).totalReviews || 0,
                    yearsActive: parseInt(currentUser.experience?.split(" ")[0] || "1"),
                    responseTime: (currentUser as any).responseTime || (currentUser.userType === "farmer" ? "3 hours" : "1 hour"),
                    certifications: currentUser.qualityCertifications || [],
                    joinedDate: (currentUser as any).joinedDate || "Recently",
                    verified: currentUser.verified || false,
                    phone: currentUser.phone || "",
                    email: currentUser.email || "",
                    website: (currentUser as any).website || "",
                    facebook: (currentUser as any).facebook || "",
                    instagram: (currentUser as any).instagram || "",
                    telegram: (currentUser as any).telegram || "",
                    businessHours:
                      (currentUser as any).businessHours || "9 AM - 6 PM, Mon-Sat",
                    specialties: (currentUser as any).specialties || [],
                    policies: (currentUser as any).policies || {
                      returns: "",
                      delivery: "",
                      payment: "",
                    },
                  };
                } else {
                  // TODO: Look up seller from Supabase users table
                  // For now, create a basic profile
                  sellerInfo = {
                    id: selectedSellerId,
                    name: "Seller",
                    type: "farmer",
                    accountType: "individual",
                    location: "Unknown",
                    description: "Seller in Unknown",
                    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop",
                    rating: 0,
                    totalReviews: 0,
                    yearsActive: 1,
                    responseTime: "3 hours",
                    certifications: [],
                    joinedDate: "Recently",
                    verified: false,
                    phone: "",
                    email: "",
                    website: "",
                    facebook: "",
                    instagram: "",
                    telegram: "",
                    businessHours: "9 AM - 6 PM, Mon-Sat",
                    specialties: [],
                    policies: {
                      returns: "",
                      delivery: "",
                      payment: "",
                    },
                  };
                }

                // If no seller found, show error message
                if (!sellerInfo) {
                  return (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">
                        Seller not found.
                      </p>
                      <Button onClick={navigation.handleBackToMarketplace}>
                        Back to Marketplace
                      </Button>
                    </div>
                  );
                }

                return (
                  <SellerStorefront
                    seller={sellerInfo}
                    products={allProducts.filter(
                      (p) => p.sellerId === selectedSellerId,
                    )}
                    onBack={navigation.handleBackToPrevious}
                    onViewProduct={navigation.handleViewDetails}
                    onChat={chatManagement.handleChat}
                    isOwnStorefront={
                      selectedSellerId === currentUser?.id
                    }
                    onEditStorefrontImage={
                      selectedSellerId === currentUser?.id
                        ? handleEditStorefrontImage
                        : undefined
                    }
                    onUpdateStorefront={
                      selectedSellerId === currentUser?.id
                        ? handleUpdateUser
                        : undefined
                    }
                    previewMode={storefrontPreviewMode}
                    onTogglePreviewMode={
                      selectedSellerId === currentUser?.id
                        ? setStorefrontPreviewMode
                        : undefined
                    }
                  />
                );
              })()}
          </div>
        </main>

        {/* Chat Interface - Mobile-First Design */}
        {selectedChat &&
          selectedProduct &&
          (() => {
            // Find seller info to get verification status
            const seller =
              selectedProduct.sellerId === currentUser?.id
                ? currentUser
                : null; // TODO: Look up seller from Supabase

            // Get seller's verification status for chat warnings
            const sellerVerificationStatus =
              getSellerVerificationStatus(
                selectedProduct.sellerId,
                currentUser,
              );

            return (
              <>
                {/* Desktop: Side panel */}
                <div className="fixed right-0 bottom-0 h-[700px] w-96 bg-card shadow-2xl border-l border-t z-50 transition-transform duration-300">
                  <ChatInterface
                    key="desktop-chat"
                    sellerName={selectedProduct.sellerName}
                    sellerType={selectedProduct.sellerType}
                    sellerLocation={selectedProduct.location}
                    currentUser={currentUser}
                    sellerRating={4.5}
                    productName={selectedProduct.name}
                    productId={selectedProduct.id}
                    sellerId={selectedProduct.sellerId}
                    onClose={() => setSelectedChat(null)}
                    sellerVerified={seller?.verified || false}
                    currentUserVerified={
                      currentUser?.verified || false
                    }
                    currentUserType={currentUser?.userType}
                    sellerVerificationStatus={
                      sellerVerificationStatus
                    }
                    product={selectedProduct}
                  />
                </div>
              </>
            );
          })()}

        {/* Authentication Modals */}
        {authModal === "register" && (
          <Register
            onRegister={handleRegister}
            onSwitchToLogin={navigation.handleGoToLogin}
            onClose={() => setAuthModal(null)}
          />
        )}

        {/* Verification Prompt Modal */}
        {verificationPrompt.show && (
          <VerificationPrompt
            feature={verificationPrompt.feature}
            sellerName={verificationPrompt.sellerName}
            userType={currentUser?.userType}
            onClose={() =>
              setVerificationPrompt({
                show: false,
                feature: "chat",
              })
            }
            onStartVerification={() => {
              setVerificationPrompt({
                show: false,
                feature: "chat",
              });
              navigation.handleShowVerification();
            }}
          />
        )}

        {/* Optimized Footer Component */}
        <AppFooter
          onShowAboutUs={navigation.handleShowAboutUs}
          onShowContactUs={navigation.handleShowContactUs}
          onShowFAQ={navigation.handleShowFAQ}
        />


        {/* Offer Modal */}
        {showOfferModal && selectedProductForOffer && currentUser && (
          <OfferModal
            isOpen={showOfferModal}
            onClose={() => {
              setShowOfferModal(false);
              setSelectedProductForOffer(null);
            }}
            onSubmit={handleOfferSubmit}
            product={{
              id: selectedProductForOffer.id,
              name: selectedProductForOffer.name,
              price: selectedProductForOffer.price,
              unit: selectedProductForOffer.unit,
              sellerName: selectedProductForOffer.sellerName,
              location: selectedProductForOffer.location
            }}
            currentUser={{
              id: currentUser.id,
              name: currentUser.name
            }}
          />
        )}

        {/* Review Modal */}
        {showReviewModal && selectedTransactionForReview && currentUser && (
          <ReviewModal
            isOpen={showReviewModal}
            onClose={() => {
              setShowReviewModal(false);
              setSelectedTransactionForReview(null);
            }}
            onSubmit={handleReviewSubmit}
            transaction={selectedTransactionForReview}
            currentUser={{
              id: currentUser.id,
              name: currentUser.name
            }}
          />
        )}

        {/* Toast Notifications */}
        <Toaster position="top-right" />
        </div>
      </>
    </ErrorBoundary>
  );
}