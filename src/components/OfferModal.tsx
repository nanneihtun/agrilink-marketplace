import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { X, DollarSign, Package, MessageSquare, Clock } from 'lucide-react';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offerData: OfferData) => void;
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    sellerName: string;
    location: string;
  };
  currentUser: {
    id: string;
    name: string;
  };
}

interface OfferData {
  offerPrice: number;
  quantity: string;
  message: string;
  deliveryAddress: string;
  deliveryNotes: string;
  paymentMethod: string;
}

export function OfferModal({ isOpen, onClose, onSubmit, product, currentUser }: OfferModalProps) {
  const [formData, setFormData] = useState<OfferData>({
    offerPrice: product.price,
    quantity: '1',
    message: '',
    deliveryAddress: '',
    deliveryNotes: '',
    paymentMethod: 'cash'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting offer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const priceDifference = formData.offerPrice - product.price;
  const priceDifferencePercent = ((priceDifference / product.price) * 100).toFixed(1);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Make an Offer
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Product Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <span>Seller: {product.sellerName}</span>
              <span>•</span>
              <span>Location: {product.location}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg font-bold">Original Price: {product.price.toLocaleString()} MMK</span>
              <span className="text-sm text-muted-foreground">per {product.unit}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Offer Price */}
            <div className="space-y-2">
              <Label htmlFor="offerPrice">Your Offer Price (MMK)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="offerPrice"
                  type="number"
                  value={formData.offerPrice}
                  onChange={(e) => setFormData({ ...formData, offerPrice: Number(e.target.value) })}
                  className="pl-10"
                  min="0"
                  step="1000"
                  required
                />
              </div>
              {priceDifference !== 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant={priceDifference < 0 ? "destructive" : "default"}>
                    {priceDifference < 0 ? '↓' : '↑'} {Math.abs(priceDifference).toLocaleString()} MMK
                  </Badge>
                  <span className="text-muted-foreground">
                    ({priceDifferencePercent}% {priceDifference < 0 ? 'below' : 'above'} original)
                  </span>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <div className="relative">
                <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="pl-10"
                  placeholder="e.g., 5 bags, 10 kg"
                  required
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message to Seller</Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="pl-10 min-h-[80px]"
                  placeholder="Tell the seller about your offer, delivery preferences, or any questions..."
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Delivery Address</Label>
              <Textarea
                id="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                placeholder="Enter your delivery address..."
                required
              />
            </div>

            {/* Delivery Notes */}
            <div className="space-y-2">
              <Label htmlFor="deliveryNotes">Delivery Notes (Optional)</Label>
              <Textarea
                id="deliveryNotes"
                value={formData.deliveryNotes}
                onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                placeholder="Any special delivery instructions..."
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Preferred Payment Method</Label>
              <select
                id="paymentMethod"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="cash">Cash on Delivery</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_payment">Mobile Payment</option>
                <option value="advance">50% Advance, 50% on Delivery</option>
              </select>
            </div>

            {/* Total Calculation */}
            <div className="bg-primary/10 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Offer Amount:</span>
                <span className="text-xl font-bold text-primary">
                  {(formData.offerPrice * parseFloat(formData.quantity) || 0).toLocaleString()} MMK
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {formData.quantity} × {formData.offerPrice.toLocaleString()} MMK
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Sending Offer...
                  </>
                ) : (
                  'Send Offer'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
