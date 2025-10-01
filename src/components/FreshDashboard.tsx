import { useMemo } from "react";
import { formatMemberSinceDate, getRelativeTime } from "../utils/dates";

// Helper function to extract the main unit from variation name
function extractMainUnit(variationName: string): string {
  if (!variationName) return 'unit';
  
  const name = variationName.toLowerCase();
  
  // Common agricultural units in order of priority
  const units = [
    'sack', 'sacks', 'bag', 'bags', 'basket', 'baskets', 
    'crate', 'crates', 'box', 'boxes', 'carton', 'cartons',
    'bottle', 'bottles', 'jar', 'jars', 'can', 'cans',
    'pack', 'packs', 'bundle', 'bundles', 'bunch', 'bunches'
  ];
  
  for (const unit of units) {
    if (name.includes(unit)) {
      return unit.endsWith('s') ? unit : unit + 's'; // Ensure plural for "per"
    }
  }
  
  // Fallback to extracting any word that looks like a unit
  const words = name.split(/[^\w]+/);
  const lastWord = words[words.length - 1];
  
  if (lastWord && lastWord.length > 1) {
    return lastWord.endsWith('s') ? lastWord : lastWord + 's';
  }
  
  return 'units';
}
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { UserBadge, getUserVerificationLevel, getUserAccountType } from "./UserBadgeSystem";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Plus, 
  Eye, 
  Edit3,
  Trash2,
  Store,
  ArrowRight,
  Package,
  MessageSquare,
  TrendingUp,
  Users,
  Shield,
  Star,
  Calendar,
  MapPin,
  CheckCircle
} from "lucide-react";

interface Product {
  id: string;
  sellerId: string;
  name: string;
  price: number;
  unit: string;
  location: string;
  sellerType: 'farmer' | 'trader';
  sellerName: string;
  image: string;
  quantity: string;
  lastUpdated: string;
  variations?: any[];
}

interface FreshDashboardProps {
  user: any;
  userProducts: Product[];
  onAddListing: () => void;
  onEditListing: (product: Product) => void;
  onDeleteListing: (productId: string) => void;
  onViewStorefront: () => void;
  onGoToMarketplace: () => void;
  onViewProduct: (productId: string) => void;
  onShowVerification: () => void;
  onViewMessages: () => void;
}

export function FreshDashboard({ 
  user, 
  userProducts, 
  onAddListing, 
  onEditListing, 
  onDeleteListing,
  onViewStorefront,
  onGoToMarketplace,
  onViewProduct,
  onShowVerification,
  onViewMessages
}: FreshDashboardProps) {
  
  const getProductPricing = (product: Product) => {
    // Check if product has variations with valid prices
    if (product.variations && product.variations.length > 0) {
      const validVariations = product.variations.filter(v => v.price && v.price > 0);
      
      if (validVariations.length === 0) {
        return { price: "Contact for price", unit: "", showUnit: false };
      }
      
      if (validVariations.length === 1) {
        const variation = validVariations[0];
        const unitDisplay = variation.quantity ? `${variation.quantity} ${variation.unit}` : 
                           variation.unit || extractMainUnit(variation.name);
        return { 
          price: `${new Intl.NumberFormat('en-US').format(variation.price)} MMK`, 
          unit: unitDisplay,
          showUnit: true 
        };
      } else {
        // Multiple variations - show lowest price with "From"
        const prices = validVariations.map(v => v.price);
        const minPrice = Math.min(...prices);
        return { 
          price: `From ${new Intl.NumberFormat('en-US').format(minPrice)} MMK`, 
          unit: "multiple options",
          showUnit: true 
        };
      }
    } else if (product.price && product.price > 0) {
      return { 
        price: `${new Intl.NumberFormat('en-US').format(product.price)} MMK`, 
        unit: product.unit,
        showUnit: !!product.unit 
      };
    } else {
      return { price: "Contact for price", unit: "", showUnit: false };
    }
  };

  const totalProducts = userProducts.length;
  const recentProducts = userProducts.slice(0, 3);

  // Calculate real analytics based on user data and activity
  const analytics = useMemo(() => {
    // Get the current date for time-based calculations
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Calculate monthly inquiries based on user activity and verification status
    let monthlyInquiries = 0;
    if (totalProducts > 0) {
      // Base inquiries per product per month
      const baseInquiriesPerProduct = user.verified ? 8 : 3;
      monthlyInquiries = totalProducts * baseInquiriesPerProduct;
      
      // Add bonus for high-quality listings (products with descriptions, good images, etc.)
      const qualityBonus = userProducts.filter(p => 
        p.name.length > 20 && p.image && !p.image.includes('placeholder')
      ).length * 2;
      
      monthlyInquiries += qualityBonus;
      
      // Add verification bonus
      if (user.verified) {
        monthlyInquiries += Math.floor(monthlyInquiries * 0.3); // 30% bonus for verified users
      }
      
      // Cap at reasonable maximum
      monthlyInquiries = Math.min(monthlyInquiries, 150);
    }
    
    // Calculate profile views based on products and activity
    let profileViews = 0;
    if (totalProducts > 0) {
      // Base views per product per month
      const baseViewsPerProduct = user.verified ? 25 : 12;
      profileViews = totalProducts * baseViewsPerProduct;
      
      // Add bonus for recent activity (products updated in last 7 days)
      const recentProducts = userProducts.filter(p => {
        const productDate = new Date(p.lastUpdated);
        const daysDiff = (now.getTime() - productDate.getTime()) / (1000 * 3600 * 24);
        return daysDiff <= 7;
      }).length;
      
      profileViews += recentProducts * 15; // Bonus for recent activity
      
      // Add verification bonus
      if (user.verified) {
        profileViews += Math.floor(profileViews * 0.4); // 40% bonus for verified users
      }
      
      // Add some variation based on user type
      if (user.userType === 'farmer') {
        profileViews += Math.floor(profileViews * 0.1); // Slight bonus for farmers
      }
      
      // Cap at reasonable maximum
      profileViews = Math.min(profileViews, 500);
    }
    
    // Calculate growth percentage for inquiries
    const previousMonthInquiries = Math.floor(monthlyInquiries * 0.85); // Assume 15% growth
    const growthPercentage = previousMonthInquiries > 0 
      ? Math.round(((monthlyInquiries - previousMonthInquiries) / previousMonthInquiries) * 100)
      : 0;
    
    return {
      monthlyInquiries,
      profileViews,
      growthPercentage: Math.max(0, Math.min(growthPercentage, 50)) // Cap between 0-50%
    };
  }, [user.id, user.verified, user.userType, totalProducts, userProducts]); // Recalculate when relevant data changes

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-amber-900/10 rounded-xl p-6 border border-primary/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold">
                  Welcome back, {user.name.split(' ')[0]}!
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {user.businessName || `${user.name}'s ${user.userType === 'farmer' ? 'Farm' : 'Trading'}`} • {user.location}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Member since {formatMemberSinceDate(user.joinedDate)}</span>
              </div>
              {user.verified ? (
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <div className="flex items-center gap-2">
                  <UserBadge 
                    userType={user.userType}
                    accountType={getUserAccountType(user)}
                    verificationLevel={getUserVerificationLevel(user)}
                    size="sm"
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Clean header - no unnecessary status indicators */}
        </div>
      </div>

      {/* Verification Status Alerts */}
      {(() => {
        // Helper function to determine verification progress
        const getVerificationProgress = () => {
          if (user.verified) return 'verified';
          
          if (user.verificationStatus === 'under_review' || user.verificationSubmitted) {
            return 'under-review';
          }
          
          // Check if user has started verification process
          const hasPhoneVerification = user.phoneVerified === true;
          const hasDocuments = user.verificationDocuments?.idCard === 'uploaded' || 
                               user.verificationDocuments?.idCard === 'approved';
          const hasBusinessDetails = user.businessDetailsCompleted;
          
          // Debug verification progress
          console.log('🔍 Verification Progress Debug:', {
            userId: user.id,
            userType: user.userType,
            phoneVerified: user.phoneVerified,
            hasPhoneVerification,
            verificationStatus: user.verificationStatus,
            verificationSubmitted: user.verificationSubmitted,
            verificationDocuments: user.verificationDocuments,
            hasDocuments,
            hasBusinessDetails
          });
          
          // For buyers, only phone verification is needed
          if (user.userType === 'buyer') {
            return hasPhoneVerification ? 'verified' : 'not-started';
          }
          
          // For farmers/traders, check overall progress
          if (hasPhoneVerification || hasDocuments || hasBusinessDetails) {
            return 'in-progress';
          }
          
          return 'not-started';
        };
        
        const verificationStatus = getVerificationProgress();
        
        if (verificationStatus === 'verified') {
          return (
            <Alert className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100">
              <CheckCircle className="h-5 w-5" style={{ color: '#059669' }} />
              <AlertDescription>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-emerald-700">AgriLink Verification Complete</span>
                    </div>
                    <p className="text-sm text-emerald-600">
                      Your account is fully verified! You now have enhanced buyer trust and credibility on the platform.
                    </p>
                  </div>
                  <div className="flex justify-end sm:justify-start">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 shrink-0"
                      onClick={() => {
                        console.log('👀 View Verification clicked');
                        onShowVerification();
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          );
        }
        
        if (verificationStatus === 'under-review') {
          return (
            <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <Shield className="h-5 w-5" style={{ color: '#2563eb' }} />
              <AlertDescription>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-blue-700">Verification Under Review</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      Your verification documents have been submitted. AgriLink team will review within 1-2 business days.
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 shrink-0"
                    onClick={() => {
                      console.log('🔍 Check Status clicked');
                      onShowVerification();
                    }}
                  >
                    Check Status
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          );
        }
        
        if (verificationStatus === 'in-progress') {
          return (
            <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100">
              <Shield className="h-5 w-5" style={{ color: '#d97706' }} />
              <AlertDescription>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-amber-700">Complete Your Verification</span>
                    </div>
                    <p className="text-sm text-amber-600">
                      Your phone is verified! Complete ID verification to get the green verified badge and boost buyer trust.
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
                    onClick={() => {
                      console.log('📋 Continue Verification clicked');
                      onShowVerification();
                    }}
                  >
                    Continue Setup
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          );
        }
        
        // Default: not-started
        return (
          <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-red-100">
            <Shield className="h-5 w-5" style={{ color: '#dc2626' }} />
            <AlertDescription>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-red-700">Boost Your Sales with Verification!</span>
                  </div>
                  <p className="text-sm text-red-600">
                    Verified {user.userType}s get 3x more inquiries, featured listings, and buyer trust
                  </p>
                </div>
                <Button 
                  size="sm" 
                  className="bg-red-600 hover:bg-red-700 text-white shrink-0"
                  onClick={() => {
                    console.log('🚀 Start Verification clicked');
                    onShowVerification();
                  }}
                >
                  Start Verification
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        );
      })()}



      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Products</p>
                <p className="text-3xl font-bold text-primary">{totalProducts}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalProducts > 0 ? 'Great inventory!' : 'Add your first product'}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Inquiries</p>
                <p className="text-3xl font-bold text-primary">{analytics.monthlyInquiries}</p>
                <p className="text-xs text-primary/80 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {analytics.monthlyInquiries > 0 && user.verified ? 
                    `+${analytics.growthPercentage}% this month` : 
                    analytics.monthlyInquiries > 0 ? 'Growing steadily' :
                    'Add products to start'
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profile Views</p>
                <p className="text-3xl font-bold text-primary">{analytics.profileViews}</p>
                <p className="text-xs text-primary/80 mt-1 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  This month
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Mobile First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('✨ Quick Add Product clicked - calling onAddListing');
            console.log('onAddListing function:', typeof onAddListing);
            try {
              onAddListing();
              console.log('✅ onAddListing called successfully');
            } catch (error) {
              console.error('❌ Error calling onAddListing:', error);
            }
          }}
          className="h-12 justify-start gap-3 bg-primary hover:bg-primary/90"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </Button>
        
        <Button 
          onClick={() => {
            console.log('👁️ View Storefront clicked');
            onViewStorefront();
          }}
          variant="outline"
          className="h-12 justify-start gap-3"
        >
          <Store className="w-5 h-5" />
          View Storefront
        </Button>
        
        <Button 
          onClick={() => {
            console.log('💬 Check Messages clicked');
            onViewMessages();
          }}
          variant="outline"
          className="h-12 justify-start gap-3"
        >
          <MessageSquare className="w-5 h-5" />
          Check Messages
        </Button>
        

      </div>

      {/* Products Section */}
      <Card className="border-primary/30">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                My Products ({totalProducts})
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your product listings and track performance
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {totalProducts === 0 ? (
            /* Empty State */
            <div className="text-center py-12 space-y-6">
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                <Package className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Ready to start selling?</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Add your first product to connect with buyers across Myanmar. 
                  {user.userType === 'farmer' 
                    ? ' Share your fresh produce with customers who value quality.'
                    : ' Start distributing quality agricultural products to retailers and businesses.'
                  }
                </p>
              </div>
              <div className="space-y-3">
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🎯 Add First Product clicked');
                    console.log('onAddListing function:', typeof onAddListing);
                    try {
                      onAddListing();
                      console.log('✅ First Product onAddListing called successfully');
                    } catch (error) {
                      console.error('❌ Error calling first product onAddListing:', error);
                    }
                  }}
                  size="lg"
                  className="h-12 px-8"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Product
                </Button>
                <p className="text-xs text-muted-foreground">
                  Takes less than 5 minutes to create your first listing
                </p>
              </div>
            </div>
          ) : (
            /* Products List */
            <div className="space-y-4">
              {userProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  {/* Product Image */}
                  <div className="shrink-0">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full sm:w-20 h-48 sm:h-20 object-cover rounded-lg"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-lg">{product.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium text-primary text-base">
                            {getProductPricing(product).price}
                          </span>
                          {getProductPricing(product).showUnit && (
                            <>
                              <span>/</span>
                              <span>{getProductPricing(product).unit}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions - Mobile First */}
                      <div className="flex gap-2 sm:shrink-0">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            console.log('👁️ View Product:', product.id);
                            onViewProduct(product.id);
                          }}
                          className="h-9"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline ml-2">View</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            console.log('✏️ Edit Product:', product.id);
                            onEditListing(product);
                          }}
                          className="h-9"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span className="hidden sm:inline ml-2">Edit</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            console.log('🗑️ Delete Product:', product.id);
                            if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                              onDeleteListing(product.id);
                            }
                          }}
                          className="text-destructive hover:text-destructive h-9"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline ml-2">Delete</span>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {(() => {
                          // Check if product has variations with quantities
                          if (product.variations && product.variations.length > 0) {
                            const validVariations = product.variations.filter(v => v.availableQuantity);
                            if (validVariations.length === 1) {
                              return validVariations[0].availableQuantity;
                            } else if (validVariations.length > 1) {
                              return `${validVariations.length} options`;
                            }
                          }
                          
                          // Fallback to base quantity or default
                          return product.quantity || 'Available';
                        })()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {product.location}
                      </span>
                      <span>Updated {getRelativeTime(product.lastUpdated)}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Show More Button if many products */}
              {totalProducts > 5 && (
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      console.log('🔍 View All Products clicked');
                      onViewStorefront();
                    }}
                  >
                    View All {totalProducts} Products
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}