import { useState } from "react";
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
import { 
  ChevronLeft,
  Package, 
  DollarSign, 
  Truck, 
  MapPin,
  Camera,
  AlertCircle,
  CheckCircle,
  Calendar,
  Thermometer,
  Award,
  Scale,
  ShoppingCart,
  FileText,
  Plus,
  Minus,
  CreditCard,
  Shield
} from "lucide-react";
import { unsplash_tool } from '../utils/unsplash';

interface QualitySpecification {
  id: string;
  parameter: string;
  value: string;
  unit: string;
}

interface ProductVariation {
  id: string;
  name: string;
  unit: string;
  quantityPerUnit: string;
  price: number;
  availableQuantity: string;
  minimumOrder: string;
  deliveryOptions: string[];
  paymentTerms: string[];
  description: string;
}

interface AddListingPageProps {
  currentUser: any;
  onBack: () => void;
  onSave: (listing: any) => void;
  editingProduct?: any;
}

export function AddListingPage({ currentUser, onBack, onSave, editingProduct }: AddListingPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Product Information
    productName: editingProduct?.name || '',
    category: editingProduct?.category || '',
    variety: editingProduct?.variety || '',
    description: editingProduct?.description || '',
    image: editingProduct?.image || '',
    
    // Product Variations (quantity/unit based)
    variations: editingProduct?.variations ? editingProduct.variations.map((v: any) => ({
      ...v,
      deliveryOptions: v.deliveryOptions || [],
      paymentTerms: v.paymentTerms || []
    })) : [
      {
        id: 'var-1',
        name: 'Standard Package',
        unit: 'bag',
        quantityPerUnit: '50kg',
        price: 0,
        availableQuantity: '',
        minimumOrder: '',
        deliveryOptions: [],
        paymentTerms: [],
        description: ''
      }
    ] as ProductVariation[],
    

    
    // Product Quality & Specifications
    harvestDate: editingProduct?.harvestDate || '',
    expiryDate: editingProduct?.expiryDate || '',
    grade: editingProduct?.grade || '',
    moisture: editingProduct?.moisture || '',
    purity: editingProduct?.purity || '',
    qualitySpecs: editingProduct?.qualitySpecs || [] as QualitySpecification[],
    
    // Processing & Storage
    processingMethod: editingProduct?.processingMethod || '',
    storageMethod: editingProduct?.storageMethod || '',
    packagingType: editingProduct?.packagingType || '',
    storageTemperature: editingProduct?.storageTemperature || '',
    
    // Certifications & Compliance
    qualityCertifications: editingProduct?.qualityCertifications || [] as string[],
    organicCertified: editingProduct?.organicCertified || false,
    gapCertified: editingProduct?.gapCertified || false,
    exportCertified: editingProduct?.exportCertified || false,
    
    // Logistics & Delivery
    pickupLocation: editingProduct?.pickupLocation || currentUser?.location || '',
    deliveryRadius: editingProduct?.deliveryRadius || '',
    
    // Market Information
    targetMarket: editingProduct?.targetMarket || [],
    seasonality: editingProduct?.seasonality || '',
    competitiveAdvantage: editingProduct?.competitiveAdvantage || '',
    
    // Contact & Terms
    contactPerson: editingProduct?.contactPerson || currentUser?.name || '',
    phoneNumber: editingProduct?.phoneNumber || currentUser?.phone || '',
    returnPolicy: editingProduct?.returnPolicy || ''
  });

  const productCategories = [
    'Rice & Grains',
    'Pulses & Beans', 
    'Oilseeds',
    'Vegetables',
    'Fruits',
    'Spices & Herbs',
    'Traditional Crops',
    'Processed Foods',
    'Dairy Products',
    'Livestock Products',
    'Aquaculture',
    'Forestry Products'
  ];

  const riceVarieties = [
    'Paw San Rice', 'Shwe Bo Paw San', 'Manaw Thu Kha', 'Nga Kywe', 'Paw San Yin',
    'Sin Thu Kha', 'Ayar Min', 'Thee Htat Yin', 'Nga Cheik', 'Shwe War Tun'
  ];

  const qualityGrades = ['Premium', 'Grade A', 'Grade B', 'Grade C', 'Standard', 'Export Quality'];

  const processingMethods = [
    'Sun Dried', 'Machine Dried', 'Air Dried', 'Parboiled', 'Steam Processed',
    'Cold Pressed', 'Traditional Milled', 'Modern Milled', 'Organic Processed'
  ];

  const storageMethods = [
    'Climate Controlled', 'Traditional Warehouse', 'Cold Storage', 'Dry Storage',
    'Vacuum Sealed', 'Nitrogen Flushed', 'Hermetic Storage', 'Open Storage'
  ];

  const packagingTypes = [
    'Jute Bags', 'PP Bags', 'Paper Bags', 'Vacuum Sealed', 'Bulk Container',
    'Cardboard Boxes', 'Plastic Containers', 'Traditional Baskets'
  ];

  const deliveryOptions = [
    'Farm Pickup', 'Local Delivery', 'Regional Transport', 'Cold Chain Delivery',
    'Express Delivery', 'Bulk Transport', 'Custom Logistics'
  ];

  const targetMarkets = [
    'Local Retailers', 'Wholesalers', 'Export Markets', 'Food Processors',
    'Restaurants', 'Supermarkets', 'Direct Consumers', 'Government Procurement'
  ];

  const paymentTermOptions = [
    'Cash on Delivery', 'Advance Payment', '30 Days Credit', '15 Days Credit',
    'Bank Transfer', 'Mobile Payment', 'Letter of Credit', 'Installments'
  ];

  const certificationOptions = [
    'Organic Certified', 'GAP Certified', 'Fair Trade', 'Non-GMO',
    'Traditional Variety', 'Export Quality', 'Halal Certified', 'ISO Certified',
    'Myanmar GAP', 'HACCP', 'Global GAP', 'Rain Forest Alliance'
  ];

  const handleImageSearch = async () => {
    if (!formData.productName) {
      setError('Please enter a product name first');
      return;
    }

    setIsLoadingImage(true);
    try {
      const imageUrl = await unsplash_tool({ 
        query: `${formData.productName} agricultural product Myanmar farming` 
      });
      setFormData(prev => ({ ...prev, image: imageUrl }));
      setError('');
    } catch (err) {
      console.error('Image search failed:', err);
      setError('Failed to find image. You can continue without an image.');
    } finally {
      setIsLoadingImage(false);
    }
  };

  const addQualitySpec = () => {
    const newSpec: QualitySpecification = {
      id: Date.now().toString(),
      parameter: '',
      value: '',
      unit: ''
    };
    setFormData(prev => ({
      ...prev,
      qualitySpecs: [...prev.qualitySpecs, newSpec]
    }));
  };

  const removeQualitySpec = (id: string) => {
    setFormData(prev => ({
      ...prev,
      qualitySpecs: prev.qualitySpecs.filter(spec => spec.id !== id)
    }));
  };

  const updateQualitySpec = (id: string, field: keyof QualitySpecification, value: string) => {
    setFormData(prev => ({
      ...prev,
      qualitySpecs: prev.qualitySpecs.map(spec =>
        spec.id === id ? { ...spec, [field]: value } : spec
      )
    }));
  };

  const addVariation = () => {
    const newVariation: ProductVariation = {
      id: `var-${Date.now()}`,
      name: '',
      unit: '',
      quantityPerUnit: '',
      price: 0,
      availableQuantity: '',
      minimumOrder: '',
      deliveryOptions: [],
      paymentTerms: [],
      description: ''
    };
    setFormData(prev => ({
      ...prev,
      variations: [...prev.variations, newVariation]
    }));
  };

  const removeVariation = (id: string) => {
    if (formData.variations.length <= 1) return; // Keep at least one variation
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter(v => v.id !== id)
    }));
  };

  const updateVariation = (id: string, field: keyof ProductVariation, value: any) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map(v =>
        v.id === id ? { ...v, [field]: value } : v
      )
    }));
  };

  const handleVariationArrayToggle = (variationId: string, field: 'deliveryOptions' | 'paymentTerms', value: string) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map(v => {
        if (v.id === variationId) {
          const currentArray = v[field] || [];
          return {
            ...v,
            [field]: currentArray.includes(value)
              ? currentArray.filter(item => item !== value)
              : [...currentArray, value]
          };
        }
        return v;
      })
    }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item: string) => item !== value)
        : [...prev[field], value]
    }));
  };

  const validateForm = () => {
    if (!formData.productName || !formData.category || !formData.description) {
      setError('Please fill in all required basic information');
      return false;
    }

    for (const variation of formData.variations) {
      if (!variation.name || !variation.unit || !variation.quantityPerUnit || !variation.price || !variation.availableQuantity) {
        setError('Please complete all variation details');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setError('');
    setIsLoading(true);

    try {
      const newListing = {
        id: editingProduct?.id || Date.now().toString(),
        sellerId: currentUser.id,
        name: formData.productName,
        price: formData.variations[0].price, // Default to first variation price
        unit: `${formData.variations[0].unit} (${formData.variations[0].quantityPerUnit})`,
        location: formData.pickupLocation || currentUser.location,
        sellerType: currentUser.userType,
        sellerName: currentUser.businessName || currentUser.name,
        image: formData.image || `https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop`,
        quantity: formData.variations[0]?.availableQuantity || '',
        lastUpdated: new Date().toISOString(),
        category: formData.category,
        variety: formData.variety,
        description: formData.description,
        grade: formData.grade,
        harvestDate: formData.harvestDate,
        expiryDate: formData.expiryDate,
        moisture: formData.moisture,
        purity: formData.purity,
        processingMethod: formData.processingMethod,
        storageMethod: formData.storageMethod,
        packagingType: formData.packagingType,
        storageTemperature: formData.storageTemperature,
        qualityCertifications: formData.qualityCertifications,
        organicCertified: formData.organicCertified,
        gapCertified: formData.gapCertified,
        exportCertified: formData.exportCertified,
        variations: formData.variations,
        targetMarket: formData.targetMarket,
        seasonality: formData.seasonality,
        competitiveAdvantage: formData.competitiveAdvantage,
        contactPerson: formData.contactPerson,
        phoneNumber: formData.phoneNumber,
        returnPolicy: formData.returnPolicy,
        qualitySpecs: formData.qualitySpecs,
        pickupLocation: formData.pickupLocation,
        deliveryRadius: formData.deliveryRadius,
        createdAt: editingProduct?.createdAt || new Date().toISOString(),
        isEditing: !!editingProduct
      };

      onSave(newListing);
    } catch (err) {
      setError('Failed to create listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ChevronLeft 
            className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors" 
            onClick={onBack}
          />
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="w-6 h-6" />
              {editingProduct ? 'Edit Product Listing' : 'Add New Product Listing'}
            </h1>
            <p className="text-muted-foreground">Create product variations with specific quantities, pricing, and terms</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Verification Encouragement Banner - Show for unverified users */}
      {!currentUser.verified && (
        <Alert className="border-orange-200 bg-orange-50 text-orange-800">
          <Shield className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-medium">Boost Your Sales!</div>
              <p className="text-sm">
                Verified sellers get 3x more inquiries and engagement. Complete your verification to:
              </p>
              <ul className="text-sm list-disc list-inside space-y-1 ml-4">
                <li>Show trust badges on your listings</li>
                <li>Get featured in search results</li>
                <li>Get priority visibility to bulk buyers</li>
                <li>Build stronger buyer confidence</li>
              </ul>
              <Button size="sm" variant="outline" className="mt-2 border-orange-300 text-orange-700 hover:bg-orange-100">
                Complete Verification
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info & Variations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Basic Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
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
                      <SelectValue placeholder="Select category" />
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
              </div>

              {formData.category === 'Rice & Grains' && (
                <div className="space-y-2">
                  <Label htmlFor="variety">Rice Variety</Label>
                  <Select value={formData.variety} onValueChange={(value) => setFormData(prev => ({ ...prev, variety: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rice variety" />
                    </SelectTrigger>
                    <SelectContent>
                      {riceVarieties.map((variety) => (
                        <SelectItem key={variety} value={variety}>
                          {variety}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Product Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your product quality, farming methods, key features, and what makes it special..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-24"
                />
              </div>


            </CardContent>
          </Card>

          {/* Product Variations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Product Variations
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Define different packaging options with quantity, pricing, delivery, and payment terms
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label>Variations</Label>
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
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">Variation {index + 1}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Basic Variation Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Variation Name *</Label>
                        <Input
                          placeholder="e.g., Bulk Pack, Retail Size"
                          value={variation.name}
                          onChange={(e) => updateVariation(variation.id, 'name', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Unit Type *</Label>
                        <Input
                          placeholder="e.g., bag, box, basket"
                          value={variation.unit}
                          onChange={(e) => updateVariation(variation.id, 'unit', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Quantity per Unit *</Label>
                        <Input
                          placeholder="e.g., 50kg, 25kg, 10kg"
                          value={variation.quantityPerUnit}
                          onChange={(e) => updateVariation(variation.id, 'quantityPerUnit', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          value={variation.availableQuantity}
                          onChange={(e) => updateVariation(variation.id, 'availableQuantity', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Minimum Order</Label>
                        <Input
                          placeholder="e.g., 5 bags"
                          value={variation.minimumOrder}
                          onChange={(e) => updateVariation(variation.id, 'minimumOrder', e.target.value)}
                        />
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

                    <Separator />

                    {/* Delivery Options for this variation */}
                    <div className="space-y-3">
                      <Label>Delivery Options for this Variation</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {deliveryOptions.map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <Checkbox
                              id={`delivery-${variation.id}-${option}`}
                              checked={(variation.deliveryOptions || []).includes(option)}
                              onCheckedChange={() => handleVariationArrayToggle(variation.id, 'deliveryOptions', option)}
                            />
                            <Label htmlFor={`delivery-${variation.id}-${option}`} className="text-sm">{option}</Label>
                          </div>
                        ))}
                      </div>
                      {(variation.deliveryOptions && variation.deliveryOptions.length > 0) && (
                        <div className="flex flex-wrap gap-1">
                          {(variation.deliveryOptions || []).map((option) => (
                            <Badge key={option} variant="outline" className="text-xs">
                              <Truck className="w-3 h-3 mr-1" />
                              {option}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Payment Terms for this variation */}
                    <div className="space-y-3">
                      <Label>Payment Terms for this Variation</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {paymentTermOptions.map((term) => (
                          <div key={term} className="flex items-center space-x-2">
                            <Checkbox
                              id={`payment-${variation.id}-${term}`}
                              checked={(variation.paymentTerms || []).includes(term)}
                              onCheckedChange={() => handleVariationArrayToggle(variation.id, 'paymentTerms', term)}
                            />
                            <Label htmlFor={`payment-${variation.id}-${term}`} className="text-sm">{term}</Label>
                          </div>
                        ))}
                      </div>
                      {(variation.paymentTerms && variation.paymentTerms.length > 0) && (
                        <div className="flex flex-wrap gap-1">
                          {(variation.paymentTerms || []).map((term) => (
                            <Badge key={term} variant="outline" className="text-xs">
                              <CreditCard className="w-3 h-3 mr-1" />
                              {term}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Quality & Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Quality & Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Quality Grade</Label>
                  <Select value={formData.grade} onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {qualityGrades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="harvestDate">Harvest Date</Label>
                  <Input
                    id="harvestDate"
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, harvestDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="moisture">Moisture Content (%)</Label>
                  <Input
                    id="moisture"
                    placeholder="e.g., 14%"
                    value={formData.moisture}
                    onChange={(e) => setFormData(prev => ({ ...prev, moisture: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="purity">Purity (%)</Label>
                  <Input
                    id="purity"
                    placeholder="e.g., 95%"
                    value={formData.purity}
                    onChange={(e) => setFormData(prev => ({ ...prev, purity: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Best Before</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Custom Quality Specifications */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Additional Quality Parameters</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addQualitySpec}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Parameter
                  </Button>
                </div>
                
                {formData.qualitySpecs.map((spec) => (
                  <div key={spec.id} className="grid grid-cols-4 gap-2 items-end">
                    <Input 
                      placeholder="Parameter"
                      value={spec.parameter}
                      onChange={(e) => updateQualitySpec(spec.id, 'parameter', e.target.value)}
                    />
                    <Input 
                      placeholder="Value"
                      value={spec.value}
                      onChange={(e) => updateQualitySpec(spec.id, 'value', e.target.value)}
                    />
                    <Input 
                      placeholder="Unit"
                      value={spec.unit}
                      onChange={(e) => updateQualitySpec(spec.id, 'unit', e.target.value)}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeQualitySpec(spec.id)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Processing & Storage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="w-5 h-5" />
                Processing & Storage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="processingMethod">Processing Method</Label>
                  <Select value={formData.processingMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, processingMethod: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {processingMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="storageMethod">Storage Method</Label>
                  <Select value={formData.storageMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, storageMethod: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select storage" />
                    </SelectTrigger>
                    <SelectContent>
                      {storageMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="packagingType">Packaging Type</Label>
                  <Select value={formData.packagingType} onValueChange={(value) => setFormData(prev => ({ ...prev, packagingType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select packaging" />
                    </SelectTrigger>
                    <SelectContent>
                      {packagingTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="storageTemperature">Storage Temperature</Label>
                  <Input
                    id="storageTemperature"
                    placeholder="e.g., 15-25°C, Room temperature"
                    value={formData.storageTemperature}
                    onChange={(e) => setFormData(prev => ({ ...prev, storageTemperature: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Image, Certifications, Contact */}
        <div className="space-y-6">
          
          {/* Product Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Product Image
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                    Remove
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
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="organic"
                    checked={formData.organicCertified}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, organicCertified: checked as boolean }))}
                  />
                  <Label htmlFor="organic">Organic Certified</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gap"
                    checked={formData.gapCertified}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gapCertified: checked as boolean }))}
                  />
                  <Label htmlFor="gap">GAP Certified</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="export"
                    checked={formData.exportCertified}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, exportCertified: checked as boolean }))}
                  />
                  <Label htmlFor="export">Export Certified</Label>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Additional Certifications</Label>
                <div className="grid gap-2">
                  {certificationOptions.map((cert) => (
                    <div key={cert} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cert-${cert}`}
                        checked={formData.qualityCertifications.includes(cert)}
                        onCheckedChange={() => handleArrayToggle('qualityCertifications', cert)}
                      />
                      <Label htmlFor={`cert-${cert}`} className="text-sm">{cert}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {formData.qualityCertifications.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.qualityCertifications.map((cert) => (
                    <Badge key={cert} variant="outline" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Logistics Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pickupLocation">Pickup Location</Label>
                <Input
                  id="pickupLocation"
                  placeholder="Specific pickup address"
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, pickupLocation: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deliveryRadius">Delivery Radius</Label>
                <Input
                  id="deliveryRadius"
                  placeholder="e.g., 50km, Within city"
                  value={formData.deliveryRadius}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryRadius: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Market Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Market Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Target Market</Label>
                <div className="grid gap-2">
                  {targetMarkets.map((market) => (
                    <div key={market} className="flex items-center space-x-2">
                      <Checkbox
                        id={`market-${market}`}
                        checked={formData.targetMarket.includes(market)}
                        onCheckedChange={() => handleArrayToggle('targetMarket', market)}
                      />
                      <Label htmlFor={`market-${market}`} className="text-sm">{market}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seasonality">Seasonality</Label>
                <Textarea
                  id="seasonality"
                  placeholder="When is this product typically available?"
                  value={formData.seasonality}
                  onChange={(e) => setFormData(prev => ({ ...prev, seasonality: e.target.value }))}
                  className="min-h-16"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="competitiveAdvantage">Competitive Advantage</Label>
                <Textarea
                  id="competitiveAdvantage"
                  placeholder="What makes your product better than competitors?"
                  value={formData.competitiveAdvantage}
                  onChange={(e) => setFormData(prev => ({ ...prev, competitiveAdvantage: e.target.value }))}
                  className="min-h-16"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact & Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Contact & Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnPolicy">Return Policy</Label>
                <Textarea
                  id="returnPolicy"
                  placeholder="Describe your return/exchange policy"
                  value={formData.returnPolicy}
                  onChange={(e) => setFormData(prev => ({ ...prev, returnPolicy: e.target.value }))}
                  className="min-h-16"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading}
          size="lg"
          className="px-8"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              {editingProduct ? 'Updating...' : 'Creating Listing...'}
            </div>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              {editingProduct ? 'Update Listing' : 'Create Listing'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}