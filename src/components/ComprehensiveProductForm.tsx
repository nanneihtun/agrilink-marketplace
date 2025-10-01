import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
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
  Minus,
  Plus
} from "lucide-react";


interface ProductVariation {
  id: string;
  name: string;
  unit: string; // Combined quantity and unit (e.g., "50 kg", "25 bags", "1 basket")
  price: number;
  availableQuantity: string; // How many total available (e.g., "100 bags available")
  minimumOrder: string;
  deliveryOptions: string[];
  paymentTerms: string[];
  description: string;
  additionalNotes: string; // Extra notes, special conditions, or additional information
}

interface Product {
  id: string;
  sellerId: string;
  name: string;
  price: number;
  unit: string;
  location: string;
  sellerType: string;
  sellerName: string;
  image?: string; // Keep for backward compatibility
  images?: string[]; // New multiple images support
  quantity: string;
  lastUpdated: string;
  variations: ProductVariation[];
  category?: string;
  description?: string;
  isEditing?: boolean;
}

interface ComprehensiveProductFormProps {
  currentUser: any;
  onBack: () => void;
  onSave: (product: Product) => Promise<void>;
  editingProduct?: Product | null;
}

// Helper function to ensure variation has all required fields with sensible defaults
function ensureVariationDefaults(variation: any): ProductVariation {
  return {
    id: variation.id || `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: variation.name || '',
    unit: variation.unit || '',
    price: variation.price || 0,
    availableQuantity: variation.availableQuantity || '',
    minimumOrder: variation.minimumOrder || '',
    deliveryOptions: variation.deliveryOptions || [],
    paymentTerms: variation.paymentTerms || [],
    description: variation.description || '',
    additionalNotes: variation.additionalNotes || ''
  };
}

export function ComprehensiveProductForm({ currentUser, onBack, onSave, editingProduct }: ComprehensiveProductFormProps) {

  const [newCustomDelivery, setNewCustomDelivery] = useState('');
  const [newCustomPayment, setNewCustomPayment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data with defaults
  const [formData, setFormData] = useState<Product>(() => {
    if (editingProduct) {
      console.log('🔄 Initializing form with editing product:', {
        id: editingProduct.id,
        name: editingProduct.name,
        description: editingProduct.description || 'UNDEFINED',
        category: editingProduct.category || 'UNDEFINED',
        hasImage: !!editingProduct.image,
        variationsCount: editingProduct.variations?.length || 0
      });
      
      return {
        id: editingProduct.id,
        sellerId: editingProduct.sellerId,
        name: editingProduct.name || '',
        price: editingProduct.price || 0,
        unit: editingProduct.unit || '',
        location: editingProduct.location || currentUser?.location || '',
        sellerType: editingProduct.sellerType || currentUser?.userType || 'farmer',
        sellerName: editingProduct.sellerName || currentUser?.name || '',
        image: editingProduct.image || '',
        images: editingProduct.images || (editingProduct.image ? [editingProduct.image] : []),
        quantity: editingProduct.quantity || '',
        lastUpdated: editingProduct.lastUpdated || new Date().toISOString(),
        variations: editingProduct.variations?.length > 0 
          ? editingProduct.variations.map(ensureVariationDefaults)
          : [createNewVariation()],
        category: editingProduct.category || '',
        description: editingProduct.description || '',
        isEditing: true
      };
    }
    
    return {
      id: '',
      sellerId: currentUser?.id || '',
      name: '',
      price: 0,
      unit: '',
      location: currentUser?.location || '',
      sellerType: currentUser?.userType || 'farmer',
      sellerName: currentUser?.name || '',
      image: '',
      images: [],
      quantity: '',
      lastUpdated: new Date().toISOString(),
      variations: [createNewVariation()],
      category: '',
      description: ''
    };
  });

  // Create a new variation with defaults
  function createNewVariation(): ProductVariation {
    return ensureVariationDefaults({
      id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
  }

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
    
    if (formData.variations.length === 0) {
      errors.variations = 'At least one product variation is required';
    }
    
    // Validate each variation
    formData.variations.forEach((variation, index) => {
      if (!variation.unit?.trim()) {
        errors[`variation-${index}-unit`] = `Variation ${index + 1}: Quantity & unit is required`;
      }
      if (!variation.price || variation.price <= 0) {
        errors[`variation-${index}-price`] = `Variation ${index + 1}: Valid price is required`;
      }
      if (!variation.availableQuantity?.trim()) {
        errors[`variation-${index}-quantity`] = `Variation ${index + 1}: Available quantity is required`;
      }
      if (!variation.minimumOrder?.trim()) {
        errors[`variation-${index}-minimum`] = `Variation ${index + 1}: Minimum order is required`;
      }
      if (variation.deliveryOptions.length === 0) {
        errors[`variation-${index}-delivery`] = `Variation ${index + 1}: At least one delivery option is required`;
      }
      if (variation.paymentTerms.length === 0) {
        errors[`variation-${index}-payment`] = `Variation ${index + 1}: At least one payment term is required`;
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Add a new variation
  const addVariation = useCallback(() => {
    const newVariation = createNewVariation();
    setFormData(prev => ({
      ...prev,
      variations: [...prev.variations, newVariation]
    }));
  }, []);

  // Remove a variation
  const removeVariation = useCallback((variationId: string) => {
    if (formData.variations.length <= 1) {
      console.log('Cannot remove the last variation');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter(v => v.id !== variationId)
    }));
  }, [formData.variations.length]);

  // Update a specific variation
  const updateVariation = useCallback((variationId: string, field: keyof ProductVariation, value: any) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map(v => 
        v.id === variationId ? { ...v, [field]: value } : v
      )
    }));
  }, []);

  // Toggle delivery option for a variation
  const toggleDeliveryOption = useCallback((variationId: string, option: string) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map(v => {
        if (v.id === variationId) {
          const newOptions = v.deliveryOptions.includes(option)
            ? v.deliveryOptions.filter(o => o !== option)
            : [...v.deliveryOptions, option];
          return { ...v, deliveryOptions: newOptions };
        }
        return v;
      })
    }));
  }, []);

  // Toggle payment term for a variation
  const togglePaymentTerm = useCallback((variationId: string, term: string) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map(v => {
        if (v.id === variationId) {
          const newTerms = v.paymentTerms.includes(term)
            ? v.paymentTerms.filter(t => t !== term)
            : [...v.paymentTerms, term];
          return { ...v, paymentTerms: newTerms };
        }
        return v;
      })
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
    
    // Also remove from all variations that use this option
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map(v => ({
        ...v,
        deliveryOptions: v.deliveryOptions.filter(o => o !== option)
      }))
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
    
    // Also remove from all variations that use this term
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map(v => ({
        ...v,
        paymentTerms: v.paymentTerms.filter(t => t !== term)
      }))
    }));
  }, [availableCustomPaymentTerms, saveCustomPaymentTermsToStorage]);

  // Handle multiple image upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxImages = 20; // Increased limit to 20 images total
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
    console.log('Form data being validated:', {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      variationsCount: formData.variations?.length || 0,
      hasImages: !!(formData.images?.length || formData.image),
      imagesCount: formData.images?.length || (formData.image ? 1 : 0)
    });

    if (!validateForm()) {
      console.log('❌ Validation failed:', validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('✅ Validation passed, calling onSave');
      // Update lastUpdated timestamp when saving
      const productToSave = {
        ...formData,
        lastUpdated: new Date().toISOString()
      };
      await onSave(productToSave);
      console.log('✅ onSave completed successfully');
    } catch (error) {
      console.error('❌ Product save failed:', error);
      setIsSubmitting(false); // Re-enable the form if save fails
    }
  }, [formData, validateForm, validationErrors, onSave]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {editingProduct ? 'Edit Product Listing' : 'Add New Product Listing'}
            </h1>
            <p className="text-muted-foreground">Create product variations with specific quantities, pricing, and terms</p>
          </div>
        </div>
      </div>

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

      <div className="space-y-8">
        {/* Product Information & Image - Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6 items-stretch">
          {/* Left: Product Information */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col space-y-4 h-full">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input
                      id="productName"
                      placeholder="e.g., Premium Jasmine Rice"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={validationErrors.name ? 'border-destructive' : ''}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className={validationErrors.category ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select category" />
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
                
                <div className="space-y-2 flex-1 flex flex-col">
                  <Label htmlFor="description">Product Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product, quality, farming methods, and what makes it special..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-24 flex-1 resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Product Image Upload */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Product Photos
                  <Tooltip>
                    <TooltipTrigger className="inline-flex items-center justify-center h-5 w-5 ml-1 rounded hover:bg-muted cursor-help">
                      <AlertCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-72 text-left bg-card border text-card-foreground shadow-lg">
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-foreground">📷 Photo Upload Tips:</p>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          <li>• Use natural lighting or bright indoor lighting</li>
                          <li>• Show the product clearly without cluttered background</li>
                          <li>• Include packaging or quantity indicators</li>
                          <li>• Take photos from multiple angles if helpful</li>
                          <li>• Ensure image is sharp and in focus</li>
                        </ul>
                        <p className="font-medium mt-2 text-foreground">📈 Better Sales Tips:</p>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          <li>• Show quality indicators (freshness, grading)</li>
                          <li>• Include scale reference for size</li>
                          <li>• Highlight unique product features</li>
                          <li>• Use consistent lighting across product photos</li>
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col space-y-4">
                {/* Multiple Images Display */}
                {formData.images && formData.images.length > 0 ? (
                  <div className="flex-1 flex flex-col space-y-3">
                    {/* Image Grid */}
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border hover:opacity-90 transition-opacity"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          {index === 0 && (
                            <Badge className="absolute bottom-1 left-1 text-xs px-1 py-0 h-5">
                              Main
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Add More Photos Button */}
                    {formData.images.length < 20 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add More Photos ({formData.images.length}/20)
                      </Button>
                    )}
                    
                    {/* Clear All Button */}
                    {formData.images.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={removeAllImages}
                        className="w-full text-destructive hover:text-destructive"
                      >
                        Remove All Photos
                      </Button>
                    )}
                  </div>
                ) : (
                  /* Upload Area for First Photos */
                  <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center flex flex-col justify-center flex-1 min-h-32">
                    <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <div className="text-xs text-muted-foreground space-y-1 mb-4">
                      <p>• Use high-quality photos for better visibility</p>
                      <p>• Multiple photos help customers see your product better</p>
                      <p>• Supports JPG, PNG formats up to 3MB each</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photos
                    </Button>
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

        {/* Full Width: Product Variations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Product Variations *
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              At least one variation is required. Define packaging options with quantity & unit, pricing, delivery, and payment terms.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.variations.map((variation, index) => (
              <Card key={variation.id} className="relative">
                {formData.variations.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariation(variation.id)}
                    className="absolute top-2 right-2 w-8 h-8 p-0 bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
                  >
                    <Minus className="w-5 h-5 stroke-[2.5]" />
                  </Button>
                )}
                
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Variation {index + 1}</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Variation Name - Top row standalone */}
                  <div className="space-y-2">
                    <Label>Variation Name</Label>
                    <Input
                      placeholder="e.g., Bulk Pack, Retail Size (optional)"
                      value={variation.name}
                      onChange={(e) => updateVariation(variation.id, 'name', e.target.value)}
                    />
                  </div>

                  {/* Quantity & Unit + Price - First row */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Quantity & Unit *</Label>
                      <Input
                        placeholder="e.g., 50 kg, 25 bags, 1 basket"
                        value={variation.unit}
                        onChange={(e) => updateVariation(variation.id, 'unit', e.target.value)}
                        className={validationErrors[`variation-${index}-unit`] ? 'border-destructive' : ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price (MMK) *</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 45000"
                        value={variation.price || ''}
                        onChange={(e) => updateVariation(variation.id, 'price', parseInt(e.target.value) || 0)}
                        className={validationErrors[`variation-${index}-price`] ? 'border-destructive' : ''}
                      />
                    </div>
                  </div>

                  {/* Available Quantity + Minimum Order - Second row */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Available Quantity *</Label>
                      <Input
                        placeholder="e.g., 100 bags available"
                        value={variation.availableQuantity}
                        onChange={(e) => updateVariation(variation.id, 'availableQuantity', e.target.value)}
                        className={validationErrors[`variation-${index}-quantity`] ? 'border-destructive' : ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum Order *</Label>
                      <Input
                        placeholder="e.g., 5 bags minimum"
                        value={variation.minimumOrder}
                        onChange={(e) => updateVariation(variation.id, 'minimumOrder', e.target.value)}
                        className={validationErrors[`variation-${index}-minimum`] ? 'border-destructive' : ''}
                      />
                    </div>
                  </div>



                  {/* Description - Full width */}
                  <div className="space-y-2">
                    <Label>Variation Description</Label>
                    <Textarea
                      placeholder="Specific details about this variation..."
                      value={variation.description}
                      onChange={(e) => updateVariation(variation.id, 'description', e.target.value)}
                      className="min-h-20"
                    />
                  </div>

                  <Separator />

                  {/* Delivery Options */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className={validationErrors[`variation-${index}-delivery`] ? 'text-destructive' : ''}>
                        Delivery Options * {validationErrors[`variation-${index}-delivery`] && ' (Required)'}
                      </Label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availableDeliveryOptions.map((option) => {
                        const isCustom = availableCustomDeliveryOptions.includes(option);
                        return (
                          <div key={option} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${variation.id}-delivery-${option}`}
                              checked={variation.deliveryOptions.includes(option)}
                              onCheckedChange={() => toggleDeliveryOption(variation.id, option)}
                            />
                            <Label
                              htmlFor={`${variation.id}-delivery-${option}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              {option}
                            </Label>
                            {isCustom && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCustomDeliveryOption(option)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                title="Permanently delete this custom option"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Custom Delivery Option */}
                    <div className="flex gap-2 pt-2">
                      <Input
                        placeholder="Add custom delivery option..."
                        value={newCustomDelivery}
                        onChange={(e) => setNewCustomDelivery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomDeliveryOption();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCustomDeliveryOption}
                        disabled={!newCustomDelivery.trim()}
                        className="px-4"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Terms */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className={validationErrors[`variation-${index}-payment`] ? 'text-destructive' : ''}>
                        Payment Terms * {validationErrors[`variation-${index}-payment`] && ' (Required)'}
                      </Label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availablePaymentTerms.map((term) => {
                        const isCustom = availableCustomPaymentTerms.includes(term);
                        return (
                          <div key={term} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${variation.id}-payment-${term}`}
                              checked={variation.paymentTerms.includes(term)}
                              onCheckedChange={() => togglePaymentTerm(variation.id, term)}
                            />
                            <Label
                              htmlFor={`${variation.id}-payment-${term}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              {term}
                            </Label>
                            {isCustom && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCustomPaymentOption(term)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                title="Permanently delete this custom term"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Custom Payment Option */}
                    <div className="flex gap-2 pt-2">
                      <Input
                        placeholder="Add custom payment term..."
                        value={newCustomPayment}
                        onChange={(e) => setNewCustomPayment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomPaymentOption();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCustomPaymentOption}
                        disabled={!newCustomPayment.trim()}
                        className="px-4"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Additional Notes - Full width */}
                  <div className="space-y-2">
                    <Label>Additional Notes</Label>
                    <Textarea
                      placeholder="Special conditions, handling instructions, certifications, or any other important information..."
                      value={variation.additionalNotes}
                      onChange={(e) => updateVariation(variation.id, 'additionalNotes', e.target.value)}
                      className="min-h-20"
                    />
                  </div>

                  {/* Add Variation Button - positioned at the end of each variation */}
                  <div className="pt-4 border-t">
                    <Button type="button" variant="outline" size="sm" onClick={addVariation} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Another Variation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="min-w-32"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              {editingProduct ? 'Update Product' : 'Create Product'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}