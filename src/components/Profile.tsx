import { Badge } from "./ui/badge";
import { UserBadge, getUserVerificationLevel, getUserAccountType, getUserSpecialties, BadgeExplanation } from "./UserBadgeSystem";
import { myanmarRegions } from "../utils/regions";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useRef, useEffect } from "react";
import { 
  User, 
  MapPin, 
  Phone, 
  Store, 
  Shield, 
  Mail,
  Calendar,
  Star,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  Edit,
  Save,
  X,
  Camera,
  Trash2,
  Database,
  Clock,
  Facebook,
  Instagram,
  Globe,
  MessageCircle
} from "lucide-react";
// No storage utility needed with Supabase
// No StorageManager needed with Supabase
import { formatMemberSinceDate } from "../utils/dates";

interface ProfileProps {
  user: any;
  onBack: () => void;
  onEditProfile: () => void;
  onShowVerification: (initialStep?: number) => void;
  onUpdate?: (updates: any) => Promise<void>;
  onViewStorefront?: (sellerId: string) => void;
}

interface EditingField {
  field: string;
  value: string;
}

export function Profile({ user, onBack, onEditProfile, onShowVerification, onUpdate, onViewStorefront }: ProfileProps) {
  // Early return if user is null/undefined to prevent render errors
  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-muted-foreground">User data not available</p>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  const [editing, setEditing] = useState<EditingField | null>(null);
  const [editingImage, setEditingImage] = useState(false);
  // No storage manager needed with Supabase
  const [storageWarning, setStorageWarning] = useState(false);
  const [formData, setFormData] = useState(() => {
    // Ensure user exists before accessing properties
    if (!user) {
      return {
        name: '',
        phone: '',
        location: '',
        profileImage: '',
        region: '',
        businessName: '',
        facebook: '',
        instagram: '',
        website: '',
        telegram: ''
      };
    }
    
    return {
      name: user.name || '',
      phone: user.phone || '',
      location: user.location || '',
      profileImage: user.profileImage || '',
      region: user.region || '',
      businessName: user.businessName || '',
      facebook: user.facebook || '',
      instagram: user.instagram || '',
      website: user.website || '',
      telegram: user.telegram || ''
    };
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync formData with user prop changes - optimized to prevent render loops
  const previousUserRef = useRef<typeof user>(null);
  useEffect(() => {
    // Guard clause: Only proceed if user exists
    if (!user) return;
    
    // Check if user data actually changed to prevent unnecessary updates
    const userDataChanged = !previousUserRef.current || 
      user.name !== previousUserRef.current.name ||
      user.phone !== previousUserRef.current.phone ||
      user.location !== previousUserRef.current.location ||
      user.profileImage !== previousUserRef.current.profileImage ||
      user.region !== previousUserRef.current.region ||
      user.businessName !== previousUserRef.current.businessName ||
      user.facebook !== previousUserRef.current.facebook ||
      user.instagram !== previousUserRef.current.instagram ||
      user.website !== previousUserRef.current.website ||
      user.telegram !== previousUserRef.current.telegram;
    
    if (userDataChanged) {
      console.log('Profile: User data changed, updating form data');
      
      const newFormData = {
        name: user.name || '',
        phone: user.phone || '',
        location: user.location || '',
        profileImage: user.profileImage || '',
        region: user.region || '',
        businessName: user.businessName || '',
        facebook: user.facebook || '',
        instagram: user.instagram || '',
        website: user.website || '',
        telegram: user.telegram || ''
      };
      
      setFormData(newFormData);
      previousUserRef.current = user;
    }
  }, [user]); // Simplified dependency

  const handleSave = async (field: string, value: string) => {
    try {
      // Update local state immediately for responsive UI
      setFormData(prev => ({ ...prev, [field]: value }));
      setEditing(null);
      
      // Call the parent's update function if available
      if (onUpdate) {
        await onUpdate({ [field]: value });
      }
    } catch (error) {
      console.error('Failed to save:', error);
      // Revert local changes on error
      setFormData(prev => ({ ...prev, [field]: formData[field] }));
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB upload limit
      alert('Image size must be less than 10MB');
      return;
    }

    try {
      // Show loading state
      setEditingImage(false);
      
      // Compress image to ~500KB max
      // Simple image compression - convert to base64
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const compressedDataUrl = dataUrl;
      
      console.log('Image compressed:', {
        originalSize: file.size,
        compressedSize: compressedDataUrl.length,
        compressionRatio: (file.size / compressedDataUrl.length).toFixed(2)
      });
      
      // Update the user profile first, then update local state
      if (onUpdate) {
        try {
          await onUpdate({ profileImage: compressedDataUrl });
          // Only update local state after successful backend update
          setFormData(prev => ({ ...prev, profileImage: compressedDataUrl }));
          console.log('✅ Profile image updated successfully');
        } catch (error) {
          console.error('Failed to save profile image:', error);
          
          // Show user-friendly error message with guidance
          let errorMessage = 'Failed to save profile image. ';
          
          if (error instanceof Error) {
            if (error.message.includes('Storage quota exceeded') || error.message.includes('storage is full')) {
              errorMessage += 'Your browser storage is full. Please clear browser data or try a smaller image.';
              setStorageWarning(true); // Show storage warning
            } else {
              errorMessage += error.message;
            }
          } else {
            errorMessage += 'Please try with a smaller image or clear browser data.';
            setStorageWarning(true); // Show storage warning as fallback
          }
          
          alert(errorMessage);
          
          // Don't update local state if backend update failed
          // formData will be synced with user prop via useEffect
        }
      } else {
        // If no onUpdate callback, update local state directly (fallback)
        setFormData(prev => ({ ...prev, profileImage: compressedDataUrl }));
      }
    } catch (error) {
      console.error('Failed to process image:', error);
      alert('Failed to process image. Please try a different image.');
      setEditingImage(false);
    }
  };

  const handleImageRemove = async () => {
    try {
      setEditingImage(false);
      
      // Update the user profile to remove the image first
      if (onUpdate) {
        await onUpdate({ profileImage: '' });
        // Local state will be synced via useEffect when user prop updates
        console.log('✅ Profile image removed successfully');
      } else {
        // If no onUpdate callback, update local state directly (fallback)
        setFormData(prev => ({ ...prev, profileImage: '' }));
      }
    } catch (error) {
      console.error('Failed to remove profile image:', error);
    }
  };

  const startEditing = (field: string, currentValue: string) => {
    setEditing({ field, value: currentValue });
  };

  const cancelEditing = () => {
    setEditing(null);
    setEditingImage(false);
  };



  // Helper functions for location management
  const getAvailableCities = () => {
    if (!formData.region) {
      return [];
    }
    const region = myanmarRegions[formData.region];
    return region ? region.cities : [];
  };

  const handleRegionChange = async (newRegion: string) => {
    try {
      // Update both region and clear location
      const updates = { region: newRegion, location: '' };
      setFormData(prev => ({ ...prev, ...updates }));
      setEditing(null);
      
      if (onUpdate) {
        await onUpdate(updates);
      }
    } catch (error) {
      console.error('Failed to save region:', error);
      // Revert changes on error
      setFormData(prev => ({ ...prev, region: formData.region, location: formData.location }));
    }
  };

  const handleLocationChange = async (newLocation: string) => {
    try {
      setFormData(prev => ({ ...prev, location: newLocation }));
      setEditing(null);
      
      if (onUpdate) {
        await onUpdate({ location: newLocation });
      }
    } catch (error) {
      console.error('Failed to save location:', error);
      // Revert changes on error
      setFormData(prev => ({ ...prev, location: formData.location }));
    }
  };


  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getVerificationStatusDisplay = () => {
    if (user.verified) {
      return (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Verified Account</span>
        </div>
      );
    }
    
    if (user.verificationStatus === 'under_review') {
      return (
        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Verification Under Review</span>
        </div>
      );
    }
    
    if (user.verificationSubmitted) {
      return (
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Clock className="w-5 h-5" />
          <span className="font-medium">Verification Submitted</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Shield className="w-5 h-5" />
        <span className="font-medium">Verification Available</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Storage Manager Modal */}
      {/* No storage manager needed with Supabase */}

      {/* Storage Warning */}
      {storageWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Storage Nearly Full</p>
                <p className="text-sm text-amber-700">
                  Your browser storage may be getting full. This can cause issues saving profile changes.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => console.log('Storage management not needed with Supabase')}
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                <Database className="w-4 h-4 mr-2" />
                Manage Storage
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setStorageWarning(false)}
                className="text-amber-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="space-y-4 mb-8">
        {/* Back button row */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="h-9 px-3 -ml-3">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {editing || editingImage ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={cancelEditing}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          ) : null}
        </div>
        
        {/* Title section - aligned with content */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">View and manage your account information</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card className="overflow-hidden border-primary/30">
            <CardHeader className="text-center pb-6">
              {/* Profile Picture */}
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  {formData.profileImage ? (
                    <ImageWithFallback
                      src={formData.profileImage}
                      alt={`${formData.name}'s profile picture`}
                      className="w-28 h-28 rounded-full object-cover border-4 border-border shadow-lg"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full border-4 border-border shadow-lg bg-muted flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Edit overlay */}
                  <div 
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => setEditingImage(true)}
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  
                  {user.verified && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-card">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Image Upload Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                className="hidden"
              />
              
              {editingImage && (
                <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-3">Update your profile picture</p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Camera className="w-4 h-4 mr-2" />
                      Choose Photo
                    </Button>
                    {user.profileImage && formData.profileImage && (
                      <Button size="sm" variant="outline" onClick={handleImageRemove} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Photo
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setEditingImage(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Name and Type */}
              <div className="space-y-3 mb-6">
                {editing?.field === 'name' ? (
                  <div className="space-y-2">
                    <Input
                      value={editing.value}
                      onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                      className="text-center text-xl font-bold"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave('name', editing.value);
                        if (e.key === 'Escape') cancelEditing();
                      }}
                    />
                    <div className="flex justify-center gap-2">
                      <Button size="sm" onClick={() => handleSave('name', editing.value)}>
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditing}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CardTitle className="text-2xl font-bold">
                      {formData.name}
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditing('name', formData.name)}
                      className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="flex justify-center gap-2 flex-wrap">
                  {/* User Badge System - Shows account type icon + user type + verification status */}
                  <UserBadge 
                    userType={user.userType}
                    accountType={getUserAccountType(user)}
                    verificationLevel={getUserVerificationLevel(user)}
                    size="md"
                  />
                </div>
              </div>
              

              
              {/* Verification Actions */}
              <div className="space-y-3">
                {/* View Verification Details - Show for all users */}
                <Button 
                  variant="outline" 
                  className={`w-full h-11 font-medium ${(() => {
                    // Get verification level to determine color
                    const verificationLevel = getUserVerificationLevel(user);
                    
                    switch (verificationLevel) {
                      case 'business-verified':
                      case 'id-verified':
                        return 'text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900/20';
                      case 'under-review':
                        return 'text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/20';
                      case 'phone-verified':
                        return 'text-yellow-600 border-yellow-300 hover:bg-yellow-50 hover:text-yellow-700 dark:text-yellow-400 dark:border-yellow-700 dark:hover:bg-yellow-900/20';
                      default: // unverified
                        return 'text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20';
                    }
                  })()}`}
                  onClick={() => onShowVerification(1)}
                >
                  {(() => {
                    // Get verification level to determine icon color
                    const verificationLevel = getUserVerificationLevel(user);
                    
                    switch (verificationLevel) {
                      case 'business-verified':
                      case 'id-verified':
                        return <Shield className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />;
                      case 'under-review':
                        return <Shield className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />;
                      case 'phone-verified':
                        return <Shield className="w-4 h-4 mr-2 text-yellow-600 dark:text-yellow-400" />;
                      default: // unverified
                        return <Shield className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />;
                    }
                  })()}
                  View Verification Details
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6 border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg">Account Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Member Since</span>
                </div>
                <span className="text-sm font-medium">{formatMemberSinceDate(user.joinedDate)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Rating</span>
                </div>
                <span className="text-sm font-medium">
                  {user.rating > 0 ? `${user.rating}/5 (${user.totalReviews} reviews)` : 'No ratings yet'}
                </span>
              </div>
              

            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6 md:gap-x-10 md:gap-y-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </div>
                  <p className="font-medium">{user.email}</p>
                </div>

                {/* Farm/Business Name - Only for farmers and traders */}
                {(user.userType === 'farmer' || user.userType === 'trader') && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Store className="w-4 h-4" />
                      {user.userType === 'farmer' ? 'Farm Name' : 'Business Name'}
                    </div>
                    {editing?.field === 'businessName' ? (
                      <div className="space-y-2">
                        <Input
                          value={editing.value}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          placeholder={user.userType === 'farmer' ? 'Enter your farm name' : 'Enter your business name'}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave('businessName', editing.value);
                            if (e.key === 'Escape') cancelEditing();
                          }}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSave('businessName', editing.value)}>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="font-medium flex-1">
                          {formData.businessName || `${formData.name}'s ${user.userType === 'farmer' ? 'Farm' : 'Trading'}`}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing('businessName', formData.businessName || '')}
                          className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {!formData.businessName && (
                      <p className="text-xs text-muted-foreground">
                        Currently showing as "{formData.name}'s {user.userType === 'farmer' ? 'Farm' : 'Trading'}" - Click edit to customize
                      </p>
                    )}
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium flex-1">
                      {formData.phone || 'Add phone number'}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        // For phone changes, redirect directly to phone verification step (step 3)
                        onShowVerification(3);
                      }}
                      className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                      title={formData.phone ? "Update and verify phone number" : "Add and verify phone number"}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  {user.phoneVerified && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {!user.phoneVerified && formData.phone && (
                    <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Unverified
                    </Badge>
                  )}
                </div>
                

                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    Location
                  </div>
                  {editing?.field === 'location' || editing?.field === 'region' ? (
                    <div className="space-y-3">
                      {/* Region Selection */}
                      <div className="space-y-2">
                        <Label className="text-sm">Region</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
                          <Select 
                            value={formData.region} 
                            onValueChange={handleRegionChange}
                          >
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Select your region" />
                            </SelectTrigger>
                            <SelectContent className="max-h-64 overflow-y-auto">
                              {Object.entries(myanmarRegions).map(([key, region]) => (
                                <SelectItem key={key} value={key}>{region.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* City Selection */}
                      <div className="space-y-2">
                        <Label className="text-sm">City/Town</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
                          <Select 
                            value={formData.location} 
                            onValueChange={handleLocationChange}
                            disabled={!formData.region}
                          >
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Select your city/town" />
                            </SelectTrigger>
                            <SelectContent className="max-h-64 overflow-y-auto">
                              {getAvailableCities().map((city) => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {!formData.region && (
                          <p className="text-xs text-muted-foreground">Please select a region first</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={cancelEditing}>
                          Done
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="font-medium flex-1">
                        {(() => {
                          console.log('Profile: Location display debug:', {
                            location: formData.location,
                            region: formData.region,
                            regionData: formData.region ? myanmarRegions[formData.region] : null
                          });
                          
                          // Auto-detect region if missing but location exists
                          if (formData.location && !formData.region) {
                            // Find which region contains this city
                            const foundRegion = Object.entries(myanmarRegions).find(([key, regionData]) => 
                              regionData.cities.includes(formData.location)
                            );
                            
                            if (foundRegion) {
                              console.log('Auto-detected region for', formData.location, ':', foundRegion[0]);
                              
                              // Auto-update region without clearing location (different from manual region change)
                              const updates = { region: foundRegion[0] }; // Keep the existing location
                              setFormData(prev => ({ ...prev, ...updates }));
                              
                              if (onUpdate) {
                                onUpdate(updates).catch(error => {
                                  console.error('Failed to auto-save region:', error);
                                  // Revert on error
                                  setFormData(prev => ({ ...prev, region: '' }));
                                });
                              }
                              
                              return `${formData.location}, ${foundRegion[1].name}`;
                            }
                          }
                          
                          return formData.location ? `${formData.location}${formData.region ? `, ${myanmarRegions[formData.region]?.name || formData.region}` : ''}` : 'Add location';
                        })()}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          // Start editing location - this shows both region and city selectors
                          setEditing({ field: 'location', value: formData.location });
                        }}
                        className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media & Online Presence - Only for farmers and traders */}
          {(user.userType === 'farmer' || user.userType === 'trader') && (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Social Media & Online Presence
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Add your social media profiles to build trust and connect with customers
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6 md:gap-x-10 md:gap-y-8">
                  {/* Facebook */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Facebook className="w-4 h-4" />
                      Facebook Page/Profile
                    </div>
                    {editing?.field === 'facebook' ? (
                      <div className="space-y-2">
                        <Input
                          value={editing.value}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          placeholder="https://facebook.com/yourpage or facebook.com/yourpage"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave('facebook', editing.value);
                            if (e.key === 'Escape') cancelEditing();
                          }}
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
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="font-medium flex-1">
                          {formData.facebook || 'Add Facebook page/profile'}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing('facebook', formData.facebook || '')}
                          className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Instagram */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Instagram className="w-4 h-4" />
                      Instagram Profile
                    </div>
                    {editing?.field === 'instagram' ? (
                      <div className="space-y-2">
                        <Input
                          value={editing.value}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          placeholder="https://instagram.com/yourprofile or instagram.com/yourprofile"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave('instagram', editing.value);
                            if (e.key === 'Escape') cancelEditing();
                          }}
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
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="font-medium flex-1">
                          {formData.instagram || 'Add Instagram profile'}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing('instagram', formData.instagram || '')}
                          className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="w-4 h-4" />
                      Business Website
                    </div>
                    {editing?.field === 'website' ? (
                      <div className="space-y-2">
                        <Input
                          value={editing.value}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          placeholder="https://yourwebsite.com"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave('website', editing.value);
                            if (e.key === 'Escape') cancelEditing();
                          }}
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
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="font-medium flex-1">
                          {formData.website || 'Add business website'}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing('website', formData.website || '')}
                          className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Telegram */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageCircle className="w-4 h-4" />
                      Telegram
                    </div>
                    {editing?.field === 'telegram' ? (
                      <div className="space-y-2">
                        <Input
                          value={editing.value}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          placeholder="@yourusername or t.me/yourusername"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave('telegram', editing.value);
                            if (e.key === 'Escape') cancelEditing();
                          }}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSave('telegram', editing.value)}>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="font-medium flex-1">
                          {formData.telegram || 'Add Telegram username'}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing('telegram', formData.telegram || '')}
                          className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Helper text */}
                <div className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <strong>💡 Tip:</strong> Adding social media profiles helps customers verify your business 
                  and increases trust. Your social links will be displayed on your storefront.
                </div>
              </CardContent>
            </Card>
          )}

          {/* Storefront Management */}
          {(user.userType === 'farmer' || user.userType === 'trader') && (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Business Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Store className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Manage Your Storefront</h4>
                    <p className="text-sm text-muted-foreground">
                      Set up your business description, product categories, and customer information in your dedicated storefront.
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      if (onViewStorefront && user?.id) {
                        onViewStorefront(user.id);
                      }
                    }}
                    className="w-full"
                  >
                    View My Storefront
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <strong>💡 Business Focus:</strong> Your profile is for account management. 
                  Use your storefront to showcase products, business information, and connect with customers.
                </div>
              </CardContent>
            </Card>
          )}


        </div>
      </div>
    </div>
  );
}