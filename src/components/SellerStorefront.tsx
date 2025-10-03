import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { formatMemberSinceDate, getRelativeTime } from "../utils/dates";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { UserBadge, PublicVerificationStatus, getUserVerificationLevel, getUserAccountType } from "./UserBadgeSystem";
import { Separator } from "./ui/separator";
import { ReviewsService, type SellerStats } from "../services/reviews";
import { 
  ChevronLeft, 
  MapPin, 
  Calendar, 
  Package, 
  Star,
  MessageCircle,
  Eye,
  TrendingUp,
  TrendingDown,
  Store,
  Award,
  Clock,
  Users,
  Camera,
  Edit,
  Save,
  X,
  Plus,
  Phone,
  Mail,
  ExternalLink,
  Shield,
  CheckCircle,
  Building,
  Truck,
  Leaf,
  Facebook,
  Instagram,
  Music,
  Video,
  MessageSquare,
  Play,
  Globe
} from "lucide-react";

interface Product {
  id: string;
  sellerId: string;
  name: string;
  price: number;
  unit: string;
  location: string;
  sellerType: 'farmer' | 'trader';
  sellerName: string;
  image: string;
  quantity: string;
  priceChange: number;
  lastUpdated: string;
}

interface Seller {
  id: string;
  name: string;
  type: 'farmer' | 'trader';
  accountType?: string;
  location: string;
  description: string;
  image: string;
  rating: number;
  totalReviews: number;
  yearsActive: number;
  responseTime: string;
  certifications: string[];
  joinedDate: string;
  verified?: boolean;
}

interface SellerStorefrontProps {
  seller: Seller;
  products: Product[];
  onBack: () => void;
  onViewProduct: (productId: string) => void;
  onChat: (productId: string) => void;
  isOwnStorefront?: boolean;
  onEditStorefrontImage?: () => void;
  onUpdateStorefront?: (updates: any) => Promise<void>;
  previewMode?: boolean;
  onTogglePreviewMode?: (mode: boolean) => void;
}

export function SellerStorefront({ 
  seller, 
  products, 
  onBack, 
  onViewProduct, 
  onChat,
  isOwnStorefront = false,
  onEditStorefrontImage,
  onUpdateStorefront,
  previewMode = false,
  onTogglePreviewMode
}: SellerStorefrontProps) {
  // Editing states
  const [editing, setEditing] = useState<{
    field: string;
    value: string;
  } | null>(null);
  
  // State for seller statistics
  const [sellerStats, setSellerStats] = useState<SellerStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Storefront data state - directly use seller prop data
  const [storefrontData, setStorefrontData] = useState(() => ({
    description: seller.description || '',
    businessHours: (seller as any).businessHours || '9 AM - 6 PM, Mon-Sat',
    phone: (seller as any).phone || '',
    email: (seller as any).email || '',
    website: (seller as any).website || '',
    facebook: (seller as any).facebook || '',
    instagram: (seller as any).instagram || '',
    whatsapp: (seller as any).whatsapp || '',
    tiktok: (seller as any).tiktok || '',
    specialties: (seller as any).specialties || [],
    policies: (seller as any).policies || {
      returns: '',
      delivery: '',
      payment: ''
    }
  }));

  // Fetch seller statistics
  useEffect(() => {
    const fetchSellerStats = async () => {
      if (!seller.id) return;
      
      setLoadingStats(true);
      try {
        console.log('🔍 SellerStorefront: Fetching stats for sellerId:', seller.id);
        const stats = await ReviewsService.getSellerStats(seller.id);
        console.log('📊 SellerStorefront: Seller stats received:', stats);
        setSellerStats(stats);
      } catch (error) {
        console.error('❌ SellerStorefront: Error fetching seller stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchSellerStats();
  }, [seller.id]);

  // Update storefront data when seller prop changes (for real-time profile updates)
  useEffect(() => {
    const newStorefrontData = {
      description: seller.description || '',
      businessHours: (seller as any).businessHours || '9 AM - 6 PM, Mon-Sat',
      phone: (seller as any).phone || '',
      email: (seller as any).email || '',
      website: (seller as any).website || '',
      facebook: (seller as any).facebook || '',
      instagram: (seller as any).instagram || '',
      whatsapp: (seller as any).whatsapp || '',
      specialties: (seller as any).specialties || [],
      policies: (seller as any).policies || {
        returns: '',
        delivery: '',
        payment: ''
      }
    };
    
    setStorefrontData(newStorefrontData);
  }, [seller]);

  const startEditing = (field: string, value: string) => {
    setEditing({ field, value });
  };

  const cancelEditing = () => {
    setEditing(null);
  };

  const handleSave = async (field: string, value: string) => {
    try {
      const updates = { [field]: value };
      setStorefrontData(prev => ({ ...prev, [field]: value }));
      setEditing(null);
      
      if (onUpdateStorefront) {
        await onUpdateStorefront(updates);
      }
    } catch (error) {
      console.error('Failed to save:', error);
      // Revert changes on error
      setStorefrontData(prev => ({ ...prev, [field]: storefrontData[field as keyof typeof storefrontData] }));
    }
  };

  const addSpecialty = (specialty: string) => {
    if (!specialty.trim() || storefrontData.specialties.includes(specialty.trim())) return;
    
    const updatedSpecialties = [...storefrontData.specialties, specialty.trim()];
    setStorefrontData(prev => ({ ...prev, specialties: updatedSpecialties }));
    setEditing(null);
    
    if (onUpdateStorefront) {
      onUpdateStorefront({ specialties: updatedSpecialties });
    }
  };

  const removeSpecialty = (specialty: string) => {
    const updatedSpecialties = storefrontData.specialties.filter(s => s !== specialty);
    setStorefrontData(prev => ({ ...prev, specialties: updatedSpecialties }));
    
    if (onUpdateStorefront) {
      onUpdateStorefront({ specialties: updatedSpecialties });
    }
  };
  // Safety check for seller data
  if (!seller || !seller.name) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Seller information not available.</p>
        </div>
      </div>
    );
  }
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const totalProducts = products.length;
  const averagePrice = products.length > 0 
    ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length)
    : 0;

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
            <h1 className="text-2xl font-semibold">{seller.name}</h1>
            <p className="text-muted-foreground">
              {seller.type === 'farmer' ? 'Farm' : 'Trading'} Storefront
            </p>
          </div>
        </div>

        {/* Preview Mode Toggle - Only show for storefront owners */}
        {isOwnStorefront && onTogglePreviewMode && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Preview Mode</span>
              <button
                onClick={() => onTogglePreviewMode(!previewMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  previewMode ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    previewMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {previewMode && (
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/30 rounded-lg">
                <Eye className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Customer View</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Mode Banner */}
      {isOwnStorefront && previewMode && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-medium text-primary">Customer Preview Mode</h3>
              <p className="text-sm text-primary/80">
                This is exactly how customers see your storefront. Toggle off to return to editing mode.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Seller Profile */}
        <div className="lg:col-span-1 space-y-4">
          {/* Main Profile Card */}
          <Card className="border-primary/30">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Seller Image */}
                <div className="relative group">
                  <img 
                    src={seller.image} 
                    alt={seller.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {isOwnStorefront && !previewMode && onEditStorefrontImage && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white shadow-md"
                      onClick={onEditStorefrontImage}
                    >
                      <Camera className="w-4 h-4 mr-1" />
                      Edit Photo
                    </Button>
                  )}
                </div>

                {/* Basic Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{seller.name}</h2>
                    {/* Public verification status - only shows green badge for fully verified */}
                    <PublicVerificationStatus 
                      verificationLevel={getUserVerificationLevel(seller)}
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{seller.location}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <UserBadge 
                      userType={seller.type}
                      accountType={getUserAccountType(seller)}
                      verificationLevel={getUserVerificationLevel(seller)}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Rating - Show dynamic data or loading state */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {loadingStats ? (
                      <span className="text-sm text-muted-foreground">Loading...</span>
                    ) : (
                      <>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(sellerStats?.rating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm font-medium ml-2">
                          {sellerStats?.rating ? sellerStats.rating.toFixed(1) : '0.0'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({sellerStats?.totalReviews || 0} {sellerStats?.totalReviews === 1 ? 'review' : 'reviews'})
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Business Hours */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Business Hours</span>
                    </div>
                    {isOwnStorefront && !previewMode && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing('businessHours', storefrontData.businessHours)}
                        className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {editing?.field === 'businessHours' ? (
                    <div className="space-y-2">
                      <Input
                        value={editing.value}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        placeholder="e.g., 9 AM - 6 PM, Mon-Sat"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSave('businessHours', editing.value)}>
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditing}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{storefrontData.businessHours}</p>
                  )}
                </div>

                {/* Member Since & Response Time */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Joined {formatMemberSinceDate(seller.joinedDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      Response time: {loadingStats ? 'Loading...' : (sellerStats?.responseTime || 'Within 24 hours')}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Card - Only show if there's data or if owner in edit mode */}
          {(!previewMode || storefrontData.phone || storefrontData.email || storefrontData.website) && (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Phone - Only show if has data or owner in edit mode */}
                {(!previewMode || storefrontData.phone) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Phone</span>
                      </div>
                      {isOwnStorefront && !previewMode && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing('phone', storefrontData.phone)}
                          className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {editing?.field === 'phone' ? (
                      <div className="space-y-2">
                        <Input
                          value={editing.value}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          placeholder="+95 9 xxx xxx xxx"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSave('phone', editing.value)}>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {storefrontData.phone || (isOwnStorefront && !previewMode ? 'Add phone number' : null)}
                      </p>
                    )}
                  </div>
                )}

                {/* Email - Only show if has data or owner in edit mode */}
                {(!previewMode || storefrontData.email) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Email</span>
                      </div>
                      {isOwnStorefront && !previewMode && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing('email', storefrontData.email)}
                          className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {editing?.field === 'email' ? (
                      <div className="space-y-2">
                        <Input
                          value={editing.value}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          placeholder="business@example.com"
                          type="email"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSave('email', editing.value)}>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {storefrontData.email || (isOwnStorefront && !previewMode ? 'Add email address' : null)}
                      </p>
                    )}
                  </div>
                )}

                {/* Website - Only show if has data or owner in edit mode */}
                {(storefrontData.website || (isOwnStorefront && !previewMode)) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Website</span>
                      </div>
                      {isOwnStorefront && !previewMode && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing('website', storefrontData.website)}
                          className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {editing?.field === 'website' ? (
                      <div className="space-y-2">
                        <Input
                          value={editing.value}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          placeholder="https://example.com"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSave('website', editing.value)}>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : storefrontData.website ? (
                      <a 
                        href={storefrontData.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {storefrontData.website}
                      </a>
                    ) : (
                      isOwnStorefront && !previewMode && (
                        <p className="text-sm text-muted-foreground">Add website URL</p>
                      )
                    )}
                  </div>
                )}

                {/* Social Media Links - Always show for own storefront, or if there are existing links */}
                {((storefrontData.facebook || storefrontData.instagram || storefrontData.whatsapp || storefrontData.tiktok) || (isOwnStorefront && !previewMode)) && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Social Media & Online Presence
                      </h4>
                      
                      <div className="flex flex-col gap-3">
                        {/* Facebook */}
                        {(storefrontData.facebook || (isOwnStorefront && !previewMode)) && (
                          <>
                            {editing?.field === 'facebook' ? (
                              <div className="flex-1 space-y-2">
                                <Input
                                  value={editing.value}
                                  onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                                  placeholder="facebook.com/yourpage"
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleSave('facebook', editing.value)}>
                                    <Save className="w-4 h-4 mr-1" />
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : storefrontData.facebook ? (
                              <div className="flex items-center gap-1">
                                <a 
                                  href={storefrontData.facebook.startsWith('http') ? storefrontData.facebook : `https://facebook.com/${storefrontData.facebook.replace('facebook.com/', '').replace('@', '')}`}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors group"
                                >
                                  <Facebook className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                                </a>
                                {isOwnStorefront && !previewMode && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => startEditing('facebook', storefrontData.facebook)}
                                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 border border-blue-200">
                                  <Facebook className="w-5 h-5 text-blue-600" />
                                </div>
                                {isOwnStorefront && !previewMode && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => startEditing('facebook', storefrontData.facebook || '')}
                                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {/* Instagram */}
                        {(storefrontData.instagram || (isOwnStorefront && !previewMode)) && (
                          <>
                            {editing?.field === 'instagram' ? (
                              <div className="flex-1 space-y-2">
                                <Input
                                  value={editing.value}
                                  onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                                  placeholder="instagram.com/yourprofile"
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleSave('instagram', editing.value)}>
                                    <Save className="w-4 h-4 mr-1" />
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : storefrontData.instagram ? (
                              <div className="flex items-center gap-1">
                                <a 
                                  href={storefrontData.instagram.startsWith('http') ? storefrontData.instagram : `https://instagram.com/${storefrontData.instagram.replace('instagram.com/', '').replace('@', '')}`}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-50 hover:bg-pink-100 transition-colors group"
                                >
                                  <Instagram className="w-5 h-5 text-pink-600 group-hover:text-pink-700" />
                                </a>
                                {isOwnStorefront && !previewMode && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => startEditing('instagram', storefrontData.instagram)}
                                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-50 border border-pink-200">
                                  <Instagram className="w-5 h-5 text-pink-600" />
                                </div>
                                {isOwnStorefront && !previewMode && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => startEditing('instagram', storefrontData.instagram || '')}
                                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {/* WhatsApp */}
                        {(storefrontData.whatsapp || (isOwnStorefront && !previewMode)) && (
                          <>
                            {editing?.field === 'whatsapp' ? (
                              <div className="flex-1 space-y-2">
                                <Input
                                  value={editing.value}
                                  onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                                  placeholder="+1234567890 or wa.me/1234567890"
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleSave('whatsapp', editing.value)}>
                                    <Save className="w-4 h-4 mr-1" />
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : storefrontData.whatsapp ? (
                              <div className="flex items-center gap-1">
                                <a 
                                  href={storefrontData.whatsapp.startsWith('http') ? storefrontData.whatsapp : `https://wa.me/${storefrontData.whatsapp.replace('+', '').replace('whatsapp.com/', '').replace('wa.me/', '')}`}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center w-10 h-10 rounded-full bg-green-50 hover:bg-green-100 transition-colors group"
                                >
                                  <MessageSquare className="w-5 h-5 text-green-600 group-hover:text-green-700" />
                                </a>
                                {isOwnStorefront && !previewMode && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => startEditing('whatsapp', storefrontData.whatsapp)}
                                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-50 border border-green-200">
                                  <MessageSquare className="w-5 h-5 text-green-600" />
                                </div>
                                {isOwnStorefront && !previewMode && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => startEditing('whatsapp', storefrontData.whatsapp || '')}
                                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {/* TikTok */}
                        {(storefrontData.tiktok || (isOwnStorefront && !previewMode)) && (
                          <>
                            {editing?.field === 'tiktok' ? (
                              <div className="flex-1 space-y-2">
                                <Input
                                  value={editing.value}
                                  onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                                  placeholder="Enter TikTok username or URL"
                                  className="text-sm"
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleSave('tiktok')}>
                                    <Save className="w-3 h-3 mr-1" />
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : storefrontData.tiktok ? (
                              <div className="flex items-center gap-1">
                                <a 
                                  href={storefrontData.tiktok.startsWith('http') ? storefrontData.tiktok : `https://tiktok.com/@${storefrontData.tiktok.replace('@', '').replace('tiktok.com/', '')}`}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center w-10 h-10 rounded-full bg-black hover:bg-gray-800 transition-colors group"
                                >
                                  <Play className="w-5 h-5 text-white group-hover:text-gray-200" />
                                </a>
                                {isOwnStorefront && !previewMode && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => startEditing('tiktok', storefrontData.tiktok)}
                                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black border border-gray-300">
                                  <Play className="w-5 h-5 text-white" />
                                </div>
                                {isOwnStorefront && !previewMode && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => startEditing('tiktok', storefrontData.tiktok || '')}
                                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Empty state for edit mode */}
                {isOwnStorefront && !previewMode && !storefrontData.phone && !storefrontData.email && !storefrontData.website && !storefrontData.facebook && !storefrontData.instagram && !storefrontData.whatsapp && !storefrontData.tiktok && (
                  <div className="text-center py-4 text-sm text-muted-foreground bg-muted/30 rounded-lg">
                    <Phone className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium">Add contact information</p>
                    <p>Help customers reach you easily</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Certifications & Specialties - Only show if there's data or if owner in edit mode */}
          {(seller.certifications.length > 0 || storefrontData.specialties.length > 0 || (isOwnStorefront && !previewMode)) && (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certifications & Specialties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Certifications - Only show if exists */}
                {seller.certifications.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Certifications</span>
                    <div className="flex flex-wrap gap-2">
                      {seller.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specialties - Only show if has data or owner in edit mode */}
                {(storefrontData.specialties.length > 0 || (isOwnStorefront && !previewMode)) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Specialties</span>
                      {isOwnStorefront && !previewMode && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing('specialties', '')}
                          className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                          title="Add specialty"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {editing?.field === 'specialties' ? (
                      <div className="space-y-2">
                        <Input
                          value={editing.value}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          placeholder="e.g., Organic Vegetables, Rice Varieties"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              addSpecialty(editing.value);
                            }
                            if (e.key === 'Escape') cancelEditing();
                          }}
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => addSpecialty(editing.value)}
                            disabled={!editing.value.trim()}
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 min-h-[2rem] items-center">
                        {storefrontData.specialties.length > 0 ? (
                          storefrontData.specialties.map((specialty: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                              {specialty}
                              {isOwnStorefront && !previewMode && (
                                <button
                                  onClick={() => removeSpecialty(specialty)}
                                  className="hover:text-destructive transition-colors"
                                  title="Remove specialty"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </Badge>
                          ))
                        ) : (
                          isOwnStorefront && !previewMode && (
                            <p className="text-sm text-muted-foreground">Add your specialties</p>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Empty state for edit mode */}
                {isOwnStorefront && !previewMode && seller.certifications.length === 0 && storefrontData.specialties.length === 0 && (
                  <div className="text-center py-4 text-sm text-muted-foreground bg-muted/30 rounded-lg">
                    <Award className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium">Showcase your expertise</p>
                    <p>Add certifications and specialties to build customer trust</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Products and Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Description */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                About {seller.name}
                {isOwnStorefront && !previewMode && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEditing('description', storefrontData.description)}
                    className="opacity-60 hover:opacity-100"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit Description
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editing?.field === 'description' ? (
                <div className="space-y-3">
                  <Textarea
                    value={editing.value}
                    onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                    placeholder="Tell customers about your business, experience, farming methods, quality standards, and what makes you unique..."
                    rows={6}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => handleSave('description', editing.value)}>
                      <Save className="w-4 h-4 mr-1" />
                      Save Description
                    </Button>
                    <Button variant="outline" onClick={cancelEditing}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {storefrontData.description || (isOwnStorefront && !previewMode
                      ? 'Tell customers about your business. Click "Edit Description" to add information about your farming experience, quality standards, and what makes your products special.'
                      : 'No description available.'
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business Policies - Only show if has content or if owner in edit mode */}
          {(storefrontData.policies.delivery || storefrontData.policies.payment || storefrontData.policies.returns || (isOwnStorefront && !previewMode)) && (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Business Policies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Delivery Policy - Only show if has content or owner in edit mode */}
                {(storefrontData.policies.delivery || (isOwnStorefront && !previewMode)) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Delivery & Shipping</span>
                      {isOwnStorefront && !previewMode && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing('delivery', storefrontData.policies.delivery)}
                          className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {editing?.field === 'delivery' ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editing.value}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          placeholder="Describe your delivery options, areas covered, delivery times, and shipping costs..."
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => {
                            setStorefrontData(prev => ({
                              ...prev,
                              policies: { ...prev.policies, delivery: editing!.value }
                            }));
                            handleSave('policies', { ...storefrontData.policies, delivery: editing!.value });
                          }}>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {storefrontData.policies.delivery || (isOwnStorefront && !previewMode && 'Add your delivery and shipping information')}
                      </p>
                    )}
                  </div>
                )}

                {/* Payment Policy - Only show if has content or owner in edit mode */}
                {(storefrontData.policies.payment || (isOwnStorefront && !previewMode)) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Payment Methods</span>
                      {isOwnStorefront && !previewMode && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing('payment', storefrontData.policies.payment)}
                          className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {editing?.field === 'payment' ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editing.value}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          placeholder="List accepted payment methods: Cash on delivery, bank transfer, mobile payments, etc..."
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => {
                            setStorefrontData(prev => ({
                              ...prev,
                              policies: { ...prev.policies, payment: editing!.value }
                            }));
                            handleSave('policies', { ...storefrontData.policies, payment: editing!.value });
                          }}>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {storefrontData.policies.payment || (isOwnStorefront && !previewMode && 'Add your accepted payment methods')}
                      </p>
                    )}
                  </div>
                )}

                {/* Returns Policy - Only show if has content or owner in edit mode */}
                {(storefrontData.policies.returns || (isOwnStorefront && !previewMode)) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Returns & Quality Guarantee</span>
                      {isOwnStorefront && !previewMode && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing('returns', storefrontData.policies.returns)}
                          className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {editing?.field === 'returns' ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editing.value}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          placeholder="Describe your quality guarantee, return policy, and how you handle customer concerns..."
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => {
                            setStorefrontData(prev => ({
                              ...prev,
                              policies: { ...prev.policies, returns: editing!.value }
                            }));
                            handleSave('policies', { ...storefrontData.policies, returns: editing!.value });
                          }}>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {storefrontData.policies.returns || (isOwnStorefront && !previewMode && 'Add your quality guarantee and return policy')}
                      </p>
                    )}
                  </div>
                )}

                {isOwnStorefront && !previewMode && !storefrontData.policies.delivery && !storefrontData.policies.payment && !storefrontData.policies.returns && (
                  <div className="text-center py-4 text-sm text-muted-foreground bg-muted/30 rounded-lg">
                    <Building className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium">Build customer trust</p>
                    <p>Add your business policies to help customers understand your services</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Products */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle>
                Products ({totalProducts} {totalProducts === 1 ? 'item' : 'items'})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {isOwnStorefront 
                      ? "You haven't listed any products yet. Go to your Dashboard to add and manage products."
                      : "No products available at the moment."
                    }
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <Card key={product.id} className="hover:shadow-md transition-shadow border-primary/30">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1 space-y-2">
                            <div>
                              <h3 className="font-medium">{product.name}</h3>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold">
                                  {formatPrice(product.price)} MMK
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  per {product.unit}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Package className="w-3 h-3" />
                              <span>{product.quantity}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {product.priceChange > 0 ? (
                                <TrendingUp className="w-3 h-3 text-green-600" />
                              ) : (
                                <TrendingDown className="w-3 h-3 text-red-600" />
                              )}
                              <span className={`text-xs ${product.priceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {product.priceChange > 0 ? '+' : ''}{product.priceChange}%
                              </span>
                              <span className="text-xs text-muted-foreground">
                                • {getRelativeTime(product.lastUpdated)}
                              </span>
                            </div>

                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className={`h-9 px-3 py-2 ${!isOwnStorefront ? "flex-1" : "w-full"}`}
                                onClick={() => onViewProduct(product.id)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                              {!isOwnStorefront && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="flex-1 h-9 px-3 py-2"
                                  onClick={() => onChat(product.id)}
                                >
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Chat
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}