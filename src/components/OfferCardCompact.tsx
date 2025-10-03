import React from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Package, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck,
  Handshake,
  DollarSign,
  Eye
} from "lucide-react";
import { type Offer } from "../services/offers";

interface OfferCardCompactProps {
  offer: Offer;
  currentUserId: string;
  onViewDetails: (offer: Offer) => void;
  onQuickAction?: (offerId: string, action: string) => void;
}

export function OfferCardCompact({ 
  offer, 
  currentUserId, 
  onViewDetails,
  onQuickAction
}: OfferCardCompactProps) {
  const isSeller = currentUserId && offer.sellerId && currentUserId === offer.sellerId;
  const isBuyer = currentUserId && offer.buyerId && currentUserId === offer.buyerId;
  const isExpired = offer.validUntil ? new Date(offer.validUntil) < new Date() : false;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price) + ' MMK';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "accepted": return "bg-green-100 text-green-800 border-green-200";
      case "in_progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped": return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "completed": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      case "disputed": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-3 h-3" />;
      case "accepted": return <CheckCircle className="w-3 h-3" />;
      case "in_progress": return <Package className="w-3 h-3" />;
      case "shipped": return <Truck className="w-3 h-3" />;
      case "delivered": return <CheckCircle className="w-3 h-3" />;
      case "completed": return <Handshake className="w-3 h-3" />;
      case "cancelled": return <XCircle className="w-3 h-3" />;
      case "disputed": return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case "accepted": return 20;
      case "in_progress": return 40;
      case "shipped": return 70;
      case "delivered": return 90;
      case "completed": return 100;
      default: return 0;
    }
  };

  // Simplified - only show "View Details" button
  const getActionButton = () => {
    return (
      <Button 
        size="sm" 
        variant="outline" 
        className="h-7 px-3 text-xs"
        onClick={(e) => {
          e.stopPropagation(); // Prevent card click
          onViewDetails(offer);
        }}
      >
        <Eye className="w-3 h-3 mr-1" />
        View Details
      </Button>
    );
  };

  return (
    <Card className="mb-2 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails(offer)}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`${getStatusColor(offer.status)} flex items-center gap-1 text-xs`}>
                {getStatusIcon(offer.status)}
                {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
              </Badge>
              {isExpired && offer.status === "pending" && (
                <Badge variant="outline" className="text-xs text-red-600">
                  Expired
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                <span className="font-medium">{formatPrice(offer.price)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                <span>{offer.quantity} {offer.unit}</span>
              </div>
              {offer.deliveryLocation && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate max-w-20">{offer.deliveryLocation}</span>
                </div>
              )}
            </div>
            
            {/* Transaction Progress Bar */}
            {["accepted", "in_progress", "shipped", "delivered", "completed"].includes(offer.status) && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{getProgressPercentage(offer.status)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${getProgressPercentage(offer.status)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            {getActionButton()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

