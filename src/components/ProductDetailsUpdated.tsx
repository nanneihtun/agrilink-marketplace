import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { 
  ChevronLeft,
  ChevronRight, 
  MapPin, 
  Calendar, 
  Package, 
  TrendingUp, 
  TrendingDown,
  MessageCircle,
  BarChart3,
  User,
  Star,
  Store,
  Truck,
  Clock,
  Phone,
  Shield,
  AlertTriangle,
  Info,
  CheckCircle,
  Edit,
  FileText
} from "lucide-react";
import { getRelativeTime } from "../utils/dates";

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
  
  // Find the unit in the variation name
  for (const unit of units) {
    if (name.includes(unit)) {
      // Return singular form
      return unit.endsWith('s') ? unit.slice(0, -1) : unit;
    }
  }
  
  // Fallback: if no specific unit found, try to extract from the end
  const words = name.trim().split(/\s+/);
  const lastWord = words[words.length - 1];
  
  // If last word looks like a unit, use it
  if (lastWord && lastWord.length > 2 && lastWord.length < 10) {
    return lastWord.endsWith('s') ? lastWord.slice(0, -1) : lastWord;
  }
  
  return 'unit';
}

interface ProductVariation {
  id: string;
  name: string;
  quantity: string; // Quantity amount (e.g., "50")
  unit: string; // Unit type (e.g., "kg", "bags", "basket")
  price: number;
  availableQuantity?: string; // How many total available (e.g., "100 bags available")
  minOrder: string; // Actual field name in data
  deliveryOption?: string; // Legacy single delivery option (kept for backward compatibility)
  deliveryOptions?: string[]; // New: Array of delivery options per variation
  paymentTerms?: string[]; // New: Array of payment terms per variation
  description: string;
  additionalNotes?: string;
}

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
  priceChange: number;
  lastUpdated: string;
  variations: ProductVariation[];
}

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onChat: (productId: string) => void;
  onPriceCompare: (productId: string) => void;
  onViewStorefront: (sellerId: string) => void;
  onEditProduct?: (product: Product) => void;
  currentUserId?: string;
  isUserVerified?: boolean;
  userType?: string;
  isPhoneVerified?: boolean;
  sellerVerified?: boolean;
  sellerVerificationStatus?: {
    idVerified: boolean;
    businessVerified: boolean;
    verified: boolean;
    trustLevel: 'unverified' | 'under-review' | 'id-verified' | 'business-verified';
    tierLabel: string;
    levelBadge: string;
    level: number;
    userType?: string;
  };
  // New props for dynamic seller data
  sellerProfile?: {
    id: string;
    name: string;
    businessName?: string;
    userType?: string;
    location: string;
    experience?: string;
    joinedDate?: string;
    rating?: number;
    totalReviews?: number;
    yearsActive?: number;
    responseTime?: string;
    phone?: string;
    openingHours?: string;
  };
}

export function ProductDetails({ 
  product, 
  onBack, 
  onChat, 
  onPriceCompare,
  onViewStorefront,
  onEditProduct,
  currentUserId,
  isUserVerified = false,
  userType,
  isPhoneVerified = false,
  sellerVerified = false,
  sellerVerificationStatus,
  sellerProfile
}: ProductDetailsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  // Product details - use actual description if available, otherwise generate placeholder
  const productDetails = {
    description: product.description || `High-quality ${product.name.toLowerCase()} sourced ${product.sellerType === 'farmer' ? 'directly from our farm' : 'from trusted farmers'} in ${product.location}. ${product.sellerType === 'farmer' ? 'Grown using sustainable farming practices.' : 'Carefully selected and stored to ensure freshness.'}`,
    harvestDate: product.sellerType === 'farmer' ? 'January 15, 2024' : 'January 10-20, 2024',
    minimumOrder: '10 ' + product.unit.split('(')[0].trim() + 's',
    deliveryOptions: [
      'Nationwide Shipping', 
      'Express Delivery', 
      'Local Delivery (Within 10km)', 
      'Pickup', 
      'Regional Delivery'
    ],
    paymentTerms: 'Cash on Pickup, Bank Transfer, 50% Advance, 50% on Delivery, Mobile Payment'
  };

  // Use dynamic seller data when available, fall back to reasonable defaults
  const sellerDetails = {
    rating: sellerProfile?.rating || 4.2,
    totalReviews: sellerProfile?.totalReviews || (product.sellerType === 'farmer' ? 15 : 28),
    yearsActive: sellerProfile?.yearsActive || (sellerProfile?.experience ? parseInt(sellerProfile.experience.split(' ')[0]) || 1 : (product.sellerType === 'farmer' ? 5 : 8)),
    responseTime: sellerProfile?.responseTime || (product.sellerType === 'farmer' ? '3 hours' : '1 hour')
  };

  // Check if current user is the seller of this product
  const isOwnProduct = currentUserId && product.sellerId === currentUserId;
  
  // Image navigation state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const productImages = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
  
  const visibleThumbnails = 5; // Number of thumbnails visible at once
  
  // Navigation functions
  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };
  
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };
  
  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
    // Auto-scroll thumbnails to keep selected thumbnail visible
    if (index < thumbnailStartIndex) {
      setThumbnailStartIndex(index);
    } else if (index >= thumbnailStartIndex + visibleThumbnails) {
      setThumbnailStartIndex(index - visibleThumbnails + 1);
    }
  };
  
  const handleThumbnailPrevious = () => {
    setThumbnailStartIndex((prev) => Math.max(0, prev - 1));
  };
  
  const handleThumbnailNext = () => {
    setThumbnailStartIndex((prev) => 
      Math.min(productImages.length - visibleThumbnails, prev + 1)
    );
  };
  
  // Touch/swipe support for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (productImages.length > 1) {
      if (isLeftSwipe) {
        handleNextImage();
      }
      if (isRightSwipe) {
        handlePreviousImage();
      }
    }
  };
  
  // Sync thumbnail navigation when current image changes
  useEffect(() => {
    if (currentImageIndex < thumbnailStartIndex) {
      setThumbnailStartIndex(currentImageIndex);
    } else if (currentImageIndex >= thumbnailStartIndex + visibleThumbnails) {
      setThumbnailStartIndex(Math.max(0, currentImageIndex - visibleThumbnails + 1));
    }
  }, [currentImageIndex, thumbnailStartIndex, visibleThumbnails]);
  
  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (productImages.length > 1) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          handlePreviousImage();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          handleNextImage();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [productImages.length]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <ChevronLeft 
          className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors" 
          onClick={onBack}
        />
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-muted-foreground">Product Details</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Product Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Image and Basic Info */}
          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  {/* Dynamic Image Gallery with Navigation */}
                  {productImages.length > 0 ? (
                    <div className="space-y-3">
                      {/* Main Image Display with Navigation */}
                      <div className="relative">
                        <img 
                          src={productImages[currentImageIndex]} 
                          alt={`${product.name} - Image ${currentImageIndex + 1}`}
                          className="w-full h-64 object-cover rounded-lg cursor-pointer select-none"
                          onTouchStart={handleTouchStart}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          draggable={false}
                        />
                        
                        {/* Image Counter - Only show when multiple images */}
                        {productImages.length > 1 && (
                          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                            {currentImageIndex + 1} / {productImages.length}
                          </div>
                        )}
                      </div>
                      
                      {/* Thumbnail Gallery with Navigation - Shopee style */}
                      {productImages.length > 1 && (
                        <div className="space-y-2">
                          <div className="relative">
                            {/* Thumbnail Container with Overlay Navigation */}
                            <div className="flex gap-2 overflow-hidden">
                              {productImages.slice(thumbnailStartIndex, thumbnailStartIndex + visibleThumbnails).map((image, displayIndex) => {
                                const actualIndex = thumbnailStartIndex + displayIndex;
                                const isFirst = displayIndex === 0;
                                const isLast = displayIndex === visibleThumbnails - 1;
                                const canScrollLeft = thumbnailStartIndex > 0;
                                const canScrollRight = thumbnailStartIndex + visibleThumbnails < productImages.length;
                                
                                return (
                                  <div key={actualIndex} className="relative flex-shrink-0">
                                    <img 
                                      src={image} 
                                      alt={`${product.name} - View ${actualIndex + 1}`}
                                      className={`w-16 h-16 object-cover rounded border-2 cursor-pointer transition-all ${
                                        actualIndex === currentImageIndex 
                                          ? 'border-primary ring-2 ring-primary/20' 
                                          : 'border-border hover:border-primary'
                                      }`}
                                      onClick={() => handleThumbnailClick(actualIndex)}
                                    />
                                    
                                    {/* Left Chevron - Overlay on first thumbnail */}
                                    {isFirst && canScrollLeft && (
                                      <button
                                        onClick={handleThumbnailPrevious}
                                        className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 bg-white/90 hover:bg-white border border-black/20 rounded-sm shadow-sm flex items-center justify-center transition-all duration-200 z-10"
                                      >
                                        <ChevronLeft className="w-3 h-3 text-gray-700" />
                                      </button>
                                    )}
                                    
                                    {/* Right Chevron - Overlay on last thumbnail */}
                                    {isLast && canScrollRight && (
                                      <button
                                        onClick={handleThumbnailNext}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 bg-white/90 hover:bg-white border border-black/20 rounded-sm shadow-sm flex items-center justify-center transition-all duration-200 z-10"
                                      >
                                        <ChevronRight className="w-3 h-3 text-gray-700" />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  ) : (
                    /* No images fallback */
                    <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">No images available</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {(() => {
                        // Industry standard pricing logic - same as ProductCard
                        if (product.variations && product.variations.length > 0) {
                          const validVariations = product.variations.filter(v => v.price && v.price > 0);
                          
                          if (validVariations.length === 0) {
                            return (
                              <>
                                <span className="text-3xl font-bold">Contact</span>
                                <span className="text-muted-foreground">for price</span>
                              </>
                            );
                          }
                          
                          if (validVariations.length === 1) {
                            const variation = validVariations[0];
                            const unitDisplay = variation.quantity ? `${variation.quantity} ${variation.unit}` : variation.unit;
                            return (
                              <>
                                <span className="text-3xl font-bold">{formatPrice(variation.price)} MMK</span>
                                <span className="text-muted-foreground">per {unitDisplay}</span>
                              </>
                            );
                          } else {
                            // Multiple variations - show lowest price with "From"
                            const prices = validVariations.map(v => v.price);
                            const minPrice = Math.min(...prices);
                            return (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg text-muted-foreground">From</span>
                                  <span className="text-3xl font-bold">{formatPrice(minPrice)} MMK</span>
                                </div>
                                <span className="text-muted-foreground">multiple options available</span>
                              </>
                            );
                          }
                        } else if (product.price && product.price > 0) {
                          return (
                            <>
                              <span className="text-3xl font-bold">{formatPrice(product.price)} MMK</span>
                              <span className="text-muted-foreground">per {product.unit}</span>
                            </>
                          );
                        } else {
                          return (
                            <>
                              <span className="text-3xl font-bold">Contact</span>
                              <span className="text-muted-foreground">for price</span>
                            </>
                          );
                        }
                      })()}
                    </div>
                    <div className="flex items-center gap-2">
                      {product.priceChange > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm ${product.priceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.priceChange > 0 ? '+' : ''}{product.priceChange}% from last week
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Available: {product.quantity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{product.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Updated {getRelativeTime(product.lastUpdated)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isOwnProduct ? (
                      <>
                        {onEditProduct && (
                          <Button onClick={() => onEditProduct(product)} className="flex-1">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Product
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          onClick={() => onPriceCompare(product.id)}
                          className="flex-1"
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          See Market Prices
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => onChat(product.id)} className="flex-1">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contact Seller
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => onPriceCompare(product.id)}
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Compare Prices
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Description */}
          {productDetails.description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Product Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{productDetails.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Product Variations */}
          <Card>
            <CardHeader>
              <CardTitle>
                Available Variations {product.variations && product.variations.length > 0 ? `(${product.variations.length})` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.variations && product.variations.length > 0 ? (
                <div className="space-y-4">
                  {product.variations.map((variation) => (
                  <div key={variation.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-lg">{variation.name || 'Product Option'}</h4>
                        <p className="text-sm text-muted-foreground">{variation.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(variation.price)} MMK
                        </div>
                        <div className="text-sm text-muted-foreground">
                          per {extractMainUnit(variation.name)}
                        </div>

                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Available</div>
                          <div className="text-muted-foreground">{variation.availableQuantity || 'Available on order'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Min. Order</div>
                          <div className="text-muted-foreground">
                            {variation.minOrder || `1 ${extractMainUnit(variation.name)}`}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Terms for this variation */}
                    {(variation.paymentTerms && variation.paymentTerms.length > 0) && (
                      <div className="mt-3 p-3 bg-muted/20 rounded-md border border-muted-foreground/20">
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                            <span className="text-xs text-primary">💳</span>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium mb-1">Payment Options</div>
                            <div className="text-muted-foreground">
                              {variation.paymentTerms.join(' • ')}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Delivery Options for this variation */}
                    {((variation.deliveryOptions && variation.deliveryOptions.length > 0) || variation.deliveryOption) && (
                      <div className="mt-3 p-3 bg-muted/20 rounded-md border border-muted-foreground/20">
                        <div className="flex items-start gap-2">
                          <Truck className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <div className="font-medium mb-1">Delivery Options</div>
                            <div className="text-muted-foreground">
                              {variation.deliveryOptions ? 
                                variation.deliveryOptions.join(' • ') : 
                                variation.deliveryOption
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Additional Notes */}
                    {variation.additionalNotes && (
                      <div className="mt-3 p-3 bg-muted/30 rounded-md border border-dashed border-muted-foreground/20">
                        <div className="flex items-start gap-2">
                          <FileText className="w-3 h-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <div className="text-xs text-muted-foreground">
                            {variation.additionalNotes}
                          </div>
                        </div>
                      </div>
                    )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No specific package options available.</p>
                  <p className="text-sm">Contact seller for more details.</p>
                </div>
              )}

              {/* Fallback Payment Terms Section - Only show if no variations have individual terms */}
              {product.variations && product.variations.length > 0 && 
                !product.variations.some(variation => variation.paymentTerms && variation.paymentTerms.length > 0) && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium mb-2">Payment Terms</h4>
                  <p className="text-sm text-muted-foreground">{productDetails.paymentTerms}</p>
                </div>
              )}

              {/* Fallback Delivery Options Section - Only show if no variations have individual options */}
              {product.variations && product.variations.length > 0 && 
                !product.variations.some(variation => 
                  (variation.deliveryOptions && variation.deliveryOptions.length > 0) || variation.deliveryOption
                ) && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium mb-2">Delivery</h4>
                  <p className="text-sm text-muted-foreground">{productDetails.deliveryOptions.join(', ')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Seller Information Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Seller Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Store className="w-4 h-4 text-muted-foreground" />
                  <button 
                    className="font-medium text-primary hover:underline"
                    onClick={() => onViewStorefront(product.sellerId)}
                  >
                    {product.sellerName}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={
                      product.sellerType === 'farmer' 
                        ? 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800'
                        : product.sellerType === 'trader'
                        ? 'text-primary bg-primary/10 border-primary/20 dark:text-primary-foreground dark:bg-primary/20 dark:border-primary/30'
                        : 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800'
                    }
                  >
                    {product.sellerType === 'farmer' ? 'Direct Farmer' : product.sellerType === 'trader' ? 'Trader' : 'Buyer'}
                  </Badge>
                  
                  {/* Enhanced verification status with level badges */}
                  {sellerVerificationStatus ? (
                    <div className="flex items-center gap-1">
                      {sellerVerificationStatus.level === 2 ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Shield className="w-6 h-6 text-green-600 cursor-pointer hover:text-green-700 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-green-700 text-white border-green-600">
                              <p className="text-sm font-medium">{sellerVerificationStatus.tierLabel}</p>
                              <p className="text-xs text-green-100">Personal identity and business details verified</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : sellerVerificationStatus.level === 1 ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <CheckCircle className="w-6 h-6 text-green-600 cursor-pointer hover:text-green-700 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-green-700 text-white border-green-600">
                              <p className="text-sm font-medium">{sellerVerificationStatus.tierLabel}</p>
                              <p className="text-xs text-green-100">Personal identity verified</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : sellerVerificationStatus.trustLevel === 'under-review' ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Clock className="w-6 h-6 text-primary cursor-pointer hover:text-primary/80 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-primary text-white border-primary">
                              <p className="text-sm font-medium">{sellerVerificationStatus.tierLabel}</p>
                              <p className="text-xs text-white/90">Verification documents under review</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertTriangle className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-600 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-red-600 text-white border-red-500">
                              <p className="text-sm font-medium">{sellerVerificationStatus.tierLabel}</p>
                              <p className="text-xs text-red-100">No verification documents submitted</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertTriangle className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-600 transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-red-600 text-white border-red-500">
                          <p className="text-sm font-medium">Unverified Seller</p>
                          <p className="text-xs text-red-100">Seller verification status unknown</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{product.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">
                    {sellerDetails.rating.toFixed(1)} ({sellerDetails.totalReviews} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{sellerDetails.yearsActive} years in business</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Usually responds within {sellerDetails.responseTime}</span>
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Contact Information</h4>
                
                {sellerProfile?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{sellerProfile.phone}</span>
                  </div>
                )}
                
                {sellerProfile?.openingHours && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium">Business Hours</div>
                      <div className="text-muted-foreground">{sellerProfile.openingHours}</div>
                    </div>
                  </div>
                )}
              </div>

              {!isOwnProduct && (
                <Button 
                  onClick={() => onViewStorefront(product.sellerId)}
                  variant="outline" 
                  className="w-full"
                >
                  <Store className="w-4 h-4 mr-2" />
                  View Full Storefront
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Price History & Market Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Market Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Market Average</span>
                <span className="text-sm font-medium">
                  {formatPrice(product.price * (1 + Math.random() * 0.2 - 0.1))} MMK
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Price Trend</span>
                <div className="flex items-center gap-1">
                  {product.priceChange > 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                  <span className={`text-sm ${product.priceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.priceChange > 0 ? '+' : ''}{product.priceChange}%
                  </span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-3"
                onClick={() => onPriceCompare(product.id)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Compare Market Prices
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}