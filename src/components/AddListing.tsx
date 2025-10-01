import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { 
  X, 
  Plus, 
  Package, 
  DollarSign, 
  Truck, 
  MapPin,
  Camera,
  AlertCircle,
  CheckCircle
} from "lucide-react";
// Note: In a real implementation, you would use the actual unsplash_tool
// For now, we'll use placeholder logic

interface ProductVariation {
  id: string;
  name: string;
  quantity: string; // New field: how many units (e.g., "50" for 50kg bag)
  unit: string; // Unit type (e.g., "kg", "bag", "basket")
  price: number;
  availableQuantity?: string; // How many total available (e.g., "100 bags available")
  minOrder: string;
  deliveryOption: string;
  description: string;
}

interface AddListingProps {
  currentUser: any;
  onClose: () => void;
  onSave: (listing: any) => void;
  editingProduct?: any; // Optional product to edit
}

export function AddListing({ currentUser, onClose, onSave, editingProduct }: AddListingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Basic Product Info
    productName: editingProduct?.name || '',
    category: editingProduct?.category || '',
    description: editingProduct?.description || '',
    image: editingProduct?.image || '',
    
    // Step 2: Pricing & Quantities
    variations: editingProduct?.variations || [
      {
        id: 'var-1',
        name: 'Standard Pack',
        price: 0,
        unit: '',
        quantity: '',
        minOrder: '',
        deliveryOption: 'pickup',
        description: ''
      }
    ] as ProductVariation[],
    
    // Step 3: Additional Details
    totalQuantity: editingProduct?.quantity || '',
    harvestDate: editingProduct?.harvestDate || '',
    storageMethod: editingProduct?.storageMethod || '',
    qualityCertifications: editingProduct?.qualityCertifications || [] as string[]
  });

  const productCategories = [
    'Rice & Grains',
    'Pulses & Beans', 
    'Oilseeds',
    'Vegetables',
    'Fruits',
    'Spices & Herbs',
    'Traditional Crops',
    'Processed Foods'
  ];

  const deliveryOptions = [
    { value: 'pickup', label: 'Farm/Market Pickup Only' },
    { value: 'local-delivery', label: 'Local Delivery Available' },
    { value: 'transport-delivery', label: 'Transport Delivery Available' },
    { value: 'cold-transport', label: 'Cold Chain Transport' }
  ];

  const certificationOptions = [
    'Organic Certified',
    'GAP Certified',
    'Fair Trade',
    'Non-GMO',
    'Traditional Variety',
    'Export Quality',
    'Fresh Harvested',
    'Sun Dried',
    'Premium Quality'
  ];

  const handleImageSearch = async () => {
    if (!formData.productName) {
      setError('Please enter a product name first');
      return;
    }

    setIsLoadingImage(true);
    try {
      // Simulate image search - in real implementation, use actual unsplash_tool
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Default agricultural image
      const defaultImages = [
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop'
      ];
      
      const randomImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];
      setFormData(prev => ({ ...prev, image: randomImage }));
      setError('');
    } catch (err) {
      setError('Failed to find image. You can continue without an image.');
    } finally {
      setIsLoadingImage(false);
    }
  };

  const addVariation = () => {
    const newId = `var-${formData.variations.length + 1}`;
    setFormData(prev => ({
      ...prev,
      variations: [...prev.variations, {
        id: newId,
        name: '',
        price: 0,
        unit: '',
        quantity: '',
        minOrder: '',
        deliveryOption: 'pickup',
        description: ''
      }]
    }));
  };

  const removeVariation = (id: string) => {
    if (formData.variations.length <= 1) return; // Keep at least one variation
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter(v => v.id !== id)
    }));
  };

  const updateVariation = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map(v => 
        v.id === id ? { ...v, [field]: value } : v
      )
    }));
  };




    const weightMatch = variation.unit.match(/(\d+)kg/);
    if (weightMatch) {
      const weight = parseInt(weightMatch[1]);
      return Math.round(variation.price / weight);
    }
    return 0;
  };

  const validateStep1 = () => {
    if (!formData.productName || !formData.category || !formData.description) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    for (const variation of formData.variations) {
      if (!variation.name || !variation.price || !variation.unit || !variation.quantity) {
        setError('Please complete all variation details');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Process variations for submission
      const processedVariations = formData.variations;

      const newListing = {
        id: editingProduct?.id || Date.now().toString(),
        sellerId: currentUser.id,
        name: formData.productName,
        price: processedVariations[0].price, // Default to first variation price
        unit: processedVariations[0].unit,
        location: currentUser.location,
        sellerType: currentUser.userType,
        sellerName: currentUser.businessName || currentUser.name,
        image: formData.image || `https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop`,
        quantity: formData.totalQuantity,
        lastUpdated: new Date().toISOString(),
        variations: processedVariations,
        category: formData.category,
        description: formData.description,
        harvestDate: formData.harvestDate,
        storageMethod: formData.storageMethod,
        qualityCertifications: formData.qualityCertifications,
        createdAt: editingProduct?.createdAt || new Date().toISOString(),
        isEditing: !!editingProduct
      };

      onSave(newListing);
      onClose();
    } catch (err) {
      setError('Failed to create listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="productName">Product Name *</Label>
        <Input
          id="productName"
          placeholder="e.g., Premium Paw San Rice"
          value={formData.productName}
          onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select product category" />
          </SelectTrigger>
          <SelectContent>
            {productCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Product Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe your product quality, farming methods, and key features..."
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="min-h-20"
        />
      </div>

      <div className="space-y-2">
        <Label>Product Image</Label>
        {formData.image ? (
          <div className="relative">
            <img 
              src={formData.image} 
              alt="Product" 
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
              className="absolute top-2 right-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={handleImageSearch}
            disabled={isLoadingImage}
            className="w-full h-48 border-dashed"
          >
            {isLoadingImage ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Finding image...
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Camera className="w-8 h-8 text-muted-foreground" />
                <span>Find Product Image</span>
              </div>
            )}
          </Button>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Product Variations</h3>
        <Button type="button" variant="outline" size="sm" onClick={addVariation}>
          <Plus className="w-4 h-4 mr-2" />
          Add Variation
        </Button>
      </div>

      {formData.variations.map((variation, index) => (
        <Card key={variation.id} className="relative">
          {formData.variations.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeVariation(variation.id)}
              className="absolute top-2 right-2 text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Variation {index + 1}</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Variation Name *</Label>
                <Input
                  placeholder="e.g., Bulk Order, Retail Pack"
                  value={variation.name}
                  onChange={(e) => updateVariation(variation.id, 'name', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Unit *</Label>
                <Input
                  placeholder="e.g., bag (50kg), basket (5kg)"
                  value={variation.unit}
                  onChange={(e) => updateVariation(variation.id, 'unit', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (MMK) *</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={variation.price || ''}
                  onChange={(e) => updateVariation(variation.id, 'price', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Available Quantity *</Label>
                <Input
                  placeholder="e.g., 100 bags available"
                  value={variation.quantity}
                  onChange={(e) => updateVariation(variation.id, 'quantity', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Order</Label>
                <Input
                  placeholder="e.g., 5 bags"
                  value={variation.minOrder}
                  onChange={(e) => updateVariation(variation.id, 'minOrder', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Delivery Option</Label>
                <Select 
                  value={variation.deliveryOption} 
                  onValueChange={(value) => updateVariation(variation.id, 'deliveryOption', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Variation Description</Label>
              <Textarea
                placeholder="Describe this variation and who it's best for..."
                value={variation.description}
                onChange={(e) => updateVariation(variation.id, 'description', e.target.value)}
                className="min-h-16"
              />
            </div>


          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="totalQuantity">Total Available Quantity</Label>
        <Input
          id="totalQuantity"
          placeholder="e.g., 500 bags in stock"
          value={formData.totalQuantity}
          onChange={(e) => setFormData(prev => ({ ...prev, totalQuantity: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="harvestDate">Harvest Date</Label>
          <Input
            id="harvestDate"
            type="date"
            value={formData.harvestDate}
            onChange={(e) => setFormData(prev => ({ ...prev, harvestDate: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="storageMethod">Storage Method</Label>
          <Input
            id="storageMethod"
            placeholder="e.g., Climate controlled, Traditional storage"
            value={formData.storageMethod}
            onChange={(e) => setFormData(prev => ({ ...prev, storageMethod: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Quality Certifications</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {certificationOptions.map((cert) => (
            <label key={cert} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.qualityCertifications.includes(cert)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData(prev => ({
                      ...prev,
                      qualityCertifications: [...prev.qualityCertifications, cert]
                    }));
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      qualityCertifications: prev.qualityCertifications.filter(c => c !== cert)
                    }));
                  }
                }}
                className="rounded"
              />
              <span className="text-sm">{cert}</span>
            </label>
          ))}
        </div>
        
        {formData.qualityCertifications.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.qualityCertifications.map((cert) => (
              <Badge key={cert} variant="outline">
                {cert}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {editingProduct ? 'Edit Listing' : 'Add New Listing'}
              </CardTitle>
              <CardDescription>
                Step {currentStep} of 3: {
                  currentStep === 1 ? 'Basic Information' :
                  currentStep === 2 ? 'Pricing & Variations' :
                  'Additional Details'
                }
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Progress indicators */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full ${
                  step <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          <div className="flex gap-2 pt-4">
            {currentStep > 1 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            {currentStep < 3 ? (
              <Button type="button" onClick={handleNext} className="flex-1">
                Next
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Creating Listing...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {editingProduct ? 'Update Listing' : 'Create Listing'}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}