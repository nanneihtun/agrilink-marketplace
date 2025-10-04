import React, { useState, useCallback, useRef, useMemo } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { 
  ChevronLeft,
  Package, 
  DollarSign, 
  Truck, 
  MapPin,
  AlertCircle,
  CheckCircle,
  Camera,
  Upload,
  FileText,
  X,
  CreditCard,
  Shield,
  Plus,
  Info,
  Lightbulb
} from "lucide-react";

import type { Product } from "../data/products";
import { myanmarRegions } from "../utils/regions";

interface SimplifiedProductFormProps {
  currentUser: any;
  onBack: () => void;
  onSave: (product: Product) => Promise<void>;
  editingProduct?: Product | null;
}

export function SimplifiedProductForm({ currentUser, onBack, onSave, editingProduct }: SimplifiedProductFormProps) {
  const [newCustomDelivery, setNewCustomDelivery] = useState('');
  const [newCustomPayment, setNewCustomPayment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Store original form data to track changes (for edit mode)
  const originalFormDataRef = useRef<Product | null>(null);

  // Initialize form data with defaults
  const [formData, setFormData] = useState<Product>(() => {
    if (editingProduct) {
      console.log('🔄 Initializing form with editing product:', {
        id: editingProduct.id,
        name: editingProduct.name,
        price: editingProduct.price,
        priceType: typeof editingProduct.price,
        description: editingProduct.description || 'UNDEFINED',
        category: editingProduct.category || 'UNDEFINED',
        hasImage: !!editingProduct.image || !!(editingProduct.images?.length)
      });
      
      const initialData = {
        id: editingProduct.id,
        sellerId: editingProduct.sellerId,
        name: editingProduct.name || '',
        price: editingProduct.price || 0,
        unit: editingProduct.unit || '',
        location: editingProduct.location || currentUser?.location || '',
        region: editingProduct.region || currentUser?.region || 'yangon', // Default to Yangon if no region set
        sellerType: editingProduct.sellerType || currentUser?.userType || 'farmer',
        sellerName: editingProduct.sellerName || currentUser?.name || '',
        image: editingProduct.image || '',
        images: editingProduct.images || (editingProduct.image ? [editingProduct.image] : []),
        quantity: editingProduct.quantity || '',
        minimumOrder: editingProduct.minimumOrder || '',
        availableQuantity: editingProduct.availableQuantity || '',
        deliveryOptions: editingProduct.deliveryOptions || [],
        paymentTerms: editingProduct.paymentTerms || [],
        lastUpdated: editingProduct.lastUpdated || new Date().toISOString(),
        category: editingProduct.category || '',
        description: editingProduct.description || '',
        additionalNotes: editingProduct.additionalNotes || '',
        priceChange: editingProduct.priceChange,
        isEditing: true
      };
      
      // Store original data for change tracking
      originalFormDataRef.current = { ...initialData };
      
      return initialData;
    }
    
    return {
      id: '',
      sellerId: currentUser?.id || '',
      name: '',
      price: 0,
      unit: '',
      location: currentUser?.location || '',
      region: currentUser?.region || 'yangon', // Default to Yangon if no region set
      sellerType: currentUser?.userType || 'farmer',
      sellerName: currentUser?.name || '',
      image: '',
      images: [],
      quantity: '',
      minimumOrder: '',
      availableQuantity: '',
      deliveryOptions: [],
      paymentTerms: [],
      lastUpdated: new Date().toISOString(),
      category: '',
      description: '',
      additionalNotes: '',
      priceChange: undefined
    };
  });

  // Get unique available delivery options with custom additions
  const availableDeliveryOptions = useMemo(() => {
    const baseOptions = [
      'Pickup',
      'Local Delivery (Within 10km)',
      'Regional Delivery', 
      'Nationwide Shipping',
      'Express Delivery',
      'Cold Chain Transport'
    ];
    
    // Get custom delivery options from localStorage
    const storedCustomDelivery = localStorage.getItem('agriconnect-custom-delivery-options');
    const customOptions = storedCustomDelivery ? JSON.parse(storedCustomDelivery) : [];
    
    return [...baseOptions, ...customOptions];
  }, []);

  const availableCustomDeliveryOptions = useMemo(() => {
    const storedCustomDelivery = localStorage.getItem('agriconnect-custom-delivery-options');
    return storedCustomDelivery ? JSON.parse(storedCustomDelivery) : [];
  }, []);

  // Check if form data has been modified (for edit mode)
  const hasFormChanges = useMemo(() => {
    if (!editingProduct || !originalFormDataRef.current) {
      return false; // For new products, always allow submission
    }

    const original = originalFormDataRef.current;
    
    // Compare key fields that matter for product updates
    const fieldsToCompare = [
      'name', 'price', 'unit', 'location', 'region', 'category', 
      'description', 'quantity', 'minimumOrder', 'availableQuantity', 'additionalNotes'
    ];
    
    // Check if any simple fields changed
    const simpleFieldsChanged = fieldsToCompare.some(field => {
      return String(formData[field as keyof Product] || '') !== String(original[field as keyof Product] || '');
    });
    
    // Check if arrays changed (deliveryOptions, paymentTerms, images)
    const deliveryChanged = JSON.stringify(formData.deliveryOptions?.sort()) !== JSON.stringify(original.deliveryOptions?.sort());
    const paymentChanged = JSON.stringify(formData.paymentTerms?.sort()) !== JSON.stringify(original.paymentTerms?.sort());
    const imagesChanged = JSON.stringify(formData.images?.sort()) !== JSON.stringify(original.images?.sort());
    
    return simpleFieldsChanged || deliveryChanged || paymentChanged || imagesChanged;
  }, [formData, editingProduct]);

  // Get button text and state
  const getUpdateButtonConfig = () => {
    if (!editingProduct) {
      return {
        text: 'Publish Product',
        disabled: false,
        variant: 'default' as const
      };
    }

    if (hasFormChanges) {
      return {
        text: 'Save Changes',
        disabled: false,
        variant: 'default' as const
      };
    }

    return {
      text: 'Update Product',
      disabled: true,
      variant: 'secondary' as const
    };
  };

  // Save custom delivery options to localStorage
  const saveCustomDeliveryToStorage = useCallback((options: string[]) => {
    localStorage.setItem('agriconnect-custom-delivery-options', JSON.stringify(options));
  }, []);

  // Get unique available payment terms with custom additions
  const availablePaymentTerms = useMemo(() => {
    const baseOptions = [
      'Cash on Delivery',
      'Bank Transfer',
      'Mobile Payment',
      'Cash on Pickup',
      '50% Advance, 50% on Delivery',
      '30% Advance, 70% on Delivery'
    ];
    
    // Get custom payment terms from localStorage
    const storedCustomPayment = localStorage.getItem('agriconnect-custom-payment-terms');
    const customOptions = storedCustomPayment ? JSON.parse(storedCustomPayment) : [];
    
    return [...baseOptions, ...customOptions];
  }, []);

  const availableCustomPaymentTerms = useMemo(() => {
    const storedCustomPayment = localStorage.getItem('agriconnect-custom-payment-terms');
    return storedCustomPayment ? JSON.parse(storedCustomPayment) : [];
  }, []);

  // Save custom payment terms to localStorage
  const saveCustomPaymentTermsToStorage = useCallback((options: string[]) => {
    localStorage.setItem('agriconnect-custom-payment-terms', JSON.stringify(options));
  }, []);

  // Validation function
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'Product name is required';
    }
    
    if (!formData.category?.trim()) {
      errors.category = 'Category is required';
    }
    
    if (!formData.unit?.trim()) {
      errors.unit = 'Quantity & unit is required (e.g., "50 kg", "25 bags")';
    }
    
    if (!formData.price || formData.price <= 0) {
      errors.price = 'Valid price is required';
    }
    
    if (!formData.availableQuantity?.trim()) {
      errors.availableQuantity = 'Available quantity is required';
    }
    
    if (!formData.minimumOrder?.trim()) {
      errors.minimumOrder = 'Minimum order is required';
    }
    
    if (!formData.region?.trim()) {
      errors.region = 'Region is required';
    }
    
    if (!formData.location?.trim()) {
      errors.location = 'City/Location is required';
    }
    
    if (formData.deliveryOptions.length === 0) {
      errors.deliveryOptions = 'At least one delivery option is required';
    }
    
    if (formData.paymentTerms.length === 0) {
      errors.paymentTerms = 'At least one payment term is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Toggle delivery option
  const toggleDeliveryOption = useCallback((option: string) => {
    setFormData(prev => ({
      ...prev,
      deliveryOptions: prev.deliveryOptions.includes(option)
        ? prev.deliveryOptions.filter(o => o !== option)
        : [...prev.deliveryOptions, option]
    }));
  }, []);

  // Toggle payment term
  const togglePaymentTerm = useCallback((term: string) => {
    setFormData(prev => ({
      ...prev,
      paymentTerms: prev.paymentTerms.includes(term)
        ? prev.paymentTerms.filter(t => t !== term)
        : [...prev.paymentTerms, term]
    }));
  }, []);

  // Add custom delivery option
  const addCustomDeliveryOption = useCallback(() => {
    if (!newCustomDelivery.trim()) return;
    
    const newOptions = [...availableCustomDeliveryOptions, newCustomDelivery.trim()];
    saveCustomDeliveryToStorage(newOptions);
    setNewCustomDelivery('');
  }, [newCustomDelivery, availableCustomDeliveryOptions, saveCustomDeliveryToStorage]);

  // Remove custom delivery option
  const removeCustomDeliveryOption = useCallback((option: string) => {
    const newOptions = availableCustomDeliveryOptions.filter(o => o !== option);
    saveCustomDeliveryToStorage(newOptions);
    
    // Also remove from current form if selected
    setFormData(prev => ({
      ...prev,
      deliveryOptions: prev.deliveryOptions.filter(o => o !== option)
    }));
  }, [availableCustomDeliveryOptions, saveCustomDeliveryToStorage]);

  // Add custom payment option
  const addCustomPaymentOption = useCallback(() => {
    if (!newCustomPayment.trim()) return;
    
    const newOptions = [...availableCustomPaymentTerms, newCustomPayment.trim()];
    saveCustomPaymentTermsToStorage(newOptions);
    setNewCustomPayment('');
  }, [newCustomPayment, availableCustomPaymentTerms, saveCustomPaymentTermsToStorage]);

  // Remove custom payment option
  const removeCustomPaymentOption = useCallback((term: string) => {
    const newOptions = availableCustomPaymentTerms.filter(o => o !== term);
    saveCustomPaymentTermsToStorage(newOptions);
    
    // Also remove from current form if selected
    setFormData(prev => ({
      ...prev,
      paymentTerms: prev.paymentTerms.filter(t => t !== term)
    }));
  }, [availableCustomPaymentTerms, saveCustomPaymentTermsToStorage]);

  // Handle multiple image upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxImages = 10; // Reasonable limit
    const currentImageCount = formData.images?.length || 0;
    
    if (currentImageCount + files.length > maxImages) {
      setValidationErrors(prev => ({ ...prev, images: `Maximum ${maxImages} images allowed` }));
      return;
    }

    // Check each file size (limit to 3MB per image for better performance)
    const oversizedFiles = files.filter(file => file.size > 3 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setValidationErrors(prev => ({ ...prev, images: 'Each image must be smaller than 3MB' }));
      return;
    }

    // Clear any previous image errors
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.images;
      return newErrors;
    });

    // Process all selected files
    const processFiles = async () => {
      const newImages: string[] = [];
      
      for (const file of files) {
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            newImages.push(result);
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
      
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImages],
        // Update legacy image field with first image for backward compatibility
        image: prev.images?.length === 0 && newImages.length > 0 ? newImages[0] : prev.image
      }));
    };

    processFiles();
    
    // Clear the input value to allow re-uploading the same files
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [formData.images]);

  // Remove specific image by index
  const removeImage = useCallback((index: number) => {
    setFormData(prev => {
      const newImages = [...(prev.images || [])];
      newImages.splice(index, 1);
      
      return {
        ...prev,
        images: newImages,
        // Update legacy image field
        image: newImages.length > 0 ? newImages[0] : ''
      };
    });
  }, []);

  // Remove all images
  const removeAllImages = useCallback(() => {
    setFormData(prev => ({ ...prev, images: [], image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    console.log('🚀 Form submission started');
    
    // Prevent submission if editing product and no changes made
    if (editingProduct && !hasFormChanges) {
      console.log('❌ No changes detected, skipping submission');
      return;
    }
    
    console.log('Form data being validated:', {
      id: formData.id,
      name: formData.name,
      price: formData.price,
      priceType: typeof formData.price,
      category: formData.category,
      description: formData.description,
      isEditing: formData.isEditing,
      hasImages: !!(formData.images?.length || formData.image),
      imagesCount: formData.images?.length || (formData.image ? 1 : 0),
      hasChanges: hasFormChanges
    });

    if (!validateForm()) {
      console.log('❌ Validation failed:', validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('✅ Validation passed, calling onSave');
      // Update lastUpdated timestamp and preserve isEditing flag for proper update handling
      const productToSave = {
        ...formData,
        quantity: formData.availableQuantity, // Set quantity field for backward compatibility
        lastUpdated: new Date().toISOString(),
        // Keep isEditing flag if this is an edit operation to ensure proper update handling
        isEditing: formData.isEditing
      };
      await onSave(productToSave);
      console.log('✅ onSave completed successfully');
    } catch (error) {
      console.error('❌ Product save failed:', error);
      setIsSubmitting(false); // Re-enable the form if save fails
    }
  }, [formData, validateForm, validationErrors, onSave, editingProduct, hasFormChanges]);

  // Handle form submission with proper preventDefault
  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
  }, [handleSubmit]);

  return (
    <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="space-y-4 mb-8">
        {/* Back button row */}
        <Button variant="ghost" onClick={onBack} className="h-9 px-3 -ml-3">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        {/* Title section - aligned with content */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-muted-foreground">
            {editingProduct ? 'Update your product listing details' : 'Create a detailed product listing for buyers'}
          </p>
        </div>
      </div>

      {/* Info Banner for Multiple Variations */}
      {!editingProduct && (
        <Alert className="border-primary/20 bg-primary/5">
          <Lightbulb className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            <span className="font-medium text-primary">💡 Selling multiple sizes or variants?</span>
            <br />
            Create separate product listings for each size/variant (e.g., "Rice - 25kg bag", "Rice - 50kg bag"). 
            This makes it easier for buyers to find exactly what they need and helps with analytics.
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Errors */}
      {Object.keys(validationErrors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the following errors:
            <ul className="mt-2 ml-4 list-disc">
              {Object.entries(validationErrors).map(([field, error]) => (
                <li key={field} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6 md:space-y-8">
        {/* Product Information & Image - Stacked Vertically with Top/Bottom Alignment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
          {/* Product Information - Top Aligned - Takes 2/3 of width */}
          <div className="lg:col-span-2 lg:self-start">
            <Card className="h-[300px] lg:h-[320px] flex flex-col">
              <CardHeader className="flex-shrink-0 pb-4">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Package className="w-5 h-5" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-shrink-0">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input
                      id="productName"
                      placeholder="e.g., Fresh Cabbage"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`h-10 ${validationErrors.name ? 'border-destructive' : ''}`}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className={`h-10 ${validationErrors.category ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Pulses & Beans" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rice">Rice</SelectItem>
                        <SelectItem value="vegetables">Vegetables</SelectItem>
                        <SelectItem value="fruits">Fruits</SelectItem>
                        <SelectItem value="spices">Spices & Herbs</SelectItem>
                        <SelectItem value="pulses">Pulses & Beans</SelectItem>
                        <SelectItem value="grains">Grains & Cereals</SelectItem>
                        <SelectItem value="tea-coffee">Tea & Coffee</SelectItem>
                        <SelectItem value="nuts">Nuts & Seeds</SelectItem>
                        <SelectItem value="livestock">Livestock</SelectItem>
                        <SelectItem value="dairy">Dairy Products</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2 flex-grow flex flex-col">
                  <Label htmlFor="description">Product Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product, quality, farming methods, and what makes it special..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="flex-grow resize-none h-[100px] lg:h-[110px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Image Upload - Bottom Aligned - Takes 1/3 of width */}
          <div className="lg:col-span-1 lg:self-end">
            <Card className="h-[300px] lg:h-[320px] flex flex-col">
              <CardHeader className="flex-shrink-0 pb-4">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Camera className="w-5 h-5" />
                  Product Photos
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col space-y-3">
                {/* Multiple Images Display */}
                {formData.images && formData.images.length > 0 ? (
                  <div className="flex-grow flex flex-col space-y-2">
                    {/* Image Grid - Fixed height container */}
                    <div className="flex-grow">
                      <div className="grid grid-cols-2 gap-2 h-[120px] lg:h-[130px] overflow-y-auto">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="w-full h-16 md:h-18 object-cover rounded-lg border hover:opacity-90 transition-opacity"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-2 h-2" />
                            </Button>
                            {index === 0 && (
                              <Badge className="absolute bottom-1 left-1 text-xs px-1 py-0 h-4">
                                Main
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Action Buttons - Fixed at bottom */}
                    <div className="flex-shrink-0 space-y-2">
                      {/* Add More Photos Button */}
                      {formData.images.length < 10 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-9"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add More ({formData.images.length}/10)
                        </Button>
                      )}
                      
                      {/* Clear All Button */}
                      {formData.images.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={removeAllImages}
                          className="w-full text-destructive hover:text-destructive h-9"
                        >
                          Remove All Photos
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Upload Area for First Photos - Center in available space */
                  <div className="flex-grow flex items-center justify-center">
                    <div className="border-2 border-dashed border-muted rounded-lg p-3 text-center w-full">
                      <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <div className="text-xs text-muted-foreground space-y-1 mb-3">
                        <p>• Use high-quality photos</p>
                        <p>• Multiple photos help customers</p>
                        <p>• JPG, PNG up to 3MB each</p>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => fileInputRef.current?.click()}
                        className="h-9"
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Upload Photos
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {/* Image Upload Errors */}
                {validationErrors.images && (
                  <p className="text-sm text-destructive">{validationErrors.images}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pricing & Quantity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <DollarSign className="w-5 h-5" />
              Pricing & Quantity
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Package Size *</Label>
              <Input
                id="unit"
                placeholder="e.g., 50 kg, 25 bags, 1 basket"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className={`h-11 ${validationErrors.unit ? 'border-destructive' : ''}`}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price (MMK) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="0"
                value={formData.price || ''}
                onChange={(e) => {
                  const newPrice = parseFloat(e.target.value) || 0;
                  console.log('💰 Price changed:', {
                    inputValue: e.target.value,
                    parsedValue: newPrice,
                    previousPrice: formData.price
                  });
                  setFormData(prev => ({ ...prev, price: newPrice }));
                }}
                className={`h-11 ${validationErrors.price ? 'border-destructive' : ''}`}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="availableQuantity">Available Stock *</Label>
              <Input
                id="availableQuantity"
                placeholder="e.g., 100 bags available"
                value={formData.availableQuantity}
                onChange={(e) => setFormData(prev => ({ ...prev, availableQuantity: e.target.value }))}
                className={`h-11 ${validationErrors.availableQuantity ? 'border-destructive' : ''}`}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minimumOrder">Minimum Order *</Label>
              <Input
                id="minimumOrder"
                placeholder="e.g., 5 bags minimum"
                value={formData.minimumOrder}
                onChange={(e) => setFormData(prev => ({ ...prev, minimumOrder: e.target.value }))}
                className={`h-11 ${validationErrors.minimumOrder ? 'border-destructive' : ''}`}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Select 
                value={formData.region} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, region: value, location: '' }))}
              >
                <SelectTrigger className={`h-11 ${validationErrors.region ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Select your region" />
                </SelectTrigger>
                <SelectContent className="max-h-64 overflow-y-auto">
                  {Object.entries(myanmarRegions).map(([key, region]) => (
                    <SelectItem key={key} value={key}>{region.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">City/Location *</Label>
              <Select 
                value={formData.location} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                disabled={!formData.region}
              >
                <SelectTrigger className={`h-11 ${validationErrors.location ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder={formData.region ? "Select your city" : "Select region first"} />
                </SelectTrigger>
                <SelectContent className="max-h-64 overflow-y-auto">
                  {formData.region && myanmarRegions[formData.region as keyof typeof myanmarRegions]?.cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Truck className="w-5 h-5" />
              Delivery Options *
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableDeliveryOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`delivery-${option}`}
                    checked={formData.deliveryOptions.includes(option)}
                    onCheckedChange={() => toggleDeliveryOption(option)}
                  />
                  <Label 
                    htmlFor={`delivery-${option}`} 
                    className="text-sm leading-5 cursor-pointer"
                  >
                    {option}
                  </Label>
                  {availableCustomDeliveryOptions.includes(option) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomDeliveryOption(option)}
                      className="h-6 w-6 p-0 ml-2 text-destructive hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            {validationErrors.deliveryOptions && (
              <p className="text-sm text-destructive">{validationErrors.deliveryOptions}</p>
            )}
            
            {/* Add Custom Delivery Option */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom delivery option"
                value={newCustomDelivery}
                onChange={(e) => setNewCustomDelivery(e.target.value)}
                className="h-11"
                onKeyPress={(e) => e.key === 'Enter' && addCustomDeliveryOption()}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={addCustomDeliveryOption}
                disabled={!newCustomDelivery.trim()}
                className="h-11 px-3"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <CreditCard className="w-5 h-5" />
              Payment Terms *
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availablePaymentTerms.map(term => (
                <div key={term} className="flex items-center space-x-2">
                  <Checkbox
                    id={`payment-${term}`}
                    checked={formData.paymentTerms.includes(term)}
                    onCheckedChange={() => togglePaymentTerm(term)}
                  />
                  <Label 
                    htmlFor={`payment-${term}`} 
                    className="text-sm leading-5 cursor-pointer"
                  >
                    {term}
                  </Label>
                  {availableCustomPaymentTerms.includes(term) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomPaymentOption(term)}
                      className="h-6 w-6 p-0 ml-2 text-destructive hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            {validationErrors.paymentTerms && (
              <p className="text-sm text-destructive">{validationErrors.paymentTerms}</p>
            )}
            
            {/* Add Custom Payment Term */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom payment term"
                value={newCustomPayment}
                onChange={(e) => setNewCustomPayment(e.target.value)}
                className="h-11"
                onKeyPress={(e) => e.key === 'Enter' && addCustomPaymentOption()}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={addCustomPaymentOption}
                disabled={!newCustomPayment.trim()}
                className="h-11 px-3"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <FileText className="w-5 h-5" />
              Additional Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any special conditions, harvest dates, certifications, or additional information..."
              value={formData.additionalNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
              className="min-h-20 resize-none"
            />
          </CardContent>
        </Card>

        {/* Submit Button - Right Aligned */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">
          <Button 
            variant="outline" 
            onClick={onBack} 
            disabled={isSubmitting}
            className="h-11 sm:px-6 order-2 sm:order-1 min-h-11"
          >
            Cancel
          </Button>
          
          <Button 
            type="submit"
            disabled={isSubmitting || getUpdateButtonConfig().disabled}
            variant={getUpdateButtonConfig().variant}
            className={`h-11 flex-1 sm:flex-none sm:px-8 order-1 sm:order-2 min-h-11 ${
              getUpdateButtonConfig().disabled ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2 animate-spin" />
                {editingProduct ? 'Updating...' : 'Publishing...'}
              </>
            ) : (
              <>
                {!editingProduct && <Package className="w-4 h-4 mr-2" />}
                {getUpdateButtonConfig().text}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}