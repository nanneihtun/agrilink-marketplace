import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Heart,
  MessageCircle,
  TrendingDown,
  Bell,
  Eye
} from "lucide-react";
import { Product } from "../data/products";

interface BuyerUser {
  id: string;
  name: string;
  email: string;
  userType: "buyer";
  location: string;
  region: string;
  phone?: string;
  joinedDate?: string;
  verified?: boolean;
  preferences?: {
    categories: string[];
    priceRange: string;
    deliveryRadius: number;
  };
}

interface BuyerDashboardProps {
  user: BuyerUser;
  allProducts: Product[];
  savedProducts: SavedProduct[];
  onGoToMarketplace: () => void;
  onViewProduct: (productId: string) => void;
  onStartChat: (productId: string, sellerId: string) => void;
  onViewMessages: () => void;
}

interface SavedProduct {
  productId: string;
  savedDate: string;
  priceWhenSaved: number;
  alerts: {
    priceAlert?: boolean;
    stockAlert?: boolean;
  };
}



export function BuyerDashboard({
  user,
  allProducts,
  savedProducts,
  onGoToMarketplace,
  onViewProduct,
  onStartChat,
  onViewMessages
}: BuyerDashboardProps) {





  // Get saved products with current prices for price alerts
  const savedProductsWithAlerts = useMemo(() => {
    return savedProducts.map(saved => {
      const product = allProducts.find(p => p.id === saved.productId);
      const priceChanged = product && product.price !== saved.priceWhenSaved;
      const priceIncrease = product && product.price > saved.priceWhenSaved;
      const priceDecrease = product && product.price < saved.priceWhenSaved;
      
      return {
        ...saved,
        product,
        priceChanged,
        priceIncrease,
        priceDecrease,
        currentPrice: product?.price || saved.priceWhenSaved
      };
    });
  }, [allProducts, savedProducts]);

  // Simple dashboard stats focused on saved products
  const dashboardStats = useMemo(() => {
    const savedProductsCount = savedProducts.length;
    const priceAlertsActive = savedProducts.filter(s => s.alerts.priceAlert).length;
    const priceDropsDetected = savedProductsWithAlerts.filter(s => s.priceDecrease && s.alerts.priceAlert).length;
    
    return {
      savedProductsCount,
      priceAlertsActive,
      priceDropsDetected
    };
  }, [savedProducts, savedProductsWithAlerts]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price) + ' MMK';
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl">Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground">Your AgriLink buying dashboard</p>
      </div>

      {/* Simple Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saved Products</p>
                <p className="text-xl">{dashboardStats.savedProductsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price Alerts</p>
                <p className="text-xl text-orange-600">{dashboardStats.priceAlertsActive}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price Drops</p>
                <p className="text-xl text-green-600">{dashboardStats.priceDropsDetected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saved Products - Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Your Saved Products ({savedProductsWithAlerts.length})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track prices and get alerts on products you're interested in
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {savedProductsWithAlerts.map((saved) => (
              <div key={saved.productId} className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{saved.product?.name || "Product Not Found"}</h3>
                    {saved.priceDecrease && saved.alerts.priceAlert && (
                      <Badge variant="secondary" className="text-green-600">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        Price Drop!
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm text-muted-foreground">
                    <span>Saved at: {formatPrice(saved.priceWhenSaved)}</span>
                    <span className="hidden md:inline">•</span>
                    <span>Current: {formatPrice(saved.currentPrice)}</span>
                    {saved.priceChanged && (
                      <>
                        <span className="hidden md:inline">•</span>
                        <span className={saved.priceDecrease ? "text-green-600" : "text-red-600"}>
                          {saved.priceDecrease ? "↓" : "↑"} {formatPrice(Math.abs(saved.currentPrice - saved.priceWhenSaved))} change
                        </span>
                      </>
                    )}
                  </div>
                  {saved.product && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Seller: {saved.product.sellerName} • {saved.product.location}
                    </p>
                  )}
                </div>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full md:w-auto"
                    onClick={() => saved.product && onViewProduct(saved.productId)}
                    disabled={!saved.product}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Product
                  </Button>
                  <Button 
                    size="sm"
                    className="w-full md:w-auto"
                    onClick={() => saved.product && onStartChat(saved.productId, saved.product.sellerId)}
                    disabled={!saved.product}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Contact Seller
                  </Button>
                </div>
              </div>
            ))}
            
            {savedProductsWithAlerts.length === 0 && (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No saved products yet</h3>
                <p className="text-muted-foreground">
                  Start saving products to track their prices and get notified when prices drop. You can save products by clicking the heart icon on any product card in the marketplace.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}