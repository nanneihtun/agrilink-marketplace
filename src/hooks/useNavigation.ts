import { useCallback } from "react";

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
  | "admin-dashboard"
  | "about-us"
  | "contact-us"
  | "faq";

interface UseNavigationProps {
  currentView: ViewType;
  currentUser: any;
  setCurrentView: (view: ViewType) => void;
  setSelectedProductId: (id: string | null) => void;
  setSelectedChat: (id: string | null) => void;
  setSelectedSellerId: (id: string | null) => void;
  setVerificationInitialStep: (step: number) => void;
  previousView?: ViewType;
  setPreviousView?: (view: ViewType) => void;
}

export function useNavigation({
  currentView,
  currentUser,
  setCurrentView,
  setSelectedProductId,
  setSelectedChat,
  setSelectedSellerId,
  setVerificationInitialStep,
  previousView,
  setPreviousView,
}: UseNavigationProps) {

  const handleBackToMarketplace = useCallback(() => {
    console.log("Marketplace button clicked");
    setSelectedProductId(null);
    setSelectedChat(null);
    setCurrentView("marketplace");
  }, [setSelectedProductId, setSelectedChat, setCurrentView]);

  const handleGoToDashboard = useCallback(() => {
    if (setPreviousView) {
      setPreviousView(currentView);
    }
    setSelectedProductId(null);
    setSelectedChat(null);
    setSelectedSellerId(null);
    if (
      currentUser?.userType === "farmer" ||
      currentUser?.userType === "trader" ||
      currentUser?.userType === "buyer"
    ) {
      setCurrentView("dashboard");
    } else if (currentUser?.userType === "admin") {
      setCurrentView("admin-dashboard"); // Admins go to admin dashboard
    } else {
      setCurrentView("marketplace");
    }
  }, [currentView, setPreviousView, currentUser, setSelectedProductId, setSelectedChat, setSelectedSellerId, setCurrentView]);

  // Smart back navigation - goes to previous view or sensible default
  const handleBackToPrevious = useCallback(() => {
    if (previousView && previousView !== currentView) {
      // If we have a valid previous view, go back to it
      setCurrentView(previousView);
    } else {
      // Default fallback based on user type
      if (currentUser?.userType === "farmer" || currentUser?.userType === "trader" || currentUser?.userType === "buyer") {
        setCurrentView("dashboard");
      } else {
        setCurrentView("marketplace");
      }
    }
  }, [previousView, currentView, currentUser, setCurrentView]);

  const handleViewProfile = useCallback(() => {
    if (setPreviousView) {
      setPreviousView(currentView);
    }
    setCurrentView("profile");
  }, [currentView, setPreviousView, setCurrentView]);

  const handleViewMessages = useCallback(() => {
    if (setPreviousView) {
      setPreviousView(currentView);
    }
    setCurrentView("messages");
  }, [currentView, setPreviousView, setCurrentView]);

  const handleShowVerification = useCallback(
    (initialStep: number = 1) => {
      if (setPreviousView) {
        setPreviousView(currentView);
      }
      setVerificationInitialStep(initialStep);
      setCurrentView("verification");
    },
    [currentView, setPreviousView, setVerificationInitialStep, setCurrentView],
  );

  const handleShowAdminVerification = useCallback(() => {
    if (setPreviousView) {
      setPreviousView(currentView);
    }
    setCurrentView("admin-verification");
  }, [currentView, setPreviousView, setCurrentView]);

  const handleShowAboutUs = useCallback(() => {
    if (setPreviousView) {
      setPreviousView(currentView);
    }
    setCurrentView("about-us");
  }, [currentView, setPreviousView, setCurrentView]);

  const handleShowContactUs = useCallback(() => {
    if (setPreviousView) {
      setPreviousView(currentView);
    }
    setCurrentView("contact-us");
  }, [currentView, setPreviousView, setCurrentView]);

  const handleShowFAQ = useCallback(() => {
    if (setPreviousView) {
      setPreviousView(currentView);
    }
    setCurrentView("faq");
  }, [currentView, setPreviousView, setCurrentView]);

  const handleBackToProfile = useCallback(() => {
    setCurrentView("profile");
    // Scroll to top when returning to profile page
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [setCurrentView]);

  const handleGoToRegister = useCallback(() => {
    setCurrentView("register");
  }, [setCurrentView]);

  const handleGoToLogin = useCallback(() => {
    setCurrentView("login");
  }, [setCurrentView]);

  const handleGoToForgotPassword = useCallback(() => {
    setCurrentView("forgot-password");
  }, [setCurrentView]);

  const handleViewDetails = useCallback((productId: string) => {
    if (setPreviousView) {
      setPreviousView(currentView);
    }
    setSelectedProductId(productId);
    setCurrentView("product-details");
  }, [currentView, setPreviousView, setSelectedProductId, setCurrentView]);

  const handlePriceCompare = useCallback(
    (productId: string) => {
      setSelectedProductId(productId);
      setCurrentView("price-comparison");
    },
    [setSelectedProductId, setCurrentView],
  );

  const handleBackToProductDetails = useCallback(() => {
    if (currentView === "price-comparison") {
      setCurrentView("product-details");
    } else {
      handleBackToMarketplace();
    }
  }, [currentView, handleBackToMarketplace, setCurrentView]);

  const handleViewStorefront = useCallback(
    (sellerId: string) => {
      if (setPreviousView) {
        setPreviousView(currentView);
      }
      setSelectedSellerId(sellerId);
      setCurrentView("seller-storefront");
    },
    [currentView, setPreviousView, setSelectedSellerId, setCurrentView],
  );

  const handleBackToStorefront = useCallback(() => {
    setCurrentView("seller-storefront");
  }, [setCurrentView]);

  return {
    handleBackToMarketplace,
    handleBackToPrevious,
    handleGoToDashboard,
    handleViewProfile,
    handleViewMessages,
    handleShowVerification,
    handleShowAdminVerification,
    handleShowAboutUs,
    handleShowContactUs,
    handleShowFAQ,
    handleBackToProfile,
    handleGoToRegister,
    handleGoToLogin,
    handleGoToForgotPassword,
    handleViewDetails,
    handlePriceCompare,
    handleBackToProductDetails,
    handleViewStorefront,
    handleBackToStorefront,
  };
}