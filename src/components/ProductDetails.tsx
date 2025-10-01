import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { UserBadge, getUserVerificationLevel, getUserAccountType } from "./UserBadgeSystem";
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
  FileText,
  CreditCard
} from "lucide-react";
import { getRelativeTime } from "../utils/dates";



import type { Product } from "../data/products";

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

  // Product details - use actual product data when available, otherwise generate reasonable defaults
  const productDetails = {
    description: product.description || `High-quality ${product.name.toLowerCase()} sourced ${product.sellerType === 'farmer' ? 'directly from our farm' : 'from trusted farmers'} in ${product.location}. ${product.sellerType === 'farmer' ? 'Grown using sustainable farming practices.' : 'Carefully selected and stored to ensure freshness.'}`,
    harvestDate: product.sellerType === 'farmer' ? 'January 15, 2024' : 'January 10-20, 2024',
    minimumOrder: product.minimumOrder || '10 ' + product.unit.split('(')[0].trim() + 's',
    deliveryOptions: product.deliveryOptions && product.deliveryOptions.length > 0 
      ? product.deliveryOptions 
      : [
          'Nationwide Shipping', 
          'Express Delivery', 
          'Local Delivery (Within 10km)', 
          'Pickup', 
          'Regional Delivery'
        ],
    paymentTerms: product.paymentTerms && product.paymentTerms.length > 0 
      ? product.paymentTerms.join(', ')
      : 'Cash on Pickup, Bank Transfer, 50% Advance, 50% on Delivery, Mobile Payment'
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
      <div className="space-y-4">
        {/* Back button row */}
        <Button variant="ghost" onClick={onBack} className="h-9 px-3 -ml-3">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        {/* Title section */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
          <p className="text-muted-foreground">Product Details</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Product Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Image and Basic Info */}
          <Card className="border-primary/30">
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
                        // Simplified pricing display
                        if (product.price && product.price > 0) {
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
                    {product.priceChange !== undefined && (
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
                    )}
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
            <Card className="border-primary/30">
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

          {/* Order & Delivery Information */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order & Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Requirements */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Available Quantity */}
                {product.availableQuantity && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      Available Stock
                    </h4>
                    <p className="text-sm text-muted-foreground">{product.availableQuantity}</p>
                  </div>
                )}
                
                {/* Minimum Order */}
                {product.minimumOrder && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      Minimum Order
                    </h4>
                    <p className="text-sm text-muted-foreground">{product.minimumOrder}</p>
                  </div>
                )}
              </div>

              {/* Payment Terms */}
              {product.paymentTerms && product.paymentTerms.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      Payment Terms
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {product.paymentTerms.map((term, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Delivery Options */}
              {product.deliveryOptions && product.deliveryOptions.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Truck className="w-4 h-4 text-muted-foreground" />
                      Delivery Options
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {product.deliveryOptions.map((option, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Additional Notes */}
              {product.additionalNotes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Info className="w-4 h-4 text-muted-foreground" />
                      Additional Information
                    </h4>
                    <div className="p-3 bg-muted/30 rounded-md border border-dashed border-muted-foreground/20">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{product.additionalNotes}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Fallback message if no order info available */}
              {!product.availableQuantity && !product.minimumOrder && 
               (!product.paymentTerms || product.paymentTerms.length === 0) && 
               (!product.deliveryOptions || product.deliveryOptions.length === 0) && 
               !product.additionalNotes && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p>Contact seller for detailed order information</p>
                  <p className="text-sm">Payment terms and delivery options available upon inquiry</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Seller Information Sidebar */}
        <div className="space-y-6">
          <Card className="border-primary/30">
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
                  <UserBadge 
                    userType={product.sellerType}
                    accountType={sellerVerificationStatus?.accountType || 'individual'}
                    verificationLevel={sellerVerificationStatus ? 
                      sellerVerificationStatus.trustLevel : 'unverified'}
                    size="sm"
                  />
                  

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

              <div className="space-y-2">
                {sellerProfile?.email && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{sellerProfile.email}</span>
                  </div>
                )}
                
                {!isOwnProduct && (
                  <Button 
                    onClick={() => onViewStorefront(product.sellerId)}
                    variant="outline" 
                    size="sm"
                    className="w-full"
                  >
                    <Store className="w-4 h-4 mr-2" />
                    View Full Storefront
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
}