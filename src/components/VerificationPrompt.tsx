import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { 
  Shield, 
  CheckCircle, 
  MessageSquare, 
  Phone, 
  Store, 
  Package,
  X,
  ArrowRight
} from "lucide-react";

interface VerificationPromptProps {
  onClose: () => void;
  onStartVerification: () => void;
  feature: 'chat' | 'contact' | 'listing' | 'storefront';
  sellerName?: string;
  userType?: string;
}

export function VerificationPrompt({ onClose, onStartVerification, feature, sellerName, userType }: VerificationPromptProps) {
  const getFeatureInfo = () => {
    switch (feature) {
      case 'chat':
        return {
          icon: <MessageSquare className="w-6 h-6" />,
          title: userType === 'buyer' ? 'Quick Phone Verification Required' : 'Direct Messaging Requires Verification',
          description: userType === 'buyer' 
            ? `To start chatting with ${sellerName || 'sellers'}, you just need to verify your phone number.`
            : `To start a conversation with ${sellerName || 'sellers'}, you need to complete account verification.`,
          benefits: userType === 'buyer' 
            ? [
                'Instant access to chat with sellers',
                'View seller contact information',
                'Secure communication',
                'No complex verification required'
              ]
            : [
                'Direct communication with verified sellers',
                'Protected messaging environment',
                'Priority seller responses',
                'Access to exclusive deals and bulk pricing'
              ]
        };
      case 'contact':
        return {
          icon: <Phone className="w-6 h-6" />,
          title: userType === 'buyer' ? 'Phone Verification Required' : 'Contact Information Requires Verification',
          description: userType === 'buyer'
            ? 'Just verify your phone number to access seller contact information.'
            : 'Phone numbers and direct contact details are only available to verified users.',
          benefits: userType === 'buyer'
            ? [
                'Access to seller phone numbers',
                'Direct contact capabilities',
                'Faster communication',
                'Simple one-step verification'
              ]
            : [
                'Access to seller phone numbers',
                'Direct contact capabilities',
                'Faster communication channels',
                'Building trusted business relationships'
              ]
        };
      case 'listing':
        return {
          icon: <Package className="w-6 h-6" />,
          title: 'Product Listing Requires Verification',
          description: userType === 'farmer' 
            ? 'Farmers need verification to create product listings and ensure marketplace quality.'
            : 'Sellers need verification to create product listings and ensure marketplace quality.',
          benefits: [
            'List unlimited products',
            'Full storefront customization',
            'Advanced listing management',
            'Higher visibility in search results'
          ]
        };
      case 'storefront':
        return {
          icon: <Store className="w-6 h-6" />,
          title: 'Storefront Management Requires Verification',
          description: 'Professional storefront features are available only to verified sellers.',
          benefits: [
            'Custom storefront design',
            'Business analytics dashboard',
            'Advanced inventory management',
            'Professional seller badge'
          ]
        };
      default:
        return {
          icon: <Shield className="w-6 h-6" />,
          title: 'Feature Requires Verification',
          description: 'This feature is only available to verified users.',
          benefits: ['Enhanced platform access', 'Trusted user status']
        };
    }
  };

  const featureInfo = getFeatureInfo();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-3 pr-8">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              {featureInfo.icon}
            </div>
            <div>
              <CardTitle className="text-lg">{featureInfo.title}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {featureInfo.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Why verification?</strong> We require verification to build trust, prevent spam, 
              and ensure quality interactions between all users in the AgriLink marketplace.
            </AlertDescription>
          </Alert>

          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              Verification Benefits
            </h4>
            <ul className="space-y-2">
              {featureInfo.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {(feature === 'listing' || feature === 'storefront') && (
            <div>
              <h4 className="font-medium mb-3">
                {userType === 'buyer' ? 'Simple Verification' : 'Verification Process'}
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">1</Badge>
                  <span className="text-muted-foreground">
                    Phone verification ({userType === 'buyer' ? '1 minute' : '2 minutes'})
                  </span>
                </div>
                {userType !== 'buyer' && (
                  <>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">2</Badge>
                      <span className="text-muted-foreground">Upload ID document (5 minutes)</span>
                    </div>
                    {(userType === 'farmer' || userType === 'trader') && (
                      <div className="flex items-center gap-3 text-sm">
                        <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">3</Badge>
                        <span className="text-muted-foreground">Complete business details (3 minutes)</span>
                      </div>
                    )}
                  </>
                )}
                {userType === 'buyer' && (
                  <div className="text-sm text-muted-foreground">
                    That's it! Just one step for buyers.
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Maybe Later
            </Button>
            <Button onClick={onStartVerification} className="flex-1">
              {userType === 'buyer' ? 'Verify Phone' : 'Start Verification'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}