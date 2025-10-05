import { useState, useCallback, useEffect } from 'react'
import ENV from '../config/env'

interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  timestamp: string
  type: 'text' | 'offer' | 'image'
  isRead: boolean
  offerDetails?: {
    amount: number
    quantity: number
    validUntil: string
    status: 'pending' | 'accepted' | 'rejected' | 'expired'
  }
}

interface Conversation {
  id: string
  buyerId: string
  sellerId: string
  productId: string
  productName: string
  productImage?: string
  buyerName: string
  buyerType: string
  buyerLocation: string
  buyerAccountType: string
  buyerVerified: boolean
  buyerPhoneVerified: boolean
  buyerVerificationStatus: string
  buyerVerificationSubmitted: boolean
  sellerName: string
  sellerType: string
  sellerLocation: string
  sellerAccountType: string
  sellerVerified: boolean
  sellerPhoneVerified: boolean
  sellerVerificationStatus: string
  sellerVerificationSubmitted: boolean
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  createdAt: string
}

export const useChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subscriptions, setSubscriptions] = useState<Map<string, any>>(new Map())

  const loadConversations = useCallback(async (userId: string) => {
    if (!ENV.isSupabaseConfigured()) {
      console.log('❌ Supabase not configured for chat');
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true)
      setError(null)
      
      const { supabase } = await import('../lib/supabase')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.access_token) {
        console.log('❌ No valid session - authentication required for chat');
        setConversations([]);
        setLoading(false);
        return;
      }

      // Fetch conversations from Supabase with complete user verification data
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          *,
          buyer:users!conversations_buyer_id_fkey(
            id, 
            name, 
            user_type, 
            account_type,
            location, 
            verified, 
            phone_verified, 
            verification_status, 
            verification_submitted
          ),
          seller:users!conversations_seller_id_fkey(
            id, 
            name, 
            user_type, 
            account_type,
            location, 
            verified, 
            phone_verified, 
            verification_status, 
            verification_submitted
          ),
          product:products!conversations_product_id_fkey(id, name, image)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('updated_at', { ascending: false })

      if (conversationsError) {
        throw conversationsError
      }

      const formattedConversations = conversationsData?.map(conv => ({
        id: conv.id,
        buyerId: conv.buyer_id,
        sellerId: conv.seller_id,
        productId: conv.product_id,
        productName: conv.product?.name || 'Unknown Product',
        productImage: conv.product?.image || 'https://images.unsplash.com/photo-1546470427-227c013b2b5f?w=400&h=300&fit=crop',
        buyerName: conv.buyer?.name || 'Unknown Buyer',
        buyerType: conv.buyer?.user_type || 'buyer',
        buyerLocation: conv.buyer?.location || 'Unknown Location',
        buyerAccountType: conv.buyer?.account_type || 'individual',
        buyerVerified: conv.buyer?.verified || false,
        buyerPhoneVerified: conv.buyer?.phone_verified || false,
        buyerVerificationStatus: conv.buyer?.verification_status || 'not_started',
        buyerVerificationSubmitted: conv.buyer?.verification_submitted || false,
        sellerName: conv.seller?.name || 'Unknown Seller',
        sellerType: conv.seller?.user_type || 'farmer',
        sellerLocation: conv.seller?.location || 'Unknown Location',
        sellerAccountType: conv.seller?.account_type || 'individual',
        sellerVerified: conv.seller?.verified || false,
        sellerPhoneVerified: conv.seller?.phone_verified || false,
        sellerVerificationStatus: conv.seller?.verification_status || 'not_started',
        sellerVerificationSubmitted: conv.seller?.verification_submitted || false,
        lastMessage: conv.last_message,
        lastMessageTime: conv.last_message_time,
        unreadCount: conv.unread_count || 0,
        createdAt: conv.created_at
      })) || []

      setConversations(formattedConversations)
      console.log('✅ Conversations loaded from Supabase:', formattedConversations.length)
      
      // Debug: Log verification data for first conversation
      if (formattedConversations.length > 0) {
        const firstConv = formattedConversations[0];
        console.log('🔍 First conversation verification data:', {
          sellerName: firstConv.sellerName,
          sellerVerified: firstConv.sellerVerified,
          sellerAccountType: firstConv.sellerAccountType,
          sellerVerificationStatus: firstConv.sellerVerificationStatus,
          buyerName: firstConv.buyerName,
          buyerVerified: firstConv.buyerVerified,
          buyerAccountType: firstConv.buyerAccountType,
          buyerVerificationStatus: firstConv.buyerVerificationStatus
        });
      }
      
    } catch (err) {
      console.error('❌ Failed to load conversations:', err)
      setError('Failed to load conversations')
      setConversations([])
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMessages = useCallback(async (conversationId: string) => {
    console.log('🔄 loadMessages called for conversation:', conversationId);
    
    if (!ENV.isSupabaseConfigured()) {
      console.log('❌ Supabase not configured');
      setMessages(prev => ({ ...prev, [conversationId]: [] }));
      return;
    }

    try {
      const { supabase } = await import('../lib/supabase')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      console.log('🔍 Session check:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        sessionError: sessionError?.message,
        userId: session?.user?.id
      });
      
      if (!session?.access_token) {
        console.log('❌ No valid session - authentication required for chat');
        setMessages(prev => ({ ...prev, [conversationId]: [] }));
        return;
      }

      console.log('🔍 Fetching messages from database for conversation:', conversationId);
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (messagesError) {
        console.error('❌ Error fetching messages:', messagesError);
        throw messagesError
      }

      console.log('📨 Raw messages from database:', messagesData?.length || 0, 'messages');

      const formattedMessages = messagesData?.map(msg => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        content: msg.content,
        timestamp: new Date(msg.created_at).toISOString(),
        type: msg.type || 'text',
        isRead: msg.is_read || false,
        offerDetails: msg.offer_details ? JSON.parse(msg.offer_details) : undefined
      })) || []

      console.log('✅ Formatted messages:', formattedMessages.length, 'messages');
      console.log('📝 Message contents:', formattedMessages.map(m => ({ id: m.id, content: m.content.substring(0, 50) + '...' })));

      setMessages(prev => ({
        ...prev,
        [conversationId]: formattedMessages
      }))

      // Set up real-time subscription for new messages
      if (!subscriptions.has(conversationId)) {
        const channel = supabase
          .channel(`messages-${conversationId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          }, (payload) => {
            console.log('🔄 New message received via real-time:', {
              messageId: payload.new.id,
              conversationId: payload.new.conversation_id,
              subscriptionFor: conversationId,
              content: payload.new.content.substring(0, 50) + '...'
            });
            console.log('🔄 Current messages before update:', messages[conversationId]?.length || 0)
            
            const newMessage = {
              id: payload.new.id,
              conversationId: payload.new.conversation_id,
              senderId: payload.new.sender_id,
              content: payload.new.content,
              timestamp: new Date(payload.new.created_at).toISOString(),
              type: payload.new.type || 'text',
              isRead: false,
              offerDetails: payload.new.offer_details ? JSON.parse(payload.new.offer_details) : undefined
            }

            // CRITICAL: Only add message if it belongs to this conversation
            if (payload.new.conversation_id === conversationId) {
              setMessages(prev => {
                const updated = {
                  ...prev,
                  [conversationId]: [...(prev[conversationId] || []), newMessage]
                }
                console.log('✅ Message added to correct conversation:', conversationId, 'Total messages:', updated[conversationId]?.length || 0)
                return updated
              })
            } else {
              console.log('❌ Message ignored - wrong conversation:', {
                messageConversationId: payload.new.conversation_id,
                subscriptionConversationId: conversationId
              });
            }
          })
          .subscribe()

        setSubscriptions(prev => {
          const newSubscriptions = new Map([...prev, [conversationId, channel]]);
          console.log('✅ Real-time subscription set up for conversation:', conversationId);
          console.log('📊 Total active subscriptions:', newSubscriptions.size);
          return newSubscriptions;
        })
      }

      console.log('✅ Messages loaded from Supabase:', formattedMessages.length)
      
    } catch (err) {
      console.error('❌ Failed to load messages:', err)
      setMessages(prev => ({ ...prev, [conversationId]: [] }))
    }
  }, [subscriptions])

  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    senderId: string,
    type: 'text' | 'offer' | 'image' = 'text',
    offerDetails?: any
  ) => {
    if (!ENV.isSupabaseConfigured()) {
      return;
    }

    try {
      const { supabase } = await import('../lib/supabase')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      console.log('🔍 SendMessage Session check:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        sessionError: sessionError?.message,
        userId: session?.user?.id
      });
      
      if (!session?.access_token) {
        console.log('❌ No valid session - authentication required for chat');
        return;
      }

      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          type,
          offer_details: offerDetails ? JSON.stringify(offerDetails) : null
        })
        .select()
        .single()

      if (messageError) {
        throw messageError
      }

      // Update local state
      const newMessage = {
        id: messageData.id,
        conversationId: messageData.conversation_id,
        senderId: messageData.sender_id,
        content: messageData.content,
        timestamp: new Date(messageData.created_at).toISOString(),
        type: messageData.type || 'text',
        isRead: false,
        offerDetails: messageData.offer_details ? JSON.parse(messageData.offer_details) : undefined
      }

      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), newMessage]
      }))

      // Update conversation last message
      await supabase
        .from('conversations')
        .update({
          last_message: content,
          last_message_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      console.log('✅ Message sent to Supabase')
      
      return newMessage; // Return the message object
      
    } catch (err) {
      console.error('❌ Failed to send message:', err)
      throw err; // Re-throw error so ChatInterface can handle it
    }
  }, [])

  const startConversation = useCallback(async (
    buyerId: string,
    sellerId: string,
    productId: string
  ) => {
    if (!ENV.isSupabaseConfigured()) {
      return null;
    }

    try {
      const { supabase } = await import('../lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        console.log('❌ No valid session - authentication required for chat');
        return null;
      }

      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('*')
        .eq('buyer_id', buyerId)
        .eq('seller_id', sellerId)
        .eq('product_id', productId)
        .single()

      if (existingConv) {
        console.log('✅ Existing conversation found:', existingConv.id)
        return {
          id: existingConv.id,
          buyerId: existingConv.buyer_id,
          sellerId: existingConv.seller_id,
          productId: existingConv.product_id,
          productName: existingConv.product_name || 'Unknown Product',
          buyerName: existingConv.buyer_name || 'Unknown Buyer',
          sellerName: existingConv.seller_name || 'Unknown Seller',
          lastMessage: existingConv.last_message,
          lastMessageTime: existingConv.last_message_time,
          unreadCount: existingConv.unread_count || 0,
          createdAt: existingConv.created_at
        }
      }

      // Get product and user details
      const { data: productData } = await supabase
        .from('products')
        .select('name')
        .eq('id', productId)
        .single()

      const { data: buyerData } = await supabase
        .from('users')
        .select('name')
        .eq('id', buyerId)
        .single()

      const { data: sellerData } = await supabase
        .from('users')
        .select('name')
        .eq('id', sellerId)
        .single()

      // Create new conversation (without initial message - will be set when first message is sent)
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          buyer_id: buyerId,
          seller_id: sellerId,
          product_id: productId,
          product_name: productData?.name || 'Unknown Product',
          buyer_name: buyerData?.name || 'Unknown Buyer',
          seller_name: sellerData?.name || 'Unknown Seller',
          last_message: null, // No initial message - will be set when first message is sent
          last_message_time: null
        })
        .select()
        .single()

      if (conversationError) {
        throw conversationError
      }

      const newConversation = {
        id: conversationData.id,
        buyerId: conversationData.buyer_id,
        sellerId: conversationData.seller_id,
        productId: conversationData.product_id,
        productName: conversationData.product_name,
        buyerName: conversationData.buyer_name,
        sellerName: conversationData.seller_name,
        lastMessage: conversationData.last_message,
        lastMessageTime: conversationData.last_message_time,
        unreadCount: 0,
        createdAt: conversationData.created_at
      }

      setConversations(prev => [newConversation, ...prev])
      console.log('✅ New conversation created:', newConversation.id)
      
      return newConversation
      
    } catch (err) {
      console.error('❌ Failed to start conversation:', err)
      return null
    }
  }, [])

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      if (ENV.isSupabaseConfigured()) {
        import('../lib/supabase').then(({ supabase }) => {
          subscriptions.forEach((channel, conversationId) => {
            console.log('🧹 Cleaning up subscription for conversation:', conversationId)
            if (channel && typeof channel.unsubscribe === 'function') {
              channel.unsubscribe()
            } else {
              // Fallback to removeChannel if unsubscribe is not available
              supabase.removeChannel(`messages-${conversationId}`)
            }
          })
        })
      }
    }
  }, [subscriptions])

  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!ENV.isSupabaseConfigured()) {
      return;
    }

    try {
      const { supabase } = await import('../lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        console.log('❌ No valid session - authentication required for chat');
        return;
      }

      console.log('🗑️ Deleting conversation:', conversationId);

      // First delete all messages in the conversation
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId)

      if (messagesError) {
        console.error('❌ Error deleting messages:', messagesError);
        throw messagesError
      }

      // Then delete the conversation
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)

      if (conversationError) {
        console.error('❌ Error deleting conversation:', conversationError);
        throw conversationError
      }

      // Remove from local state
      setConversations(prev => prev.filter(conv => conv.id !== conversationId))
      setMessages(prev => {
        const updated = { ...prev }
        delete updated[conversationId]
        return updated
      })

      // Clean up subscription
      const subscription = subscriptions.get(conversationId)
      if (subscription) {
        subscription.unsubscribe()
        setSubscriptions(prev => {
          const updated = new Map(prev)
          updated.delete(conversationId)
          return updated
        })
      }

      console.log('✅ Conversation deleted successfully:', conversationId)
      
    } catch (err) {
      console.error('❌ Failed to delete conversation:', err)
      throw err
    }
  }, [subscriptions])

  return {
    conversations,
    messages,
    loading,
    error,
    loadConversations,
    loadMessages,
    sendMessage,
    startConversation,
    deleteConversation
  }
}
