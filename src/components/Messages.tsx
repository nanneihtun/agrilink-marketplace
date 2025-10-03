import { useState, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { UserBadge, getUserVerificationLevel, getUserAccountType } from "./UserBadgeSystem";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { ChatInterface } from "./ChatInterface";
import { useChat } from "../hooks/useChat";
// Chat demo utilities removed - using Supabase backend only
import { toast } from "sonner";
import { 
  ChevronLeft,
  MessageSquare,
  Search,
  Filter,
  MoreVertical,
  Clock,
  CheckCheck,
  User,
  Package,
  MapPin,
  Star,
  Trash2,
  RefreshCw,
  Database,
  AlertTriangle
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  status: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  otherParty: {
    id: string;
    name: string;
    type: 'farmer' | 'trader' | 'buyer';
    location: string;
    rating: number;
    verified: boolean;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    isOwn: boolean;
  };
  unreadCount: number;
  status: 'active' | 'archived';
}

interface MessagesProps {
  currentUser: any;
  onBack: () => void;
  onStartChat?: (productId: string) => void;
}

// Enhanced storage debugging and cleanup functions
const cleanupStoredData = () => {
  try {
    console.log('🧹 Starting comprehensive chat storage cleanup...');
    
    // Get all localStorage keys
    const allKeys = Object.keys(localStorage);
    let cleanedCount = 0;
    
    // Clean up message storage
    const messageKeys = allKeys.filter(key => key.startsWith('agriconnect-myanmar-messages-'));
    messageKeys.forEach(key => {
      try {
        const messages = JSON.parse(localStorage.getItem(key) || '[]');
        // Keep only valid messages from the last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const validMessages = messages.filter((msg: any) => {
          const messageDate = new Date(msg.createdAt || msg.timestamp);
          return msg.id && msg.content && messageDate > thirtyDaysAgo;
        });
        
        if (validMessages.length !== messages.length) {
          if (validMessages.length === 0) {
            localStorage.removeItem(key);
          } else {
            localStorage.setItem(key, JSON.stringify(validMessages));
          }
          cleanedCount += messages.length - validMessages.length;
        }
      } catch (error) {
        console.warn(`Failed to clean message key ${key}:`, error);
        localStorage.removeItem(key);
        cleanedCount++;
      }
    });
    
    // Clean up conversations
    try {
      const conversations = JSON.parse(localStorage.getItem('agriconnect-myanmar-conversations') || '[]');
      const validConversations = conversations.filter((conv: any) => {
        return conv.id && conv.productId && conv.buyerId && conv.sellerId;
      });
      
      if (validConversations.length !== conversations.length) {
        localStorage.setItem('agriconnect-myanmar-conversations', JSON.stringify(validConversations));
        cleanedCount += conversations.length - validConversations.length;
      }
    } catch (error) {
      console.warn('Failed to clean conversations:', error);
      localStorage.removeItem('agriconnect-myanmar-conversations');
      cleanedCount++;
    }
    
    // Clean up offers
    try {
      const offers = JSON.parse(localStorage.getItem('agriconnect-myanmar-offers') || '[]');
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const validOffers = offers.filter((offer: any) => {
        const offerDate = new Date(offer.createdAt);
        return offer.id && offer.buyerId && offer.sellerId && offer.productId && offerDate > thirtyDaysAgo;
      });
      
      if (validOffers.length !== offers.length) {
        localStorage.setItem('agriconnect-myanmar-offers', JSON.stringify(validOffers));
        cleanedCount += offers.length - validOffers.length;
      }
    } catch (error) {
      console.warn('Failed to clean offers:', error);
      localStorage.removeItem('agriconnect-myanmar-offers');
      cleanedCount++;
    }
    
    console.log(`✅ Chat storage cleanup completed. Removed ${cleanedCount} invalid/old items.`);
    
    if (cleanedCount > 0) {
      toast.success(`Cleaned up ${cleanedCount} old chat items`, {
        description: "Chat storage has been optimized for better performance."
      });
    }
    
    return cleanedCount;
  } catch (error) {
    console.error('❌ Failed to cleanup chat storage:', error);
    toast.error('Failed to cleanup chat storage');
    return 0;
  }
};

// Function to get current user with proper fallback
const getCurrentUser = () => {
  try {
    // First try to get from localStorage current user
    const storedCurrentUser = localStorage.getItem('agriconnect-myanmar-current-user');
    if (storedCurrentUser) {
      const user = JSON.parse(storedCurrentUser);
      if (user && user.id) {
        console.log('✅ Retrieved current user from storage:', user.email);
        return user;
      }
    }
    
    // Fallback: try to restore from session storage
    const sessionUser = sessionStorage.getItem('agriconnect-myanmar-current-user');
    if (sessionUser) {
      const user = JSON.parse(sessionUser);
      if (user && user.id) {
        console.log('⚠️ Restored user from session storage:', user.email);
        // Restore to localStorage
        localStorage.setItem('agriconnect-myanmar-current-user', sessionUser);
        return user;
      }
    }
    
    console.log('❌ No valid current user found in storage');
    return null;
  } catch (error) {
    console.error('❌ Failed to get current user:', error);
    return null;
  }
};

export function Messages({ currentUser, onBack, onStartChat }: MessagesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'active' | 'archived'>('all');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [storageStats, setStorageStats] = useState<any>(null);
  
  // Enhanced user retrieval with fallback
  const effectiveCurrentUser = useMemo(() => {
    if (currentUser) return currentUser;
    
    const fallbackUser = getCurrentUser();
    if (fallbackUser) {
      console.log('🔄 Using fallback current user:', fallbackUser.email);
      return fallbackUser;
    }
    
    console.warn('⚠️ No current user available for Messages component');
    return null;
  }, [currentUser]);
  
  // Use real chat data with the effective current user
  const { conversations, messages, loading, loadConversations, loadMessages, error } = useChat(effectiveCurrentUser?.id);
  
  // Initialize debug logging once
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && effectiveCurrentUser) {
      console.log('✅ Restored user session:', effectiveCurrentUser.email);
    }
  }, []); // Run once only

  // Initialize conversations when component mounts
  useEffect(() => {
    if (effectiveCurrentUser?.id) {
      console.log('🔄 Initializing conversations for user:', effectiveCurrentUser.email);
      loadConversations(effectiveCurrentUser.id);
    } else {
      console.log('⚠️ Cannot initialize conversations - no effective current user');
    }
  }, [effectiveCurrentUser?.id, loadConversations]);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation && effectiveCurrentUser?.id) {
      console.log('🔄 Loading messages for selected conversation:', selectedConversation);
      loadMessages(selectedConversation);
    }
  }, [selectedConversation, effectiveCurrentUser?.id, loadMessages]);

  // Get storage statistics for debugging - simplified
  useEffect(() => {
    if (debugMode) {
      const updateStats = () => {
        try {
          const stats = {
            conversations: localStorage.getItem('agriconnect-myanmar-conversations')?.length || 0,
            messageKeys: Object.keys(localStorage).filter(key => key.startsWith('agriconnect-myanmar-messages-')).length,
            offers: localStorage.getItem('agriconnect-myanmar-offers')?.length || 0,
            totalStorage: JSON.stringify(localStorage).length
          };
          setStorageStats(stats);
        } catch (error) {
          console.error('Failed to get storage stats:', error);
          setStorageStats(null);
        }
      };

      const timeoutId = setTimeout(updateStats, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setStorageStats(null);
    }
  }, [debugMode]); // Only depend on debugMode

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Transform real conversations to match component interface with enhanced debugging
  const transformedConversations = useMemo(() => {
    if (!conversations?.length) {
      console.log('📭 No conversations to transform');
      return [];
    }
    
    // Get stored users and products for additional data
    const users = JSON.parse(localStorage.getItem('agriconnect-myanmar-users') || '[]');
    const products = JSON.parse(localStorage.getItem('agriconnect-myanmar-local-products') || '[]');
    
    return conversations.map(conv => {
      // Determine the other party (not the current user)
      const otherPartyId = conv.buyerId === effectiveCurrentUser?.id ? conv.sellerId : conv.buyerId;
      const otherParty = users.find((user: any) => user.id === otherPartyId);
      const product = products.find((prod: any) => prod.id === conv.productId);
      
      // Get conversation messages
      const convMessages = messages[conv.id] || [];
      const lastMessage = convMessages[convMessages.length - 1];
      
      // Count unread messages (messages not from current user that don't have read status)
      const unreadCount = convMessages.filter(msg => 
        msg.senderId !== effectiveCurrentUser?.id && msg.status !== 'read'
      ).length;
      
      const finalConversation = {
        id: conv.id,
        productId: conv.productId,
        productName: conv.productName || product?.name || 'Unknown Product',
        productImage: product?.image || 'https://images.unsplash.com/photo-1546470427-227c013b2b5f?w=400&h=300&fit=crop',
        otherParty: {
          id: otherPartyId,
          name: otherParty?.businessName || otherParty?.name || 'Unknown User',
          type: otherParty?.userType || 'buyer',
          location: otherParty?.location || 'Unknown',
          rating: otherParty?.rating || 0,
          verified: otherParty?.verified || false
        },
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          timestamp: lastMessage.createdAt,
          isOwn: lastMessage.senderId === effectiveCurrentUser?.id
        } : {
          content: 'No messages yet',
          timestamp: conv.updatedAt,
          isOwn: false
        },
        unreadCount,
        status: conv.status === 'active' ? 'active' : 'archived'
      } as Conversation;
      
      return finalConversation;
    });
  }, [conversations?.length, Object.keys(messages).length, effectiveCurrentUser?.id]);

  const filteredConversations = useMemo(() => {
    let filtered = transformedConversations;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(conv => 
        conv.otherParty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    switch (filterType) {
      case 'unread':
        filtered = filtered.filter(conv => conv.unreadCount > 0);
        break;
      case 'active':
        filtered = filtered.filter(conv => conv.status === 'active');
        break;
      case 'archived':
        filtered = filtered.filter(conv => conv.status === 'archived');
        break;
    }

    // Sort by last message timestamp
    return filtered.sort((a, b) => 
      new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
    );
  }, [transformedConversations, searchQuery, filterType]);

  const totalUnread = transformedConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  // Handle total conversation cleanup
  const handleFullCleanup = async () => {
    if (!window.confirm('This will clear ALL conversations, messages, and offers. Are you sure?')) {
      return;
    }
    
    try {
      console.log('🧹 Starting full chat cleanup...');
      
      // Clear all chat-related storage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('agriconnect-myanmar-messages-') ||
            key === 'agriconnect-myanmar-conversations' ||
            key === 'agriconnect-myanmar-offers') {
          localStorage.removeItem(key);
        }
      });
      
      // Clear session storage
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('chat') || key.includes('conversation') || key.includes('message')) {
          sessionStorage.removeItem(key);
        }
      });
      
      console.log('✅ Full cleanup completed');
      toast.success('All chat data cleared successfully');
      
      // Refresh conversations
      await fetchConversations();
    } catch (error) {
      console.error('❌ Failed to perform full cleanup:', error);
      toast.error('Failed to clear chat data');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4 mb-8">
        {/* Back button row */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="h-9 px-3 -ml-3">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {/* Enhanced Development Tools */}
          {process.env.NODE_ENV === 'development' && (
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setDebugMode(!debugMode)}
                className="text-xs"
              >
                <Database className="w-3 h-3 mr-1" />
                {debugMode ? 'Hide' : 'Show'} Debug
              </Button>
              
              {transformedConversations.length > 0 && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={cleanupStoredData}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Cleanup Old Data
                  </Button>
                  
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      clearAllConversations();
                      loadConversations(effectiveCurrentUser.id);
                    }}
                    className="text-xs text-amber-600 hover:text-amber-700"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear All (Dev)
                  </Button>
                  
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={handleFullCleanup}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Full Reset (Dev)
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Debug Information Panel */}
        {debugMode && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-800">Debug Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Authentication:</strong>
                  <div className="text-muted-foreground">
                    User: {effectiveCurrentUser?.email || 'Not authenticated'}<br/>
                    ID: {effectiveCurrentUser?.id || 'None'}<br/>
                    Type: {effectiveCurrentUser?.userType || 'Unknown'}
                  </div>
                </div>
                <div>
                  <strong>Storage Stats:</strong>
                  <div className="text-muted-foreground">
                    Conversations: {storageStats?.conversations || 0} bytes<br/>
                    Message Keys: {storageStats?.messageKeys || 0}<br/>
                    Offers: {storageStats?.offers || 0} bytes<br/>
                    Total Storage: {Math.round((storageStats?.totalStorage || 0) / 1024)} KB
                  </div>
                </div>
              </div>
              
              <div>
                <strong>Chat State:</strong>
                <div className="text-muted-foreground">
                  Conversations: {conversations?.length || 0}<br/>
                  Transformed: {transformedConversations.length}<br/>
                  Filtered: {filteredConversations.length}<br/>
                  Loading: {loading ? 'Yes' : 'No'}<br/>
                  Error: {error || 'None'}
                </div>
              </div>
              
              {conversations?.length > 0 && (
                <details className="bg-white rounded border p-2">
                  <summary className="cursor-pointer font-medium">Raw Conversations Data</summary>
                  <pre className="mt-2 text-xs overflow-auto max-h-32">
                    {JSON.stringify(conversations.map(c => ({
                      id: c.id,
                      productName: c.productName,
                      buyerId: c.buyerId,
                      sellerId: c.sellerId,
                      messageCount: messages[c.id]?.length || 0
                    })), null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Title section - aligned with content */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            {totalUnread > 0 ? `${totalUnread} unread messages` : 'All caught up!'}
            {effectiveCurrentUser ? ` • Logged in as ${effectiveCurrentUser.name}` : ' • Not authenticated'}
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Error loading conversations</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => loadConversations(effectiveCurrentUser?.id)}
              className="mt-2"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Authentication Warning */}
      {!effectiveCurrentUser && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Authentication Issue</span>
            </div>
            <p className="text-amber-600 text-sm mt-1">
              No authenticated user found. Please log in to view messages.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBack}
              className="mt-2"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All', count: transformedConversations.length },
                { key: 'unread', label: 'Unread', count: totalUnread },
                { key: 'active', label: 'Active', count: transformedConversations.filter(c => c.status === 'active').length }
              ].map(filter => (
                <Button
                  key={filter.key}
                  variant={filterType === filter.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(filter.key as any)}
                  className="gap-2"
                >
                  {filter.label}
                  {filter.count > 0 && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      {filter.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversations List */}
      <div className="space-y-4">
        {filteredConversations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No conversations found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? `No conversations match "${searchQuery}"`
                  : filterType === 'unread' 
                    ? "You're all caught up! No unread messages."
                    : "Start chatting with sellers and buyers to see conversations here."
                }
              </p>
              {!searchQuery && filterType === 'all' && (
                <Button variant="outline" onClick={onBack}>
                  Browse Products
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredConversations.map((conversation) => (
            <Card 
              key={conversation.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                conversation.unreadCount > 0 ? 'ring-2 ring-primary/20' : ''
              }`}
              onClick={() => setSelectedConversation(conversation.id)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img 
                      src={conversation.productImage}
                      alt={conversation.productName}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1546470427-227c013b2b5f?w=400&h=300&fit=crop';
                      }}
                    />
                  </div>

                  {/* Conversation Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{conversation.otherParty.name}</h3>
                        <UserBadge 
                          userType={conversation.otherParty.type}
                          accountType={getUserAccountType(conversation.otherParty)}
                          verificationLevel={getUserVerificationLevel(conversation.otherParty)}
                          size="sm"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(conversation.lastMessage.timestamp)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Package className="w-3 h-3" />
                      <span className="truncate">{conversation.productName}</span>
                      <span>•</span>
                      <MapPin className="w-3 h-3" />
                      <span>{conversation.otherParty.location}</span>
                      {conversation.otherParty.rating > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span>{conversation.otherParty.rating.toFixed(1)}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate flex-1 mr-4">
                        {conversation.lastMessage.isOwn ? 'You: ' : ''}
                        {conversation.lastMessage.content || 'No message content'}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="bg-primary text-primary-foreground px-2 py-1 text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm" className="p-1">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Empty State for No Messages */}
      {transformedConversations.length === 0 && !loading && effectiveCurrentUser && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No messages yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start conversations with farmers, traders, and buyers by browsing products and clicking the chat button.
            </p>
            <div className="flex justify-center">
              <Button onClick={onBack}>
                Browse Products
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-pulse space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
              <div className="h-3 bg-muted rounded w-1/3 mx-auto"></div>
            </div>
            <p className="text-muted-foreground mt-4">Loading conversations...</p>
          </CardContent>
        </Card>
      )}

      {/* Selected Conversation Chat Interface */}
      {selectedConversation && (() => {
        const conversation = transformedConversations.find(conv => conv.id === selectedConversation);
        if (!conversation) return null;

        return (
          <>
            {/* Mobile: Full screen overlay */}
            <div className="fixed inset-0 bg-card shadow-2xl border-l border-t z-50 transition-transform duration-300 md:hidden">
              <ChatInterface
                sellerName={conversation.otherParty.name}
                sellerType={conversation.otherParty.type}
                sellerLocation={conversation.otherParty.location}
                sellerRating={conversation.otherParty.rating}
                productName={conversation.productName}
                productId={conversation.productId}
                sellerId={conversation.otherParty.id}
                conversationId={conversation.id}
                onClose={() => setSelectedConversation(null)}
                sellerVerified={conversation.otherParty.verified}
                currentUserVerified={effectiveCurrentUser?.verified || false}
                currentUserType={effectiveCurrentUser?.userType}
                sellerVerificationStatus={{
                  trustLevel: conversation.otherParty.verified ? 'id-verified' : 'unverified',
                  tierLabel: conversation.otherParty.verified ? 'Verified' : 'Unverified',
                  levelBadge: conversation.otherParty.verified ? 'Tier 1' : 'Unverified'
                }}
              />
            </div>

            {/* Desktop: Side panel */}
            <div className="hidden md:block fixed right-0 bottom-0 h-[600px] w-96 bg-card shadow-2xl border-l border-t z-50 transition-transform duration-300">
              <ChatInterface
                sellerName={conversation.otherParty.name}
                sellerType={conversation.otherParty.type}
                sellerLocation={conversation.otherParty.location}
                sellerRating={conversation.otherParty.rating}
                productName={conversation.productName}
                productId={conversation.productId}
                sellerId={conversation.otherParty.id}
                conversationId={conversation.id}
                onClose={() => setSelectedConversation(null)}
                sellerVerified={conversation.otherParty.verified}
                currentUserVerified={effectiveCurrentUser?.verified || false}
                currentUserType={effectiveCurrentUser?.userType}
                sellerVerificationStatus={{
                  trustLevel: conversation.otherParty.verified ? 'id-verified' : 'unverified',
                  tierLabel: conversation.otherParty.verified ? 'Verified' : 'Unverified',
                  levelBadge: conversation.otherParty.verified ? 'Tier 1' : 'Unverified'
                }}
              />
            </div>
          </>
        );
      })()}
    </div>
  );
}