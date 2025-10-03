import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Send, MapPin, Star, Shield, AlertTriangle, CheckCircle, Clock, User, X, Package, Handshake, DollarSign } from "lucide-react";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../hooks/useAuth";
import { AccountTypeBadge, getUserVerificationLevel } from "./UserBadgeSystem";
import { CreateOfferModal } from "./CreateOfferModal";
import { OfferCard } from "./OfferCard";
import type { Product } from "../data/products";
import { toast } from "sonner";
import { OffersService, type Offer } from "../services/offers";

interface Message {
  id: string;
  sender: 'user' | 'seller';
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  sellerName: string;
  sellerType: 'farmer' | 'trader';
  sellerLocation: string;
  sellerRating: number;
  productName: string;
  productId: string;
  sellerId: string;
  conversationId?: string;
  onClose: () => void;
  sellerVerified?: boolean;
  currentUserVerified?: boolean;
  currentUserType?: string;
  currentUser?: any; // Pass currentUser from App.tsx instead of using separate useAuth
  sellerVerificationStatus?: {
    trustLevel: 'unverified' | 'under-review' | 'id-verified' | 'business-verified';
    tierLabel: string;
    levelBadge: string;
  };
  product?: Product; // Full product details for offers
}

export function ChatInterface({ 
  sellerName, 
  sellerType, 
  sellerLocation, 
  sellerRating,
  productName,
  productId,
  sellerId,
  conversationId: initialConversationId,
  onClose,
  sellerVerified = false,
  currentUserVerified = false,
  currentUserType = 'buyer',
  sellerVerificationStatus,
  product,
  currentUser: passedCurrentUser
}: ChatInterfaceProps) {
  // Remove separate useAuth call - use passed currentUser from App.tsx
  
  // Use passed currentUser from App.tsx (fixes timing issues)
  const effectiveCurrentUser = useMemo(() => {
    if (passedCurrentUser?.id) {
      console.log('✅ ChatInterface using passed user:', passedCurrentUser.email || passedCurrentUser.name);
      return passedCurrentUser;
    }
    
    console.log('❌ ChatInterface: No user passed from App.tsx');
    return null;
  }, [passedCurrentUser?.id]);
  
  // Debug current user state - simplified
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && (!passedCurrentUser || !effectiveCurrentUser)) {
      console.log('🔍 ChatInterface - Authentication issue:', {
        hasCurrentUser: !!passedCurrentUser,
        hasEffectiveUser: !!effectiveCurrentUser,
        timestamp: new Date().toISOString()
      });
    }
  }, [passedCurrentUser?.id, effectiveCurrentUser?.id]);
  
  const { messages, sendMessage, startConversation, loadMessages } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
  
  // Debug conversation ID changes
  useEffect(() => {
    console.log('🔄 Conversation ID changed:', {
      old: conversationId,
      new: conversationId,
      timestamp: new Date().toISOString()
    });
  }, [conversationId]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Offer functionality
  const [showCreateOffer, setShowCreateOffer] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);

  // Stable conversation key to prevent unnecessary reloads - exclude conversationId to prevent loops
  const conversationKey = useMemo(() => {
    if (!productId || !sellerId || !effectiveCurrentUser?.id) return null;
    return `${productId}-${sellerId}-${effectiveCurrentUser.id}`;
  }, [productId, sellerId, effectiveCurrentUser?.id]);

  // Cleanup state only when component unmounts (removed conversationKey dependency)
  useEffect(() => {
    return () => {
      setShowCreateOffer(false);
      setIsLoading(false); // Ensure loading state is reset
    };
  }, []); // Only run on mount/unmount

  // Recovery mechanism - reset loading state if stuck
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        console.warn('Chat interface stuck in loading state, forcing recovery');
        setIsLoading(false);
        toast.warning('Chat recovered from loading state');
      }, 10000); // 10 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);
  
  // Load conversation offers from Supabase
  useEffect(() => {
    if (conversationId && effectiveCurrentUser?.id) {
      const loadOffers = async () => {
        try {
          console.log('📋 Loading offers for conversation:', conversationId);
          const conversationOffers = await OffersService.getOffersForConversation(conversationId);
          
          console.log(`✅ Loaded ${conversationOffers.length} offers for conversation`);
          setOffers(conversationOffers);
        } catch (error) {
          console.error('❌ Failed to load offers:', error);
          setOffers([]); // Clear offers on error
        }
      };

      loadOffers();
    } else {
      setOffers([]); // Clear offers if missing required data
    }
  }, [conversationId, effectiveCurrentUser?.id]);

  // Get current conversation messages - optimized
  const currentMessages = useMemo(() => {
    const msgs = conversationId ? messages[conversationId] || [] : [];
    return msgs;
  }, [conversationId, messages[conversationId || '']?.length]);

  // Note: localStorage cleanup removed - now using Supabase offers table

  // Initialize or get conversation - with stability improvements
  useEffect(() => {
    const initializeChat = async () => {
      if (!effectiveCurrentUser || !productId || !sellerId) {
        console.log('🔄 Chat initialization skipped - missing dependencies:', {
          hasUser: !!effectiveCurrentUser,
          hasProductId: !!productId,
          hasSellerId: !!sellerId
        });
        return;
      }
      
      // Don't re-initialize if we already have a stable conversation
      if (conversationId) {
        console.log('✅ Chat already initialized:', conversationId);
        // Always fetch messages to ensure they're loaded
        try {
          await loadMessages(conversationId);
        } catch (error) {
          console.error('❌ Failed to fetch messages for existing conversation:', error);
        }
        return;
      }
      
      try {
        console.log('🚀 Initializing chat:', {
          productId,
          sellerId,
          currentUserId: effectiveCurrentUser.id,
          initialConversationId
        });
        
        setIsLoading(true);
        
        if (initialConversationId) {
          // Use existing conversation
          console.log('📱 Using existing conversation:', initialConversationId);
          setConversationId(initialConversationId);
          await loadMessages(initialConversationId);
        } else {
          // Check if conversation already exists in localStorage first
          try {
            const storedConversations = localStorage.getItem('agriconnect-myanmar-conversations');
            if (storedConversations) {
              const conversations = JSON.parse(storedConversations);
              const existingConversation = conversations.find((conv: any) => 
                ((conv.buyerId === effectiveCurrentUser.id && conv.sellerId === sellerId) ||
                 (conv.sellerId === effectiveCurrentUser.id && conv.buyerId === sellerId)) && 
                conv.productId === productId
              );
              
              if (existingConversation) {
                console.log('📱 Found existing conversation in localStorage:', existingConversation.id);
                setConversationId(existingConversation.id);
                await loadMessages(existingConversation.id);
                return;
              }
            }
          } catch (error) {
            console.warn('Could not check for existing conversations:', error);
          }
          
          // Start new conversation
          console.log('🆕 Starting new conversation');
          // Determine if current user is buyer or seller
          const isCurrentUserSeller = effectiveCurrentUser.id === sellerId;
          const buyerId = isCurrentUserSeller ? sellerId : effectiveCurrentUser.id;
          const actualSellerId = isCurrentUserSeller ? effectiveCurrentUser.id : sellerId;
          
          const conversation = await startConversation(buyerId, actualSellerId, productId);
          console.log('✅ New conversation created:', conversation.id);
          setConversationId(conversation.id);
        }
      } catch (error) {
        console.error('❌ Failed to initialize chat:', error);
        toast.error('Failed to start conversation');
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, [effectiveCurrentUser?.id, productId, sellerId, initialConversationId]); // Removed conversationId to prevent loops

  // Auto-scroll to bottom when new messages or offers arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [currentMessages, offers]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || isLoading || !effectiveCurrentUser) {
      console.log('⚠️ Cannot send message:', {
        hasMessage: !!newMessage.trim(),
        hasConversationId: !!conversationId,
        hasEffectiveUser: !!effectiveCurrentUser,
        isLoading
      });
      return;
    }
    
    const messageToSend = newMessage.trim();
    console.log('📤 Sending message:', {
      conversationId,
      content: messageToSend,
      sender: effectiveCurrentUser.name,
      userId: effectiveCurrentUser.id
    });
    
    setNewMessage(''); // Clear immediately for better UX
    
    try {
      setIsLoading(true);
      const sentMessage = await sendMessage(conversationId, messageToSend);
      console.log('✅ Message sent successfully:', sentMessage);
      
      // Temporarily disabled loadMessages to prevent duplicate issues
      // TODO: Re-enable after fixing duplicate ChatInterface instances
      // if (conversationId) {
      //   console.log('🔄 Reloading messages after send...');
      //   await loadMessages(conversationId);
      // }
      
      // Verify conversation state after sending
      console.log('🔍 Post-send conversation state:', {
        conversationId,
        messageCount: currentMessages.length,
        isLoading: false
      });
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      // Restore message on error
      setNewMessage(messageToSend);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
      
      // Additional check to ensure conversation ID is still valid
      console.log('🔍 Final conversation check:', {
        conversationId: conversationId,
        stillValid: !!conversationId,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'Just now';
    
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp:', timestamp);
      return 'Just now';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  // Offer handling functions
  const handleCreateOffer = async (offer: Omit<Offer, "id" | "createdAt" | "updatedAt">) => {
    console.log('🎯 Creating offer - conversation state before:', {
      conversationId,
      productId,
      sellerId,
      currentUserId: passedCurrentUser?.id,
      conversationKey
    });

    const newOffer: Offer = {
      ...offer,
      id: `offer_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    try {
      // Save to Supabase
      const savedOffer = await OffersService.createOffer({
        ...offer,
        conversationId: conversationId!,
        productId,
        buyerId: effectiveCurrentUser.id,
        sellerId
      });
      
      console.log('💾 Offer saved to Supabase:', savedOffer.id);
      
      // Update local state with the saved offer
      setOffers(prevOffers => {
        console.log('📝 Updating offers state - previous count:', prevOffers.length);
        // Check if offer already exists to prevent duplicates
        const existingOffer = prevOffers.find(o => o.id === savedOffer.id);
        if (existingOffer) {
          console.log('⚠️ Duplicate offer detected, skipping');
          return prevOffers; // Don't add duplicate
        }
        console.log('✅ Adding new offer to state');
        return [...prevOffers, savedOffer];
      });
      
      // Close modal
      setShowCreateOffer(false);
      
      // Success feedback
      toast.success('Offer sent successfully!');
      
      console.log('🎯 Offer creation complete - conversation state after:', {
        conversationId,
        productId,
        sellerId,
        currentUserId: passedCurrentUser?.id,
        conversationKey
      });
      
      // Scroll to bottom to show the new offer
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Failed to save offer:', error);
      toast.error('Failed to create offer');
    }
  };

  const handleAcceptOffer = (offerId: string) => {
    updateOfferStatus(offerId, "accepted", { acceptedAt: new Date().toISOString() });
  };

  const handleDeclineOffer = (offerId: string) => {
    updateOfferStatus(offerId, "declined");
  };

  const handleMarkCompleted = (offerId: string) => {
    updateOfferStatus(offerId, "completed", { completedAt: new Date().toISOString() });
  };

  const handleModifyOffer = (offerId: string, modifications: Partial<Offer>) => {
    updateOfferStatus(offerId, "pending", modifications);
  };

  const updateOfferStatus = async (offerId: string, status: Offer["status"], updates: Partial<Offer> = {}) => {
    try {
      await OffersService.updateOfferStatus(offerId, status, updates);
      
      setOffers(prev => prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, status, ...updates }
          : offer
      ));
      
      toast.success(`Offer ${status}!`);
    } catch (error) {
      console.error('Failed to update offer:', error);
      toast.error('Failed to update offer');
    }
  };

  const canCreateOffer = effectiveCurrentUser && product && effectiveCurrentUser.id !== sellerId;
  const isSeller = effectiveCurrentUser?.id === sellerId;

  // Debug offer button visibility
  console.log('🔍 ChatInterface Offer Button Debug:', {
    effectiveCurrentUser: effectiveCurrentUser?.id,
    product: product?.id,
    sellerId,
    canCreateOffer,
    isSeller,
    currentUserType: effectiveCurrentUser?.userType
  });

  return (
    <Card className="h-full flex flex-col border-0 rounded-none">
      {/* Header - Fixed */}
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {sellerName}
              <AccountTypeBadge 
                userType={sellerType}
                accountType="individual"
                size="sm"
                className="mr-1"
              />
            </CardTitle>
          </div>
          <div className="flex gap-2">
            {canCreateOffer && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      className="h-9 bg-green-600 hover:bg-green-700"
                      onClick={() => setShowCreateOffer(true)}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Make Offer
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Make an offer for this product</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {/* Content Area - Flexible */}
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Simplified Verification Status Alert - Public View (2-Stage System) */}
        {sellerVerificationStatus && (
          <div className={`mx-4 mt-3 p-3 rounded-lg border ${
            sellerVerificationStatus.trustLevel !== 'unverified' 
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-start gap-2">
              {!sellerVerificationStatus.trustLevel !== 'unverified' && (
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              )}
              {sellerVerificationStatus.trustLevel !== 'unverified' && (
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              )}
              <div className="flex-1">
                {!sellerVerificationStatus.trustLevel !== 'unverified' && (
                  <>
                    <p className="text-sm font-medium text-yellow-800">
                      Profile Not Confirmed
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      <span className="font-medium">{sellerName}</span> has not completed profile verification yet. 
                      Exercise appropriate caution when sharing personal information.
                    </p>
                  </>
                )}
                
                {sellerVerificationStatus.trustLevel !== 'unverified' && (
                  <>
                    <p className="text-sm font-medium text-green-800">
                      Verified {sellerType === 'farmer' ? 'Farmer' : sellerType === 'trader' ? 'Trader' : 'User'}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      <span className="font-medium">{sellerName}</span> has completed profile verification 
                      and confirmed their identity.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}


        <ScrollArea ref={scrollAreaRef} className="h-[300px] p-4">
          <div className="space-y-4 pb-4">
            {isLoading && currentMessages.length === 0 && offers.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <div className="animate-pulse">Starting conversation...</div>
              </div>
            ) : currentMessages.length === 0 && offers.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No messages yet. Say hello to start the conversation!</p>
              </div>
            ) : (
              <>
                {/* Messages */}
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === effectiveCurrentUser?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.senderId === effectiveCurrentUser?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs opacity-70">{formatTimestamp(message.timestamp)}</p>
                        {message.senderId === effectiveCurrentUser?.id && message.status && (
                          <span className="text-xs opacity-70 ml-2">
                            {message.status === 'sending' ? '⏳' : 
                             message.status === 'sent' ? '✓' : 
                             message.status === 'delivered' ? '✓✓' : 
                             message.status === 'read' ? '✓✓' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Display Offers - Improved Layout */}
                {offers.length > 0 && (
                  <div className="space-y-3">
                    {offers.map((offer) => (
                      <div key={offer.id} className="w-full">
                        <OfferCard
                          offer={offer}
                          currentUserId={effectiveCurrentUser?.id || ""}
                          onAccept={handleAcceptOffer}
                          onDecline={handleDeclineOffer}
                          onModify={handleModifyOffer}
                          onMarkCompleted={handleMarkCompleted}
                          canModify={effectiveCurrentUser?.id === sellerId}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
        
        {/* Debug: Offer Management (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="flex-shrink-0 p-2 border-t bg-gray-50 border-gray-200">
            <div className="flex gap-2 justify-between items-center">
              <div className="text-xs text-gray-600">
                Dev Tools: {offers.length} offers loaded
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    console.log('🔍 Current Offers Debug:', {
                      totalOffers: offers.length,
                      offers: offers.map(o => ({
                        id: o.id.slice(-8),
                        seller: o.sellerName,
                        buyer: o.buyerName,
                        sellerId: o.sellerId,
                        buyerId: o.buyerId,
                        status: o.status
                      })),
                      currentUser: effectiveCurrentUser?.name,
                      currentUserId: effectiveCurrentUser?.id,
                      sellerId,
                      productId
                    });
                  }}
                  className="text-xs text-blue-600 border-blue-300 hover:bg-blue-100"
                >
                  🔍 Debug Offers
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setOffers([]);
                    toast.success('Offers cleared from view');
                  }}
                  className="text-xs text-red-600 border-red-300 hover:bg-red-100"
                >
                  🗑️ Clear View
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Message Input - Always present, never conditionally rendered */}
        <div className="flex-shrink-0 p-4 border-t bg-card">
          <div className="flex gap-2">
            <Input
              placeholder={
                !conversationId 
                  ? "Initializing..." 
                  : isLoading 
                  ? "Sending..." 
                  : "Type your message..."
              }
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || !conversationId || !effectiveCurrentUser}
              className="flex-1"
              autoComplete="off"
              maxLength={1000}
            />
            <Button 
              onClick={handleSendMessage} 
              size="sm"
              disabled={isLoading || !conversationId || !newMessage.trim() || !effectiveCurrentUser}
              className="shrink-0"
            >
              {isLoading ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {/* Status Messages */}
          <div className="mt-2 space-y-1">
            {!conversationId && effectiveCurrentUser && (
              <p className="text-xs text-muted-foreground text-center">
                Setting up conversation...
              </p>
            )}
            {!effectiveCurrentUser && (
              <p className="text-xs text-muted-foreground text-center">
                Please log in to send messages
              </p>
            )}
            
            {/* Debug: Show conversation state */}
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-gray-500 text-center">
                ConvID: {conversationId ? conversationId.slice(-8) : 'null'} | 
                User: {effectiveCurrentUser?.name || 'none'} | 
                Loading: {isLoading.toString()} |
                Offers: {offers.length}
              </p>
            )}
          </div>
        </div>
      </CardContent>

      {/* Create Offer Modal */}
      {showCreateOffer && product && effectiveCurrentUser && (() => {
        console.log('🔍 ChatInterface - Rendering CreateOfferModal with user data:', {
          currentUserId: effectiveCurrentUser.id,
          currentUserName: effectiveCurrentUser.name,
          currentUserEmail: effectiveCurrentUser.email,
          currentUserType: effectiveCurrentUser.userType,
          sellerId,
          sellerName,
          productId: product.id,
          productName: product.name
        });

        return (
          <CreateOfferModal
            isOpen={showCreateOffer}
            onClose={() => setShowCreateOffer(false)}
            product={product}
            buyerId={effectiveCurrentUser.id}
            buyerName={effectiveCurrentUser.name}
            sellerId={sellerId}
            sellerName={sellerName}
            onCreateOffer={handleCreateOffer}
          />
        );
      })()}
    </Card>
  );
}