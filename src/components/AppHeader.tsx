import { Button } from "./ui/button";
import { UserMenu } from "./UserMenuWithSupport";
import { Leaf, LogIn, UserPlus } from "lucide-react";

interface AppHeaderProps {
  currentView: string;
  currentUser: any;
  onBackToMarketplace: () => void;
  onGoToDashboard: () => void;
  onGoToLogin: () => void;
  onGoToRegister: () => void;
  onLogout: () => void;
  onViewStorefront: (sellerId: string) => void;
  onUpdateUser: (updates: any) => void;
  onShowVerification: (step?: number) => void;
  onEditProfile: () => void;
  onViewProfile: () => void;
  onViewMessages: () => void;
  onShowAdminVerification: () => void;
  editingProduct?: any;
}

export function AppHeader({
  currentView,
  currentUser,
  onBackToMarketplace,
  onGoToDashboard,
  onGoToLogin,
  onGoToRegister,
  onLogout,
  onViewStorefront,
  onUpdateUser,
  onShowVerification,
  onEditProfile,
  onViewProfile,
  onViewMessages,
  onShowAdminVerification,
  editingProduct,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-card">
      <div className="w-full max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToMarketplace}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <Leaf className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-semibold">
                AgriLink
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                Linking agriculture to opportunity
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile Navigation - Compact */}
            <div className="flex md:hidden items-center gap-1">
              {currentView !== "marketplace" && (
                <Button
                  variant="ghost"
                  onClick={onBackToMarketplace}
                  className="px-2 h-8 text-sm"
                >
                  Home
                </Button>
              )}
            </div>

            {/* Desktop Navigation - Full labels */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant={
                  currentView === "marketplace"
                    ? "default"
                    : "ghost"
                }
                className="h-9 px-4 text-sm"
                onClick={onBackToMarketplace}
              >
                Marketplace
              </Button>

              {/* User-specific navigation when logged in */}
              {currentUser && (
                <>
                  {(currentUser.userType === "farmer" ||
                    currentUser.userType === "trader" ||
                    currentUser.userType === "buyer") && (
                    <Button
                      variant={
                        currentView === "dashboard"
                          ? "default"
                          : "ghost"
                      }
                      className="h-9 px-4 text-sm"
                      onClick={onGoToDashboard}
                    >
                      Dashboard
                    </Button>
                  )}
                  {currentUser.userType === "admin" && (
                    <Button
                      variant={
                        currentView === "marketplace"
                          ? "default"
                          : "ghost"
                      }
                      className="h-9 px-4 text-sm"
                      onClick={onGoToDashboard}
                    >
                      Admin Panel
                    </Button>
                  )}
                  {currentView === "profile" && (
                    <Button
                      variant="default"
                      size="sm"
                      disabled
                    >
                      Profile
                    </Button>
                  )}

                  {currentView === "add-listing" && (
                    <Button
                      variant="default"
                      size="sm"
                      disabled
                    >
                      {editingProduct
                        ? "Edit Listing"
                        : "Add Listing"}
                    </Button>
                  )}
                  {currentView === "messages" && (
                    <Button
                      variant="default"
                      size="sm"
                      disabled
                    >
                      Messages
                    </Button>
                  )}
                  {currentView === "verification" && (
                    <Button
                      variant="default"
                      size="sm"
                      disabled
                    >
                      Verification
                    </Button>
                  )}
                  {currentView === "admin-verification" && (
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
              {!currentUser &&
                currentView === "forgot-password" && (
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
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden lg:inline font-medium">
                  Welcome, {currentUser.name.split(" ")[0]}
                </span>
                <UserMenu
                  user={currentUser}
                  onLogout={onLogout}
                  onViewStorefront={onViewStorefront}
                  onUpdateUser={onUpdateUser}
                  onGoToDashboard={onGoToDashboard}
                  onShowVerification={onShowVerification}
                  onEditProfile={onEditProfile}
                  onViewProfile={onViewProfile}
                  onViewMessages={onViewMessages}
                  onShowAdminVerification={onShowAdminVerification}
                />
              </div>
            ) : (
              // Always show auth buttons
              <div className="flex items-center gap-1 md:gap-2">
                {/* Mobile: Icon only buttons */}
                <Button
                  variant={
                    currentView === "login"
                      ? "default"
                      : "outline"
                  }
                  onClick={onGoToLogin}
                  className="md:hidden px-2 h-8"
                >
                  <LogIn className="w-4 h-4" />
                </Button>
                <Button
                  variant={
                    currentView === "register"
                      ? "default"
                      : "outline"
                  }
                  onClick={onGoToRegister}
                  className="md:hidden px-2 h-8"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>

                {/* Desktop: Full label buttons */}
                <Button
                  variant={
                    currentView === "login"
                      ? "default"
                      : "outline"
                  }
                  onClick={onGoToLogin}
                  className="hidden md:flex h-9 px-4 text-sm"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                <Button
                  variant={
                    currentView === "register"
                      ? "default"
                      : "outline"
                  }
                  onClick={onGoToRegister}
                  className="hidden md:flex h-9 px-4 text-sm"
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
  );
}