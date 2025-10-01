import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  DollarSign, 
  Package, 
  MapPin, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock,
  MessageSquare,
  User
} from 'lucide-react';

interface OfferMessageProps {
  offer: {
    id: string;
    offerPrice: number;
    originalPrice: number;
    quantity: string;
    message: string;
    deliveryAddress: string;
    deliveryNotes?: string;
    paymentMethod: string;
    status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'completed' | 'cancelled';
    createdAt: string;
    buyerName: string;
    sellerName: string;
  };
  currentUserId: string;
  isSeller: boolean;
  onAccept?: (offerId: string) => void;
  onReject?: (offerId: string) => void;
  onComplete?: (offerId: string) => void;
  onCancel?: (offerId: string) => void;
}

export function OfferMessage({ 
  offer, 
  currentUserId, 
  isSeller, 
  onAccept, 
  onReject, 
  onComplete, 
  onCancel 
}: OfferMessageProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const priceDifference = offer.offerPrice - offer.originalPrice;
  const priceDifferencePercent = ((priceDifference / offer.originalPrice) * 100).toFixed(1);

  return (
    <Card className={`w-full max-w-md ${isSeller ? 'ml-auto' : 'mr-auto'} border-2`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="font-semibold">Offer</span>
          </div>
          <Badge className={getStatusColor(offer.status)}>
            {getStatusIcon(offer.status)}
            <span className="ml-1 capitalize">{offer.status}</span>
          </Badge>
        </div>

        {/* Offer Details */}
        <div className="space-y-3">
          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Offer Price:</span>
            <div className="text-right">
              <div className="font-bold text-lg">{offer.offerPrice.toLocaleString()} MMK</div>
              {priceDifference !== 0 && (
                <div className="text-xs text-muted-foreground">
                  {priceDifference < 0 ? '↓' : '↑'} {Math.abs(priceDifference).toLocaleString()} MMK
                  ({priceDifferencePercent}% {priceDifference < 0 ? 'below' : 'above'} original)
                </div>
              )}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Package className="w-3 h-3" />
              Quantity:
            </span>
            <span className="font-medium">{offer.quantity}</span>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-sm font-semibold">Total Amount:</span>
            <span className="font-bold text-primary text-lg">
              {(offer.offerPrice * parseFloat(offer.quantity) || 0).toLocaleString()} MMK
            </span>
          </div>

          {/* Message */}
          {offer.message && (
            <div className="border-t pt-2">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground">Message:</span>
                  <p className="text-sm mt-1">{offer.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Address */}
          <div className="border-t pt-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="text-sm text-muted-foreground">Delivery Address:</span>
                <p className="text-sm mt-1">{offer.deliveryAddress}</p>
              </div>
            </div>
          </div>

          {/* Delivery Notes */}
          {offer.deliveryNotes && (
            <div className="text-sm">
              <span className="text-muted-foreground">Delivery Notes: </span>
              <span>{offer.deliveryNotes}</span>
            </div>
          )}

          {/* Payment Method */}
          <div className="flex items-center gap-2 border-t pt-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Payment: </span>
            <span className="text-sm font-medium">
              {offer.paymentMethod === 'cash' ? 'Cash on Delivery' :
               offer.paymentMethod === 'bank_transfer' ? 'Bank Transfer' :
               offer.paymentMethod === 'mobile_payment' ? 'Mobile Payment' :
               offer.paymentMethod === 'advance' ? '50% Advance, 50% on Delivery' :
               offer.paymentMethod}
            </span>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-2 border-t pt-2 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span>From: {offer.buyerName}</span>
            <span>•</span>
            <span>To: {offer.sellerName}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {offer.status === 'pending' && (
          <div className="flex gap-2 mt-4">
            {isSeller ? (
              <>
                <Button
                  size="sm"
                  onClick={() => onAccept?.(offer.id)}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReject?.(offer.id)}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCancel?.(offer.id)}
                className="w-full"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Cancel Offer
              </Button>
            )}
          </div>
        )}

        {offer.status === 'accepted' && (
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              onClick={() => onComplete?.(offer.id)}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Mark as Completed
            </Button>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground mt-2 text-center">
          {new Date(offer.createdAt).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
