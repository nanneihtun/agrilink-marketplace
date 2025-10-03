import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Package, 
  DollarSign, 
  Truck, 
  Calendar, 
  MapPin,
  AlertCircle 
} from "lucide-react";
import { toast } from "sonner";
import type { Product } from "../data/products";
import type { Offer } from "../services/offers";

interface CreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  onCreateOffer: (offer: Omit<Offer, "id" | "createdAt" | "acceptedAt" | "completedAt">) => void;
}

export function CreateOfferModal({
  isOpen,
  onClose,
  product,
  buyerId,
  buyerName,
  sellerId,
  sellerName,
  onCreateOffer
}: CreateOfferModalProps) {
  // Debug logging to see what product data we're getting
  console.log('🔍 CreateOfferModal product data:', {
    name: product.name,
    price: product.price,
    priceType: typeof product.price,
    quantity: product.quantity,
    unit: product.unit,
    category: product.category,
    hasPrice: 'price' in product,
    priceIsNumber: typeof product.price === 'number',
    priceIsValid: !isNaN(product.price) && product.price > 0,
    fullProduct: product
  });

  const [price, setPrice] = useState(product.price || 0);
  const [quantity, setQuantity] = useState(1);
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [deliveryTerms, setDeliveryTerms] = useState("");
  const [validityDays, setValidityDays] = useState("3");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) return '0 MMK';
    return new Intl.NumberFormat('en-US').format(price) + ' MMK';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    if (quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }
    if (!deliveryLocation.trim()) {
      newErrors.deliveryLocation = "Delivery location is required";
    }
    if (!deliveryTerms.trim()) {
      newErrors.deliveryTerms = "Delivery terms are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    console.log('🎯 CreateOfferModal - Creating offer with user details:', {
      buyerId,
      buyerName,
      sellerId,
      sellerName,
      productId: product.id,
      productName: product.name
    });

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + parseInt(validityDays));

    const offer: Omit<Offer, "id" | "createdAt" | "acceptedAt" | "completedAt"> = {
      conversationId: '', // Will be set when conversation is created
      productId: product.id,
      productName: product.name,
      sellerId,
      sellerName,
      buyerId,
      buyerName,
      price,
      quantity,
      unit: product.unit || "units",
      description: product.description || "",
      deliveryTerms: `${deliveryTerms}${deliveryLocation ? ` | Location: ${deliveryLocation}` : ""}`,
      deliveryLocation: deliveryLocation || "",
      validUntil: validUntil.toISOString(),
      status: "pending",
      notes: notes.trim() || ""
    };

    console.log('✅ CreateOfferModal - Final offer object:', offer);

    onCreateOffer(offer);
    toast.success("Formal offer sent successfully!");
    onClose();
  };

  const handleClose = () => {
    setPrice(product.price || 0);
    setQuantity(1);
    setDeliveryLocation("");
    setDeliveryTerms("");
    setValidityDays("3");
    setNotes("");
    setErrors({});
    onClose();
  };

  const totalValue = price * quantity;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Create Formal Offer
          </DialogTitle>
          <DialogDescription>
            Create a formal offer for this product. Once submitted, the seller can accept, decline, or make a counter-offer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{product.name}</h3>
                <Badge variant="outline">{product.category}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Listed Price</p>
                  <p className="font-medium">{formatPrice(product.price || 0)} per {product.unit || 'unit'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Available</p>
                  <p className="font-medium">{product.quantity || '0 units'}</p>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">Seller</p>
                  <p className="font-medium">{sellerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Buyer</p>
                  <p className="font-medium">{buyerName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-medium">
              <DollarSign className="w-4 h-4" />
              Offer Details
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price per {product.unit}</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.price}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity ({product.unit || 'units'})</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="Enter quantity"
                  className={errors.quantity ? "border-red-500" : ""}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.quantity}
                  </p>
                )}
              </div>
            </div>

            {/* Total Calculation */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Offer Value:</span>
                <span className="text-xl font-semibold text-primary">
                  {formatPrice(totalValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Terms */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-medium">
              <Truck className="w-4 h-4" />
              Delivery & Terms
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryLocation">Delivery Location</Label>
                <Input
                  id="deliveryLocation"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="Where should the product be delivered?"
                  className={errors.deliveryLocation ? "border-red-500" : ""}
                />
                {errors.deliveryLocation && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.deliveryLocation}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryTerms">Delivery Terms & Conditions</Label>
                <Textarea
                  id="deliveryTerms"
                  value={deliveryTerms}
                  onChange={(e) => setDeliveryTerms(e.target.value)}
                  placeholder="Delivery method, timing, payment terms, quality requirements, etc."
                  className={`min-h-[100px] ${errors.deliveryTerms ? "border-red-500" : ""}`}
                />
                {errors.deliveryTerms && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.deliveryTerms}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Offer Validity */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-medium">
              <Calendar className="w-4 h-4" />
              Offer Validity
            </h3>

            <div className="space-y-2">
              <Label htmlFor="validity">Valid for</Label>
              <Select value={validityDays} onValueChange={setValidityDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">1 week</SelectItem>
                  <SelectItem value="14">2 weeks</SelectItem>
                  <SelectItem value="30">1 month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional terms, requirements, or information..."
              className="min-h-[80px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Send Formal Offer
            </Button>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> A formal offer creates a structured deal with clear terms. 
              Once accepted, both parties can track the deal progress and leave reviews upon completion.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}