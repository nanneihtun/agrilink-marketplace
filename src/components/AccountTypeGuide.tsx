import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Leaf, Building2, ShoppingCart, Shield, ArrowLeft } from 'lucide-react';

interface AccountTypeGuideProps {
  selectedType?: string;
  onTypeSelect?: (type: string) => void;
  onBack?: () => void;
  userType?: string;
}

export function AccountTypeGuide({ selectedType, onTypeSelect, onBack, userType }: AccountTypeGuideProps) {
  const accountTypes = [
    {
      id: 'farmer',
      name: 'Farmer',
      icon: Leaf,
      description: 'Sell your agricultural products directly to buyers',
      features: ['List products', 'Direct sales', 'Price setting', 'Customer management'],
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'trader',
      name: 'Trader',
      icon: Building2,
      description: 'Distribute agricultural products to retailers and businesses',
      features: ['Bulk trading', 'Supply chain', 'Wholesale pricing', 'Business partnerships'],
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'buyer',
      name: 'Buyer',
      icon: ShoppingCart,
      description: 'Purchase agricultural products for your business or personal use',
      features: ['Browse products', 'Price comparison', 'Direct contact', 'Order tracking'],
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="space-y-4">
      {onBack && (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      )}
      
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Choose Your Account Type</h3>
        <p className="text-sm text-muted-foreground">
          Select the type that best describes your role in the agricultural marketplace
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accountTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          
          return (
            <Card 
              key={type.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? `${type.borderColor} border-2 shadow-md` 
                  : 'border hover:border-gray-300'
              }`}
              onClick={() => onTypeSelect?.(type.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${type.bgColor}`}>
                    <Icon className={`w-5 h-5 ${type.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{type.name}</CardTitle>
                    {isSelected && (
                      <Badge variant="secondary" className="mt-1">
                        Selected
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3">
                  {type.description}
                </p>
                <div className="space-y-1">
                  {type.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Shield className="w-3 h-3" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-muted/50 rounded-lg p-4 text-center">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> You can change your account type later in your profile settings.
          Different account types have different features and capabilities.
        </p>
      </div>
    </div>
  );
}
