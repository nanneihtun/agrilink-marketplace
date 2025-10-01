import React from "react";
import { Badge } from "./ui/badge";
import { UserBadge, PublicVerificationStatus, AccountTypeBadge, getUserVerificationLevel, getUserAccountType } from "./UserBadgeSystem";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { MapPin, MessageCircle, Store, Package, Shield, Clock, Trash2, CheckCircle, Camera, Sprout, Heart, DollarSign } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getRelativeTime } from "../utils/dates";
import { OfferModal } from "./OfferModal";

import type { Product } from "../data/products";

interface ProductCardProps {
  product: Product;
  onChat: (productId: string) => void;
  onViewDetails: (productId: string) => void;
  onViewStorefront: (sellerId: string) => void;
  onDelete?: (productId: string) => void;
  onSaveProduct?: (productId: string, price: number) => void;
  onMakeOffer?: (product: Product) => void;
  currentUserId?: string;
  currentUserType?: string;
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
  adminMode?: boolean;
  savedProductIds?: string[];
}

// Helper function to get dynamic seller information
function getDynamicSellerInfo(sellerId: string, currentUserId?: string, productLastUpdated?: string) {
  try {
    // First check if it's the current user
    const currentUserStr = localStorage.getItem('agriconnect-myanmar-current-user');
    if (currentUserStr && currentUserId === sellerId) {
      const currentUser = JSON.parse(currentUserStr);
      return {
        name: currentUser.businessName || currentUser.name || 'Unknown Seller',
        location: currentUser.location || 'Location not set',
        lastUpdated: productLastUpdated ? getRelativeTime(productLastUpdated) : 'Recently',
      };
    }
    
    // Then check other users in localStorage
    const users = JSON.parse(localStorage.getItem('agriconnect-myanmar-users') || '[]');
    const seller = users.find((user: any) => user.id === sellerId);
    
    if (seller) {
      return {
        name: seller.businessName || seller.name || 'Unknown Seller',
        location: seller.location || 'Location not set',
        lastUpdated: productLastUpdated ? getRelativeTime(productLastUpdated) : 'Recently',
      };
    }
  } catch (error) {
    console.error('Error fetching seller info:', error);
  }
  
  // Fallback to product's cached data if seller not found
  return null;
}

export function ProductCard({ product, onChat, onViewDetails, onViewStorefront, onDelete, onSaveProduct, onMakeOffer, currentUserId, currentUserType, sellerVerified = false, sellerVerificationStatus, adminMode = false, savedProductIds = [] }: ProductCardProps) {
  // Check if current user is the seller of this product
  const isOwnProduct = currentUserId && product.sellerId === currentUserId;
  
  // Check if product is saved by current user
  const isSaved = savedProductIds.includes(product.id);
  
  // Get current price for saving
  const getCurrentPrice = () => {
    return product.price || 0;
  };
  
  const handleSaveToggle = () => {
    if (onSaveProduct && currentUserId && !isOwnProduct) {
      onSaveProduct(product.id, getCurrentPrice());
    }
  };
  
  // Debug logging for chat button visibility (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('ProductCard Debug:', {
      productName: product.name,
      currentUserId,
      sellerId: product.sellerId,
      isOwnProduct,
      chatButtonVisible: !isOwnProduct,
      // Add price debugging
      productPrice: product.price,
      priceType: typeof product.price,
      productId: product.id
    });
  }
  
  // Get dynamic seller information
  const dynamicSellerInfo = getDynamicSellerInfo(product.sellerId, currentUserId, product.lastUpdated);
  
  // Use dynamic seller info if available, otherwise fall back to product's cached data
  const displaySellerName = dynamicSellerInfo?.name || product.sellerName;
  const displayLocation = dynamicSellerInfo?.location || product.location;
  const displayLastUpdated = dynamicSellerInfo?.lastUpdated || getRelativeTime(product.lastUpdated);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="relative mb-3">
          {/* Main Product Image */}
          <ImageWithFallback
            src={product.images?.[0] || product.image}
            alt={product.name}
            className="w-full aspect-[4/3] object-cover rounded-lg cursor-pointer"
            onClick={() => onViewDetails(product.id)}
          />
          
          {/* Compact Image Thumbnails for Multiple Photos - Shopee Style */}
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-2 left-2 flex gap-1">
              {product.images.slice(0, 3).map((image, index) => (
                <div
                  key={index}
                  className="relative"
                >
                  <ImageWithFallback
                    src={image}
                    alt={`${product.name} - ${index + 1}`}
                    className="w-6 h-6 object-cover rounded border border-white/70 cursor-pointer hover:border-white transition-all shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(product.id);
                    }}
                  />
                  {/* Show count overlay on last thumbnail if more than 3 images */}
                  {index === 2 && product.images && product.images.length > 3 && (
                    <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">+{product.images.length - 3}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Account type badge in top-right corner */}
          <div className="absolute top-2 right-2">
            <AccountTypeBadge 
              userType={product.sellerType}
              accountType={sellerVerificationStatus?.accountType || 'individual'}
              size="sm"
            />
          </div>
          
          {/* Admin delete button */}
          {adminMode && onDelete && (
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 left-2 h-8 w-8 p-0 z-10"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete "${product.name}"?`)) {
                  onDelete(product.id);
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          
          {/* Save/Heart button for buyers (not on own products) */}
          {!isOwnProduct && onSaveProduct && currentUserId && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 left-2 h-8 w-8 p-0 z-10 bg-white/90 hover:bg-white shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleSaveToggle();
              }}
            >
              <Heart 
                className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'}`}
              />
            </Button>
          )}
        </div>
        
        <h3 className="font-medium mb-2">{product.name}</h3>
        
        <div className="flex items-center gap-2 mb-2">
          {(() => {
            // Simple pricing display - no variations
            if (product.price && product.price > 0) {
              return (
                <>
                  <span className="text-xl font-semibold">{product.price.toLocaleString()} MMK</span>
                  <span className="text-sm text-muted-foreground">per {product.unit}</span>
                </>
              );
            } else {
              return (
                <>
                  <span className="text-xl font-semibold">Contact</span>
                  <span className="text-sm text-muted-foreground">for price</span>
                </>
              );
            }
          })()}
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <MapPin className="w-4 h-4" />
          <span>{displayLocation}</span>
        </div>
        
        <div className="text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1 mb-1">
            {/* Store icon for all users - represents seller/storefront */}
            <Store className="w-3 h-3" />
            <button 
              className="text-primary hover:underline"
              onClick={() => onViewStorefront(product.sellerId)}
            >
              {displaySellerName}
            </button>
            {/* Show verification status beside seller name - Public display (only shows if fully verified) */}
            <PublicVerificationStatus 
              verificationLevel={sellerVerificationStatus ? 
                (() => {
                  if (sellerVerificationStatus.level === 2) return 'business-verified';
                  if (sellerVerificationStatus.level === 1) return 'id-verified';
                  if (sellerVerificationStatus.trustLevel === 'under-review') return 'under-review';
                  return 'unverified';
                })() : 'unverified'
              }
              size="xs"
            />
          </div>
          <p>Updated: {displayLastUpdated}</p>
          
          {/* Stock info display */}
          {product.availableQuantity && (
            <div className="flex items-center gap-1 mt-2 text-primary">
              <Package className="w-3 h-3" />
              <span className="text-xs font-medium">
                {product.availableQuantity}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button 
          size="sm" 
          className={`h-9 ${isOwnProduct ? "w-full" : "flex-1"}`}
          onClick={() => onViewDetails(product.id)}
        >
          View Details
        </Button>
        {!isOwnProduct && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-9"
              onClick={() => onChat(product.id)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </Button>
            {currentUserType === 'buyer' && onMakeOffer && (
              <Button 
                size="sm" 
                className="flex-1 h-9 bg-green-600 hover:bg-green-700"
                onClick={() => onMakeOffer(product)}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Make Offer
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}