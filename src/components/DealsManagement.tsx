import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  DollarSign, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Star,
  MessageSquare,
  MapPin,
  User,
  Calendar
} from 'lucide-react';

interface Deal {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  offerPrice: number;
  originalPrice: number;
  quantity: string;
  message: string;
  deliveryAddress: string;
  paymentMethod: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'completed' | 'cancelled';
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  chatId?: string;
}

interface DealsManagementProps {
  currentUserId: string;
  currentUserName: string;
  currentUserType: 'buyer' | 'seller' | 'farmer' | 'trader' | 'admin';
  onBack: () => void;
}

export function DealsManagement({ 
  currentUserId, 
  currentUserName, 
  currentUserType, 
  onBack 
}: DealsManagementProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Mock data for demonstration
  useEffect(() => {
    const mockDeals: Deal[] = [
      {
        id: '1',
        productId: '1',
        productName: 'Premium Jasmine Rice - 50kg',
        productImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop',
        buyerId: 'buyer1',
        buyerName: 'Ma Phyu Phyu',
        sellerId: 'seller1',
        sellerName: 'Ko Thura Min',
        offerPrice: 42000,
        originalPrice: 45000,
        quantity: '10 bags',
        message: 'Interested in bulk purchase. Can we discuss delivery?',
        deliveryAddress: '123 Main Street, Yangon',
        paymentMethod: 'cash',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        chatId: 'chat1'
      },
      {
        id: '2',
        productId: '2',
        productName: 'Fresh Tomatoes - 25kg',
        productImage: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=100&h=100&fit=crop',
        buyerId: 'buyer2',
        buyerName: 'U Aung Min',
        sellerId: 'seller2',
        sellerName: 'Ma Su Hlaing',
        offerPrice: 17000,
        originalPrice: 18000,
        quantity: '5 crates',
        message: 'Looking for fresh tomatoes for my restaurant.',
        deliveryAddress: '456 Business District, Mandalay',
        paymentMethod: 'bank_transfer',
        status: 'accepted',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        acceptedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        chatId: 'chat2'
      },
      {
        id: '3',
        productId: '3',
        productName: 'Premium Turmeric Powder - 10kg',
        productImage: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100&h=100&fit=crop',
        buyerId: 'buyer3',
        buyerName: 'Daw Hla Hla',
        sellerId: 'seller3',
        sellerName: 'Ko Kyaw Zin',
        offerPrice: 24000,
        originalPrice: 25000,
        quantity: '3 sacks',
        message: 'Need for export. Can you provide quality certificate?',
        deliveryAddress: '789 Export Zone, Yangon',
        paymentMethod: 'advance',
        status: 'completed',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        acceptedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        chatId: 'chat3'
      }
    ];

    // Filter deals based on user type
    const userDeals = mockDeals.filter(deal => 
      deal.buyerId === currentUserId || deal.sellerId === currentUserId
    );

    setDeals(userDeals);
    setLoading(false);
  }, [currentUserId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredDeals = deals.filter(deal => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return deal.status === 'pending';
    if (activeTab === 'accepted') return deal.status === 'accepted';
    if (activeTab === 'completed') return deal.status === 'completed';
    return true;
  });

  const isSeller = (deal: Deal) => deal.sellerId === currentUserId;

  const handleAcceptDeal = (dealId: string) => {
    setDeals(prev => prev.map(deal => 
      deal.id === dealId 
        ? { ...deal, status: 'accepted' as const, acceptedAt: new Date().toISOString() }
        : deal
    ));
  };

  const handleRejectDeal = (dealId: string) => {
    setDeals(prev => prev.map(deal => 
      deal.id === dealId 
        ? { ...deal, status: 'rejected' as const }
        : deal
    ));
  };

  const handleCompleteDeal = (dealId: string) => {
    setDeals(prev => prev.map(deal => 
      deal.id === dealId 
        ? { ...deal, status: 'completed' as const, completedAt: new Date().toISOString() }
        : deal
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Deals Management</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deals Management</h1>
          <p className="text-muted-foreground">
            Manage your offers, negotiations, and completed transactions
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{deals.filter(d => d.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold">{deals.filter(d => d.status === 'accepted').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{deals.filter(d => d.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  {deals
                    .filter(d => d.status === 'completed')
                    .reduce((sum, deal) => sum + (deal.offerPrice * parseFloat(deal.quantity) || 0), 0)
                    .toLocaleString()} MMK
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deals List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Deals</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredDeals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No deals found</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'all' 
                    ? "You don't have any deals yet. Start by making an offer on a product!"
                    : `No ${activeTab} deals found.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredDeals.map((deal) => (
              <Card key={deal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Product Info */}
                    <div className="flex gap-4">
                      <img
                        src={deal.productImage}
                        alt={deal.productName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{deal.productName}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {isSeller(deal) ? deal.buyerName : deal.sellerName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(deal.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Deal Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Offer Price:</span>
                        <div className="text-right">
                          <div className="font-bold text-lg">{deal.offerPrice.toLocaleString()} MMK</div>
                          {deal.offerPrice !== deal.originalPrice && (
                            <div className="text-xs text-muted-foreground">
                              Original: {deal.originalPrice.toLocaleString()} MMK
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Quantity:</span>
                        <span className="font-medium">{deal.quantity}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Amount:</span>
                        <span className="font-bold text-primary text-lg">
                          {(deal.offerPrice * parseFloat(deal.quantity) || 0).toLocaleString()} MMK
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Payment:</span>
                        <span className="text-sm">
                          {deal.paymentMethod === 'cash' ? 'Cash on Delivery' :
                           deal.paymentMethod === 'bank_transfer' ? 'Bank Transfer' :
                           deal.paymentMethod === 'mobile_payment' ? 'Mobile Payment' :
                           deal.paymentMethod === 'advance' ? '50% Advance, 50% on Delivery' :
                           deal.paymentMethod}
                        </span>
                      </div>

                      {deal.deliveryAddress && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <span className="text-sm text-muted-foreground">Delivery Address:</span>
                            <p className="text-sm">{deal.deliveryAddress}</p>
                          </div>
                        </div>
                      )}

                      {deal.message && (
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <span className="text-sm text-muted-foreground">Message:</span>
                            <p className="text-sm">{deal.message}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col items-end space-y-3">
                      <Badge className={getStatusColor(deal.status)}>
                        {getStatusIcon(deal.status)}
                        <span className="ml-1 capitalize">{deal.status}</span>
                      </Badge>

                      {deal.status === 'pending' && isSeller(deal) && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptDeal(deal.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectDeal(deal.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {deal.status === 'accepted' && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteDeal(deal.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Completed
                        </Button>
                      )}

                      {deal.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Star className="w-4 h-4 mr-1" />
                          Leave Review
                        </Button>
                      )}

                      {deal.chatId && (
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          View Chat
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}