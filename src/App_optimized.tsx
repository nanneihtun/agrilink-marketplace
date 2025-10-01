import {
  useState,
  useEffect,
  useMemo,
  useCallback,
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

import { ComprehensiveProductForm } from "./components/ComprehensiveProductForm";
import { FreshDashboard } from "./components/FreshDashboard";
import { AccountTypeVerification } from "./components/AccountTypeVerification";
import { Profile } from "./components/Profile";
import { Messages } from "./components/Messages";
import { VerificationPrompt } from "./components/VerificationPrompt";
import { AdminVerificationPanel } from "./components/AdminVerificationPanel";
import { SimpleVerificationTester } from "./components/SimpleVerificationTester";
import { AboutUs } from "./components/AboutUs";
import { ContactUsPage } from "./components/ContactUsPage";
import { FAQ } from "./components/FAQ";

// Optimized components
import { AppHeader } from "./components/AppHeader";
import { AppFooter } from "./components/AppFooter";
import { MarketplaceHero } from "./components/MarketplaceHero";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";

// Product type import - removed demo data imports to reduce memory usage
import type { Product } from "./data/products";
import { generatePriceComparisonData } from "./utils/priceComparison";
import {
  useProductFiltering,
  FilterState,
} from "./hooks/useProductFiltering";
import { useAuth } from "./hooks/useAuth";
import { useProducts } from "./hooks/useProducts";
import { useChat } from "./hooks/useChat";
import { useBackendFallback } from "./hooks/useBackendFallback";

// Optimized custom hooks
import { useNavigation } from "./hooks/useNavigation";
import { useProductManagement } from "./hooks/useProductManagement";
import { useChatManagement } from "./hooks/useChatManagement";

// Utility functions
import { getSellerVerificationStatus, isSellerVerified } from "./utils/sellerVerification";

import { Leaf } from "lucide-react";

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
  | "verification"
  | "admin-verification"
  | "about-us"
  | "contact-us"
  | "faq";
type AuthModalType = "login" | "register" | null;

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>("marketplace");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState<AuthModalType>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previousView, setPreviousView] = useState<ViewType>("marketplace");
  const [verificationInitialStep, setVerificationInitialStep] = useState<number>(1);

  // Helper function to create admin account for testing verification workflow
  const createAdminAccount = useCallback(() => {
    try {
      const users = JSON.parse(localStorage.getItem('agriconnect-myanmar-users') || '[]');
      
      // Check if admin already exists
      const existingAdmin = users.find((u: any) => u.userType === 'admin');
      if (existingAdmin) {
        toast.error('Admin account already exists. Use admin@agrilink.com / admin123');
        return;
      }

      const adminUser = {
        id: `admin-${Date.now()}`,
        email: 'admin@agrilink.com',
        password: 'admin123',
        name: 'System Administrator',
        userType: 'admin',
        accountType: 'business',
        location: 'Yangon',
        region: 'Yangon Region',
        phone: '+95 9 123 456 789',
        businessName: 'AgriLink Administration',
        businessDescription: 'Platform administration and verification management',
        experience: '5 years',
        verified: true,
        phoneVerified: true,
        qualityCertifications: [],
        farmingMethods: [],
        joinedDate: new Date().toISOString(),
        rating: 5.0,
        totalReviews: 0
      };

      users.push(adminUser);
      localStorage.setItem('agriconnect-myanmar-users', JSON.stringify(users));
      
      toast.success('Admin account created successfully!');
      toast.info('Login: admin@agrilink.com / admin123');
      
    } catch (error) {
      console.error('Failed to create admin account:', error);
      toast.error('Failed to create admin account');
    }
  }, []);

  const [showVerification, setShowVerification] = useState(false);
  const [verificationPrompt, setVerificationPrompt] = useState<{
    show: boolean;
    feature: "chat" | "contact" | "listing" | "storefront";
    sellerName?: string;
  }>({ show: false, feature: "chat" });
  
  const [localProducts, setLocalProducts] = useState<Product[]>(() => {
    // Load locally added products from localStorage on initialization
    try {
      const stored = localStorage.getItem("agriconnect-myanmar-local-products");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load local products:", error);
      return [];
    }
  });

  // Persist local products to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(
        "agriconnect-myanmar-local-products",
        JSON.stringify(localProducts),
      );
    } catch (error) {
      console.error("Failed to save local products:", error);
    }
  }, [localProducts]);

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

  // Use custom hooks for backend integration
  const { backendAvailable, checking: backendChecking } = useBackendFallback();
  const {
    user: currentUser,
    loading: authLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  } = useAuth();
  const {
    products: backendProducts,
    loading: productsLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    getUserProducts,
  } = useProducts();
  
  // Only initialize chat hook when user is authenticated
  const { startConversation } = useChat(
    currentUser?.id && !authLoading ? currentUser.id : undefined,
  );

  // Simplified product management - backend + local products only (no demo data)
  const allProducts = useMemo(() => {
    try {
      // Use backend products if available, otherwise just local products
      if (backendAvailable && backendProducts && backendProducts.length > 0) {
        console.log("Using backend products:", backendProducts?.length || 0);
        return [...backendProducts, ...localProducts];
      }
      
      // Fallback to just local products (user-added products)
      console.log("Using local products only:", localProducts.length);
      return localProducts;
    } catch (error) {
      console.error("Error in allProducts calculation:", error);
      return localProducts;
    }
  }, [backendProducts, backendAvailable, localProducts]);

  // Initialize custom hooks
  const navigation = useNavigation({
    currentView,
    currentUser,
    setCurrentView,
    setSelectedProductId,
    setSelectedChat,
    setSelectedSellerId,
    setVerificationInitialStep,
  });

  const productManagement = useProductManagement({
    currentUser,
    backendAvailable,
    backendProducts,
    localProducts,
    setLocalProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    setEditingProduct,
    setCurrentView,
    setPreviousView,
    setAuthModal,
    currentView,
    previousView,
  });

  const chatManagement = useChatManagement({
    currentUser,
    allProducts,
    startConversation,
    setSelectedChat,
    setAuthModal,
  });

  // Set initial view based on user type when user loads
  useEffect(() => {
    if (currentUser && !authLoading) {
      if (
        currentUser.userType === "farmer" ||
        currentUser.userType === "trader"
      ) {
        // Only redirect to dashboard if not currently on verification, profile, storefront, marketplace, add-listing, or other user-specific pages
        if (
          currentView !== "verification" &&
          currentView !== "profile" &&
          currentView !== "edit-profile" &&
          currentView !== "messages" &&
          currentView !== "seller-storefront" &&
          currentView !== "marketplace" &&
          currentView !== "add-listing" &&
          currentView !== "product-details" &&
          currentView !== "price-comparison" &&
          currentView !== "about-us" &&
          currentView !== "contact-us" &&
          currentView !== "faq"
        ) {
          setCurrentView("dashboard");
        }
      } else if (currentUser.userType === "admin") {
        // Admins default to marketplace view with admin controls
        if (
          currentView !== "verification" &&
          currentView !== "profile" &&
          currentView !== "edit-profile" &&
          currentView !== "messages" &&
          currentView !== "seller-storefront" &&
          currentView !== "add-listing" &&
          currentView !== "product-details" &&
          currentView !== "price-comparison" &&
          currentView !== "admin-verification" &&
          currentView !== "about-us" &&
          currentView !== "contact-us" &&
          currentView !== "faq"
        ) {
          setCurrentView("marketplace");
        }
      }
    }
  }, [currentUser, authLoading, currentView]);

  // Simplified localStorage check on app startup
  useEffect(() => {
    try {
      // Test localStorage write/read to ensure it's working
      const testKey = "agriconnect-test-write";
      const testValue = "test-" + Date.now();
      localStorage.setItem(testKey, testValue);
      const readValue = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      if (readValue !== testValue) {
        console.error("❌ localStorage write/read test failed");
        toast.error("Storage system not working properly.");
      } else {
        console.log("✅ localStorage integrity verified");
      }
    } catch (error) {
      console.error("❌ localStorage integrity check failed:", error);
      toast.error("Storage system error. Some features may not work properly.");
    }
  }, []); // Run once on startup

  // Check if current user is an admin
  const isAdmin = currentUser?.userType === "admin";

  // Use custom hook for filtering
  const { filteredProducts, getActiveFiltersCount } =
    useProductFiltering(allProducts, filters, isSellerVerified);

  // Memoized selectors with null checks
  const selectedProduct = useMemo(
    () =>
      selectedChat
        ? allProducts.find((p) => p.id === selectedChat)
        : null,
    [allProducts, selectedChat],
  );

  const productToView = useMemo(
    () =>
      selectedProductId
        ? allProducts.find((p) => p.id === selectedProductId)
        : null,
    [allProducts, selectedProductId],
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
        setAuthModal(null);
      } catch (error) {
        console.error("Registration failed:", error);
        throw error;
      }
    },
    [signUp],
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
        // For demo mode, we'll use a URL.createObjectURL to simulate image upload
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

  // Generate price comparison data with memoization
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

    // Add mock data
    const mockData = generatePriceComparisonData(
      productToView.name,
      basePrice,
    );

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
          <p className="text-muted-foreground">
            Connecting to server...
          </p>
          <div className="w-32 h-1 bg-muted rounded-full mx-auto overflow-hidden">
            <div className="w-full h-full bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
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
                  onBack={navigation.handleBackToMarketplace}
                  onEditProfile={handleEditProfile}
                  onShowVerification={navigation.handleShowVerification}
                  onUpdate={handleUpdateUser}
                  onViewStorefront={navigation.handleViewStorefront}
                />
              </div>
            )}

            {currentView === "add-listing" && currentUser && (
              <div className="max-w-7xl mx-auto">
                <ComprehensiveProductForm
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

            {currentView === "messages" && currentUser && (
              <div className="max-w-6xl mx-auto">
                <Messages
                  currentUser={currentUser}
                  onBack={navigation.handleBackToMarketplace}
                  onStartChat={chatManagement.handleChat}
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
              isAdmin && (
                <div className="max-w-7xl mx-auto">
                  <AdminVerificationPanel
                    currentAdmin={currentUser}
                    onBack={navigation.handleBackToMarketplace}
                  />
                </div>
              )}

            {currentView === "about-us" && (
              <div className="max-w-4xl mx-auto">
                <AboutUs
                  onBack={navigation.handleBackToMarketplace}
                />
              </div>
            )}

            {currentView === "contact-us" && (
              <div className="max-w-4xl mx-auto">
                <ContactUsPage
                  onBack={navigation.handleBackToMarketplace}
                  currentUser={currentUser}
                />
              </div>
            )}

            {currentView === "faq" && (
              <div className="max-w-4xl mx-auto">
                <FAQ
                  onBack={navigation.handleBackToMarketplace}
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
                  {isAdmin && (
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

                      <SimpleVerificationTester
                        currentUser={currentUser}
                      />
                    </div>
                  )}

                  {/* Admin Account Creation Helper - For Development/Testing */}
                  {!currentUser && (
                    <div className="bg-muted/50 border rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-3">
                        🔧 Development Mode: Need to test verification workflow?
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={createAdminAccount}
                        className="text-xs"
                      >
                        Create Admin Account
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        This will create admin@agrilink.com / admin123 for testing
                      </p>
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
                            isAdmin
                              ? productManagement.handleDeleteListing
                              : undefined
                          }
                          currentUserId={currentUser?.id}
                          sellerVerified={
                            verificationStatus.verified
                          }
                          sellerVerificationStatus={
                            verificationStatus
                          }
                          adminMode={isAdmin}
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
                    phone:
                      (currentUser as any).phone ||
                      `+95 9 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`,
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
                    rating: 4.2 + Math.random() * 0.6, // 4.2-4.8 range
                    totalReviews: Math.floor(Math.random() * 40) + 10, // 10-50 reviews
                    yearsActive: 3,
                    responseTime: productToView.sellerType === "farmer" ? "3 hours" : "1 hour",
                    phone: `+95 9 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`,
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
                    currentUserId={currentUser?.id}
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
                let sellerInfo = null;
                
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
                  // Look up other seller from localStorage
                  try {
                    const users = JSON.parse(localStorage.getItem('agriconnect-myanmar-users') || '[]');
                    const seller = users.find((user: any) => user.id === selectedSellerId);
                    
                    if (seller) {
                      sellerInfo = {
                        id: seller.id,
                        name: seller.businessName || seller.name,
                        type: seller.userType,
                        accountType: seller.accountType,
                        location: seller.location,
                        description:
                          seller.businessDescription ||
                          `${seller.userType} in ${seller.location}`,
                        image:
                          seller.storefrontImage ||
                          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop",
                        rating: seller.rating || 0, // Use stored rating or 0 if none
                        totalReviews: seller.totalReviews || 0, // Use stored reviews or 0 if none
                        yearsActive: parseInt(seller.experience?.split(" ")[0] || "3"),
                        responseTime: seller.responseTime || (seller.userType === "farmer" ? "3 hours" : "1 hour"),
                        certifications: seller.qualityCertifications || [],
                        joinedDate: seller.joinedDate || "Recently",
                        verified: seller.verified || false,
                        phone: seller.phone || "", // Use stored phone or empty if none
                        email: seller.email || "",
                        website: seller.website || "",
                        businessHours: seller.businessHours || "9 AM - 6 PM, Mon-Sat",
                        specialties: seller.specialties || [],
                        policies: seller.policies || {
                          returns: "",
                          delivery: "",
                          payment: "",
                        },
                      };
                    }
                  } catch (error) {
                    console.error('Error looking up seller:', error);
                  }
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
                    onBack={navigation.handleBackToMarketplace}
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
                  />
                );
              })()}
          </div>
        </main>

        {/* Chat Interface - Mobile-First Design */}
        {selectedChat &&
          selectedProduct &&
          (() => {
            // Find seller info to get verification status - simplified
            const seller =
              selectedProduct.sellerId === currentUser?.id
                ? currentUser
                : null; // No demo seller lookup

            // Get seller's verification status for chat warnings
            const sellerVerificationStatus =
              getSellerVerificationStatus(
                selectedProduct.sellerId,
                currentUser,
              );

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

        {/* Toast Notifications */}
        <Toaster position="top-right" />
      </div>
    </ErrorBoundary>
  );
}