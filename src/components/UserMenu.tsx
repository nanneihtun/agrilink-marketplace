import { useState } from "react";
import { formatMemberSinceDate } from "../utils/dates";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { UserBadge, getUserVerificationLevel, getUserAccountType } from "./UserBadgeSystem";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { 
  User, 
  Settings, 
  LogOut, 
  Store, 
  Package, 
  MessageSquare, 
  Bell,
  Shield,
  MapPin,
  Phone,
  Award,
  BarChart3,
  AlertCircle,
  HelpCircle
} from "lucide-react";

interface UserMenuProps {
  user: any;
  onLogout: () => void;
  onViewStorefront?: (sellerId: string) => void;
  onUpdateUser?: (updates: any) => void;
  onGoToDashboard?: () => void;
  onShowVerification?: () => void;
  onEditProfile?: () => void;
  onViewProfile?: () => void;
  onViewMessages?: () => void;
  onShowAdminVerification?: () => void;
}

export function UserMenu({ user, onLogout, onViewStorefront, onUpdateUser, onGoToDashboard, onShowVerification, onEditProfile, onViewProfile, onViewMessages, onShowAdminVerification }: UserMenuProps) {
  const [showProfile, setShowProfile] = useState(false);



  const getVerificationStatus = (user: any) => {
    // Admins are always verified by default
    if (user.userType === 'admin') {
      return {
        status: 'verified',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/20'
      };
    }

    // For buyers, only phone verification is needed
    if (user.userType === 'buyer') {
      if (user.phoneVerified) {
        return {
          status: 'verified',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200'
        };
      } else {
        return {
          status: 'not-started',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200'
        };
      }
    }

    // For farmers/traders, use full verification logic
    const isPhoneVerified = user.phoneVerified;
    const hasDocuments = user.verificationDocuments?.idCard === 'uploaded' || user.verificationDocuments?.idCard === 'approved';
    const hasBusinessDetails = user.businessDetailsCompleted;

    if (user.verified) {
      return {
        status: 'verified',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200'
      };
    } else if (isPhoneVerified && hasDocuments && hasBusinessDetails) {
      return {
        status: 'under-review',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/20'
      };
    } else if (user.verificationSubmitted || user.verificationStatus === 'under_review') {
      return {
        status: 'under-review',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/20'
      };
    } else {
      return {
        status: 'not-started',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-200'
      };
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

  if (showProfile) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-card rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">My Profile</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowProfile(false)}>
              ×
            </Button>
          </div>

          <div className="space-y-6">
            {/* Profile Header */}
            <div className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                {user.profileImage || user.avatar ? (
                  <ImageWithFallback 
                    src={user.profileImage || user.avatar} 
                    alt={`${user.name}'s profile`}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <AvatarFallback className="text-lg">
                    {getInitials(user.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <h3 className="text-lg font-medium">{user.name}</h3>
              <UserBadge 
                userType={user.userType}
                accountType={getUserAccountType(user)}
                verificationLevel={getUserVerificationLevel(user)}
                size="sm"
              />
              {/* Verification Status */}
              <div className="mt-2">
                {/* For buyers, show phone verification status */}
                {user.userType === 'buyer' && user.phoneVerified && (
                  <div className="flex items-center justify-center gap-1 text-sm text-green-600">
                    <Shield className="w-4 h-4" />
                    Phone Verified
                  </div>
                )}
                
                {user.userType === 'buyer' && !user.phoneVerified && (
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    Phone Verification Under Review
                  </div>
                )}
                
                {/* For admins, show admin status */}
                {user.userType === 'admin' && (
                  <div className="flex items-center justify-center gap-1 text-sm text-primary">
                    <Shield className="w-4 h-4" />
                    Platform Administrator
                  </div>
                )}

                {/* For farmers/traders, show full verification status */}
                {(user.userType === 'farmer' || user.userType === 'trader') && user.verified && (
                  <div className="flex items-center justify-center gap-1 text-sm text-green-600">
                    <Shield className="w-4 h-4" />
                    Verified Account
                  </div>
                )}
                
                {user.userType !== 'buyer' && user.verificationStatus === 'under_review' && (
                  <div className="flex items-center justify-center gap-1 text-sm text-primary">
                    <AlertCircle className="w-4 h-4" />
                    Verification Under Review
                  </div>
                )}
                
                {user.userType !== 'buyer' && user.verificationStatus === 'pending' && !user.verificationSubmitted && (
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    Verification Under Review
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Contact Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{user.phone}</span>
                </div>
              </div>
            </div>

            {/* Business Information */}
            {user.businessName && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Business Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Business Name:</span>
                    <div className="text-muted-foreground">{user.businessName}</div>
                  </div>
                  {user.businessDescription && (
                    <div>
                      <span className="font-medium">Description:</span>
                      <div className="text-muted-foreground">{user.businessDescription}</div>
                    </div>
                  )}
                  {user.experience && (
                    <div>
                      <span className="font-medium">Experience:</span>
                      <div className="text-muted-foreground">{user.experience}</div>
                    </div>
                  )}
                  {user.specialization && (
                    <div>
                      <span className="font-medium">Specialization:</span>
                      <div className="text-muted-foreground capitalize">{user.specialization}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Account Stats */}
            <div className="space-y-3">
              <h4 className="font-medium">Account Stats</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="font-medium">Member Since</div>
                  <div className="text-muted-foreground">{formatMemberSinceDate(user.joinedDate)}</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="font-medium">Rating</div>
                  <div className="text-muted-foreground">
                    {user.rating > 0 ? `${user.rating}/5` : 'No ratings yet'}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {(user.userType === 'farmer' || user.userType === 'trader') && onGoToDashboard && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    setShowProfile(false);
                    onGoToDashboard();
                  }}
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </Button>
              )}
              
              {user.userType === 'admin' && onGoToDashboard && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    setShowProfile(false);
                    onGoToDashboard();
                  }}
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </Button>
              )}
              
              {user.userType === 'admin' && onShowAdminVerification && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    setShowProfile(false);
                    onShowAdminVerification();
                  }}
                >
                  <Award className="w-4 h-4" />
                  Verification Requests
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => {
                  setShowProfile(false);
                  onViewMessages?.();
                }}
              >
                <MessageSquare className="w-4 h-4" />
                Messages
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => {
                  setShowProfile(false);
                  onShowVerification?.();
                }}
              >
                <Shield className={`w-4 h-4 ${getVerificationStatus(user).color}`} />
                {user.userType === 'buyer' 
                  ? (user.verified || user.phoneVerified ? 'Verification Status' : 'Get Verified')
                  : (user.verified ? 'Verification Status' : 
                     user.verificationStatus === 'under_review' ? 'Verification' :
                     user.verificationSubmitted ? 'Verification Status' : 'Get Verified')
                }
                
                {getVerificationStatus(user).status === 'under-review' && (
                  <Badge variant="secondary" className={`ml-auto text-xs ${getVerificationStatus(user).bgColor} ${getVerificationStatus(user).color} ${getVerificationStatus(user).borderColor}`}>
                    {user.verificationStatus === 'under_review' || user.verificationSubmitted ? 'Under Review' : 'Reviewing'}
                  </Badge>
                )}
                {getVerificationStatus(user).status === 'verified' && (
                  <Badge variant="secondary" className={`ml-auto text-xs ${getVerificationStatus(user).bgColor} ${getVerificationStatus(user).color} ${getVerificationStatus(user).borderColor}`}>
                    Verified
                  </Badge>
                )}
                {getVerificationStatus(user).status === 'not-started' && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Available
                  </Badge>
                )}
              </Button>
              

              <Button variant="outline" className="w-full justify-start gap-2">
                <Bell className="w-4 h-4" />
                Notification Settings
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                onClick={() => {
                  setShowProfile(false);
                  onLogout();
                }}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger 
          className="relative h-9 w-9 md:h-10 md:w-10 rounded-full hover:bg-accent/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <Avatar className="h-9 w-9 md:h-10 md:w-10">
            {user.profileImage || user.avatar ? (
              <ImageWithFallback 
                src={user.profileImage || user.avatar} 
                alt={`${user.name}'s profile`}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <AvatarFallback className="text-sm">
                {getInitials(user.name)}
              </AvatarFallback>
            )}
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onViewProfile}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          {(user.userType === 'farmer' || user.userType === 'trader') && onGoToDashboard && (
            <DropdownMenuItem onClick={onGoToDashboard}>
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
          )}
          {user.userType === 'admin' && onGoToDashboard && (
            <DropdownMenuItem onClick={onGoToDashboard}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin Panel</span>
            </DropdownMenuItem>
          )}
          {user.userType === 'admin' && onShowAdminVerification && (
            <DropdownMenuItem onClick={onShowAdminVerification}>
              <Award className="mr-2 h-4 w-4" />
              <span>Verification Requests</span>
            </DropdownMenuItem>
          )}
          {(user.userType === 'farmer' || user.userType === 'trader') && (
            <DropdownMenuItem onClick={() => onViewStorefront?.(user.id)}>
              <Store className="mr-2 h-4 w-4" />
              <span>My Storefront</span>
            </DropdownMenuItem>
          )}


          <DropdownMenuItem onClick={onViewMessages}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Messages</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onShowVerification?.()}>
            <Shield className={`mr-2 h-4 w-4 ${getVerificationStatus(user).color}`} />
            <span>
              {user.userType === 'buyer' 
                ? (user.phoneVerified ? 'Phone Verified' : 'Verify Phone')
                : (user.verified ? 'Verification Status' : 
                   user.verificationStatus === 'under_review' ? 'Verification' :
                   user.verificationSubmitted ? 'Verification Status' : 'Get Verified')
              }
            </span>
            {getVerificationStatus(user).status === 'under-review' && (
              <div className="ml-auto w-2 h-2 rounded-full bg-primary" title="Under Review">
              </div>
            )}
            {getVerificationStatus(user).status === 'verified' && (
              <div className="ml-auto w-2 h-2 rounded-full bg-green-500" title="Verified">
              </div>
            )}
            {getVerificationStatus(user).status === 'not-started' && (
              <div className="ml-auto w-2 h-2 rounded-full bg-yellow-500" title="Verification Available">
              </div>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>




    </div>
  );
}