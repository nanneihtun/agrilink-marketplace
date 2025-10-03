import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  Package, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit3,
  Truck,
  Handshake,
  DollarSign 
} from "lucide-react";
import { toast } from "sonner";
import { type Offer } from "../services/offers";

interface OfferCardProps {
  offer: Offer;
  currentUserId: string;
  onAccept?: (offerId: string) => void;
  onDecline?: (offerId: string) => void;
  onUpdateStatus?: (offerId: string, status: Offer['status'], updates?: any) => void;
  onMarkCompleted?: (offerId: string) => void;
  onModify?: (offerId: string, updates: Partial<Pick<Offer, 'price' | 'quantity' | 'deliveryTerms' | 'notes'>>) => void;
}

export function OfferCard({ 
  offer, 
  currentUserId, 
  onAccept, 
  onDecline, 
  onUpdateStatus,
  onMarkCompleted,
  onModify
}: OfferCardProps) {
  const [showTrackingForm, setShowTrackingForm] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(offer.trackingNumber || "");
  const [deliveryAddress, setDeliveryAddress] = useState(offer.deliveryAddress || "");
  
  // State for modifying offers
  const [isModifying, setIsModifying] = useState(false);
  const [modifiedPrice, setModifiedPrice] = useState(offer.price);
  const [modifiedQuantity, setModifiedQuantity] = useState(offer.quantity);
  const [modifiedDeliveryTerms, setModifiedDeliveryTerms] = useState(offer.deliveryTerms || "");
  const [modifiedNotes, setModifiedNotes] = useState(offer.notes || "");

  // Check if offer is expired
  const isExpired = offer.validUntil ? new Date(offer.validUntil) < new Date() : false;
  
  // Ensure proper user matching with fallback checks
  const isSeller = currentUserId && offer.sellerId && currentUserId === offer.sellerId;
  const isBuyer = currentUserId && offer.buyerId && currentUserId === offer.buyerId;
  
  // Status-based permissions
  const canAccept = isSeller && offer.status === "pending" && !isExpired;
  const canDecline = isSeller && offer.status === "pending" && !isExpired;
  const canMarkInProgress = isSeller && offer.status === "accepted";
  const canMarkShipped = isSeller && offer.status === "in_progress";
  const canMarkDelivered = isBuyer && offer.status === "shipped";
  const canMarkCompleted = (isSeller || isBuyer) && offer.status === "delivered";
  const canCancel = (isSeller || isBuyer) && ["pending", "accepted", "in_progress"].includes(offer.status);
  const canModify = isBuyer && offer.status === "pending" && !isExpired;
  const canComplete = canMarkCompleted;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price) + ' MMK';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      case "pending": return <Clock className="w-4 h-4" />;
      case "accepted": return <CheckCircle className="w-4 h-4" />;
      case "in_progress": return <Package className="w-4 h-4" />;
      case "shipped": return <Truck className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      case "completed": return <Handshake className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      case "disputed": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // isExpired already declared above

  const handleAccept = () => {
    if (onAccept) {
      onAccept(offer.id);
      toast.success("Offer accepted! Deal is now active.");
    }
  };

  const handleDecline = () => {
    if (onDecline) {
      onDecline(offer.id);
      toast.success("Offer declined");
    }
  };

  const handleModify = () => {
    if (onModify && (modifiedPrice !== offer.price || modifiedQuantity !== offer.quantity || modifiedDeliveryTerms !== offer.deliveryTerms || modifiedNotes !== offer.notes)) {
      onModify(offer.id, {
        price: modifiedPrice,
        quantity: modifiedQuantity,
        deliveryTerms: modifiedDeliveryTerms,
        notes: modifiedNotes
      });
      setIsModifying(false);
      toast.success("Offer modified and sent");
    } else {
      setIsModifying(false);
    }
  };

  const handleMarkCompleted = () => {
    if (onMarkCompleted) {
      onMarkCompleted(offer.id);
      toast.success("Deal marked as completed! You can now leave a review.");
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-primary/5 w-full mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Formal Offer</CardTitle>
              <p className="text-sm text-muted-foreground">
                {isSeller ? `To: ${offer.buyerName}` : `From: ${offer.sellerName}`}
              </p>
              {/* Debug info in development */}
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-gray-500">
                  User: {currentUserId} | Buyer: {offer.buyerId} | Seller: {offer.sellerId}
                </p>
              )}
            </div>
          </div>
          <Badge className={`${getStatusColor(isExpired && offer.status === "pending" ? "expired" : offer.status)} flex items-center gap-1`}>
            {getStatusIcon(isExpired && offer.status === "pending" ? "expired" : offer.status)}
            {isExpired && offer.status === "pending" ? "Expired" : offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Product & Pricing */}
        <div className="bg-white rounded-lg p-4 space-y-3 border">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{offer.productName}</h4>
            <div className="flex items-center text-primary">
              <DollarSign className="w-4 h-4 mr-1" />
              <span className="text-lg font-semibold">
                {isModifying ? (
                  <Input
                    type="number"
                    value={modifiedPrice}
                    onChange={(e) => setModifiedPrice(Number(e.target.value))}
                    className="w-24 h-8 text-sm"
                  />
                ) : (
                  formatPrice(offer.price)
                )}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Quantity</p>
              <p className="font-medium">
                {isModifying ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={modifiedQuantity}
                      onChange={(e) => setModifiedQuantity(Number(e.target.value))}
                      className="w-16 h-8 text-sm"
                    />
                    <span>{offer.unit}</span>
                  </div>
                ) : (
                  `${offer.quantity} ${offer.unit}`
                )}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Value</p>
              <p className="font-medium text-primary">
                {formatPrice((isModifying ? modifiedPrice : offer.price) * (isModifying ? modifiedQuantity : offer.quantity))}
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Terms */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Delivery Terms
          </Label>
          {isModifying ? (
            <Textarea
              value={modifiedDeliveryTerms}
              onChange={(e) => setModifiedDeliveryTerms(e.target.value)}
              className="min-h-[60px] text-sm"
              placeholder="Delivery location, timing, and terms..."
            />
          ) : (
            <p className="text-sm bg-muted/50 p-3 rounded-md">
              {offer.deliveryTerms}
            </p>
          )}
        </div>

        {/* Additional Notes */}
        {(offer.notes || isModifying) && (
          <div className="space-y-2">
            <Label>Additional Notes</Label>
            {isModifying ? (
              <Textarea
                value={modifiedNotes}
                onChange={(e) => setModifiedNotes(e.target.value)}
                className="min-h-[60px] text-sm"
                placeholder="Any additional terms or notes..."
              />
            ) : (
              <p className="text-sm bg-muted/50 p-3 rounded-md">
                {offer.notes || "No additional notes"}
              </p>
            )}
          </div>
        )}

        {/* Timeline */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
          <span>Created: {formatDate(offer.createdAt)}</span>
          <span>Valid until: {formatDate(offer.validUntil)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {canAccept && !isExpired && (
            <Button onClick={handleAccept} className="flex-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept Offer
            </Button>
          )}
          
          {canDecline && !isExpired && (
            <Button variant="outline" onClick={handleDecline} className="flex-1">
              <XCircle className="w-4 h-4 mr-2" />
              Decline
            </Button>
          )}

          {canModify && offer.status === "pending" && !isExpired && (
            <>
              {isModifying ? (
                <div className="flex gap-2 flex-1">
                  <Button onClick={handleModify} className="flex-1">
                    Send Modified
                  </Button>
                  <Button variant="outline" onClick={() => setIsModifying(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => setIsModifying(true)} className="flex-1">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Modify Offer
                </Button>
              )}
            </>
          )}

          {canComplete && (
            <Button onClick={handleMarkCompleted} className="flex-1 bg-green-600 hover:bg-green-700">
              <Handshake className="w-4 h-4 mr-2" />
              Mark as Completed
            </Button>
          )}
        </div>

        {/* Deal Status Messages */}
        {offer.status === "accepted" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              🎉 <strong>Deal Accepted!</strong> Please coordinate payment and delivery. 
              Mark as completed once the transaction is finished to leave reviews.
            </p>
          </div>
        )}

        {offer.status === "completed" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              ✅ <strong>Deal Completed!</strong> This transaction has been successfully completed. 
              Don't forget to leave a review for your trading partner.
            </p>
          </div>
        )}

        {isExpired && offer.status === "pending" && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              ⏰ This offer has expired and is no longer valid.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}