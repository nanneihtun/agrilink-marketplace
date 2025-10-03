import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
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
  User,
  Phone,
  Mail,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { type Offer } from "../services/offers";

interface OfferDetailsModalProps {
  offer: Offer | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onUpdateStatus?: (offerId: string, status: Offer['status'], updates?: any) => void;
}

export function OfferDetailsModal({ 
  offer, 
  isOpen, 
  onClose, 
  currentUserId,
  onUpdateStatus
}: OfferDetailsModalProps) {
  const [showTrackingForm, setShowTrackingForm] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(offer?.trackingNumber || "");
  const [deliveryAddress, setDeliveryAddress] = useState(offer?.deliveryAddress || "");
  const [isLoading, setIsLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  if (!offer) return null;

  const isSeller = currentUserId && offer.sellerId && currentUserId === offer.sellerId;
  const isBuyer = currentUserId && offer.buyerId && currentUserId === offer.buyerId;
  const isExpired = offer.validUntil ? new Date(offer.validUntil) < new Date() : false;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price) + ' MMK';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  const handleStatusUpdate = async (status: Offer['status'], updates?: any, actionName?: string) => {
    if (!onUpdateStatus) return;
    
    const action = actionName || status.replace(/_/g, ' ');
    setActionInProgress(action);
    setIsLoading(true);
    
    try {
      await onUpdateStatus(offer.id, status, updates);
      toast.success(`✅ ${action} successful!`);
      
      // Show success state briefly before closing
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      toast.error(`❌ Failed to ${action.toLowerCase()}. Please try again.`);
    } finally {
      setActionInProgress(null);
      setIsLoading(false);
    }
  };

  const handleTrackingSubmit = () => {
    if (trackingNumber.trim()) {
      handleStatusUpdate('shipped', { 
        trackingNumber: trackingNumber.trim(),
        deliveryAddress: deliveryAddress.trim() || offer.deliveryLocation
      });
      setShowTrackingForm(false);
    } else {
      toast.error("Please enter a tracking number");
    }
  };

  const getActionButtons = () => {
    const buttons = [];

    if (isSeller) {
      switch (offer.status) {
        case "pending":
          if (!isExpired) {
            buttons.push(
              <Button 
                key="accept" 
                onClick={() => handleStatusUpdate('accepted', undefined, 'Accept Offer')} 
                className="bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {actionInProgress === 'Accept Offer' ? 'Accepting...' : 'Accept Offer'}
              </Button>,
              <Button 
                key="decline" 
                variant="outline" 
                onClick={() => handleStatusUpdate('cancelled', undefined, 'Decline Offer')}
                disabled={isLoading}
              >
                <XCircle className="w-4 h-4 mr-2" />
                {actionInProgress === 'Decline Offer' ? 'Declining...' : 'Decline Offer'}
              </Button>
            );
          }
          break;
        case "accepted":
          buttons.push(
            <Button 
              key="in_progress" 
              onClick={() => handleStatusUpdate('in_progress', undefined, 'Start Preparation')}
              disabled={isLoading}
            >
              <Package className="w-4 h-4 mr-2" />
              {actionInProgress === 'Start Preparation' ? 'Starting...' : 'Start Preparation'}
            </Button>
          );
          break;
        case "in_progress":
          buttons.push(
            <Button 
              key="shipped" 
              onClick={() => setShowTrackingForm(true)}
              disabled={isLoading}
            >
              <Truck className="w-4 h-4 mr-2" />
              Mark as Shipped
            </Button>
          );
          break;
        case "delivered":
          buttons.push(
            <Button 
              key="completed" 
              onClick={() => handleStatusUpdate('completed', undefined, 'Complete Transaction')} 
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              <Handshake className="w-4 h-4 mr-2" />
              {actionInProgress === 'Complete Transaction' ? 'Completing...' : 'Complete Transaction'}
            </Button>
          );
          break;
      }
    }

    if (isBuyer) {
      switch (offer.status) {
        case "shipped":
          buttons.push(
            <Button 
              key="delivered" 
              onClick={() => handleStatusUpdate('delivered', undefined, 'Confirm Delivery')} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {actionInProgress === 'Confirm Delivery' ? 'Confirming...' : 'Confirm Delivery'}
            </Button>
          );
          break;
        case "delivered":
          buttons.push(
            <Button 
              key="completed" 
              onClick={() => handleStatusUpdate('completed', undefined, 'Complete Transaction')} 
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              <Handshake className="w-4 h-4 mr-2" />
              {actionInProgress === 'Complete Transaction' ? 'Completing...' : 'Complete Transaction'}
            </Button>
          );
          break;
      }
    }

    // Cancel button for early stages
    if (["pending", "accepted", "in_progress"].includes(offer.status)) {
      buttons.push(
        <Button key="cancel" variant="outline" onClick={() => handleStatusUpdate('cancelled')}>
          <XCircle className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      );
    }

    return buttons;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Offer Details
          </DialogTitle>
          <DialogDescription>
            View and manage offer details, track transaction status, and communicate with the other party.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className={`${getStatusColor(offer.status)} flex items-center gap-2`}>
                  {getStatusIcon(offer.status)}
                  {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                </Badge>
                {isExpired && offer.status === "pending" && (
                  <Badge variant="outline" className="text-red-600">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Expired
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Product</Label>
                  <p className="text-lg font-semibold">{offer.productName || 'Unknown Product'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Price</Label>
                  <p className="text-lg font-semibold text-green-600">{formatPrice(offer.price)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Quantity</Label>
                  <p className="text-lg">{offer.quantity} {offer.unit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Valid Until</Label>
                  <p className="text-lg">{formatDate(offer.validUntil)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parties Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Parties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Buyer</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{offer.buyerName || 'Unknown Buyer'}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Seller</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{offer.sellerName || 'Unknown Seller'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {offer.deliveryLocation && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Location</Label>
                      <p>{offer.deliveryLocation}</p>
                    </div>
                  </div>
                )}
                {offer.deliveryTerms && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Terms</Label>
                    <p className="mt-1">{offer.deliveryTerms}</p>
                  </div>
                )}
                {offer.trackingNumber && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Tracking Number</Label>
                    <p className="mt-1 font-mono bg-gray-100 px-2 py-1 rounded">{offer.trackingNumber}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {offer.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{offer.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Tracking Form Modal */}
          {showTrackingForm && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Add Tracking Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tracking">Tracking Number *</Label>
                  <Input
                    id="tracking"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Delivery Address</Label>
                  <Textarea
                    id="address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter delivery address"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleTrackingSubmit}>
                    <Truck className="w-4 h-4 mr-2" />
                    Mark as Shipped
                  </Button>
                  <Button variant="outline" onClick={() => setShowTrackingForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {getActionButtons()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
