import { useState, useEffect, useCallback } from 'react'
import { conversationsAPI, messagesAPI, realtimeAPI } from '../services/api'
import { useBackendFallback } from './useBackendFallback'

interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  content: string
  messageType: 'text' | 'image' | 'offer'
  createdAt: string
  status?: 'sending' | 'sent' | 'delivered' | 'read'
}

interface Conversation {
  id: string
  buyerId: string
  sellerId: string
  productId: string
  status: 'active' | 'closed'
  productName: string
  buyerName: string
  sellerName: string
  lastMessage?: Message
  updatedAt: string
  unreadCount?: number
}

export const useChat = (userId?: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { backendAvailable } = useBackendFallback()

  // Fetch user's conversations
  const fetchConversations = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      if (!backendAvailable) {
        // Fallback: use localStorage for demo conversations
        console.log('📚 Loading conversations from localStorage for user:', userId);
        const storedConversations = localStorage.getItem('agriconnect-myanmar-conversations')
        if (storedConversations) {
          const allConversations = JSON.parse(storedConversations);
          const userConversations = allConversations.filter((conv: any) => 
            conv.buyerId === userId || conv.sellerId === userId
          );
          console.log('📋 User conversations loaded:', {
            userId,
            totalConversations: allConversations.length,
            userConversations: userConversations.length,
            conversations: userConversations.map((c: any) => ({
              id: c.id,
              productName: c.productName,
              buyerName: c.buyerName,
              sellerName: c.sellerName
            }))
          });
          setConversations(userConversations);
        } else {
          console.log('📋 No conversations found in localStorage');
          setConversations([]);
        }
        setLoading(false)
        return
      }
      
      // Check authentication before making API calls (but don't be too strict)
      const { supabase } = await import('../lib/supabase')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.log('Session error, using fallback mode')
        const storedConversations = localStorage.getItem('agriconnect-myanmar-conversations')
        if (storedConversations) {
          setConversations(JSON.parse(storedConversations))
        }
        setLoading(false)
        return
      }
      
      if (!session?.access_token) {
        console.log('No session token, trying fallback')
        const storedConversations = localStorage.getItem('agriconnect-myanmar-conversations')
        if (storedConversations) {
          setConversations(JSON.parse(storedConversations))
        }
        setLoading(false)
        return
      }
      
      // Only try to fetch from backend if we have authentication
      try {
        const backendConversations = await conversationsAPI.getAll()
      
        const transformedConversations: Conversation[] = backendConversations.map((conv: any) => ({
          id: conv.id,
          buyerId: conv.buyer_id,
          sellerId: conv.seller_id,
          productId: conv.product_id,
          status: conv.status,
          productName: conv.products?.name || 'Unknown Product',
          buyerName: conv.buyer?.name || 'Unknown Buyer',
          sellerName: conv.seller?.name || 'Unknown Seller',
          updatedAt: conv.updated_at
        }))
        
        setConversations(transformedConversations)
      } catch (backendError) {
        // Only log error if it's not an authentication error
        if (!(backendError instanceof Error && backendError.message.includes('Not authenticated'))) {
          console.error('Backend conversations fetch failed:', backendError)
        }
        // If backend fails due to auth or other issues, fall back to localStorage
        const storedConversations = localStorage.getItem('agriconnect-myanmar-conversations')
        if (storedConversations) {
          setConversations(JSON.parse(storedConversations))
        }
      }
    } catch (err) {
      // Only log error if it's not an authentication error
      if (!(err instanceof Error && err.message.includes('Not authenticated'))) {
        console.error('Fetch conversations error:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch conversations')
      }
      
      // Fallback to localStorage on error
      const storedConversations = localStorage.getItem('agriconnect-myanmar-conversations')
      if (storedConversations) {
        setConversations(JSON.parse(storedConversations))
      }
    } finally {
      setLoading(false)
    }
  }, [userId, backendAvailable])

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      if (!backendAvailable) {
        // Fallback: use localStorage for demo messages
        console.log('📥 Fetching messages for conversation:', conversationId);
        const storageKey = `agriconnect-myanmar-messages-${conversationId}`;
        const storedMessages = localStorage.getItem(storageKey);
        const demoMessages = storedMessages ? JSON.parse(storedMessages) : [];
        
        console.log('📨 Messages loaded from localStorage:', {
          conversationId,
          storageKey,
          messageCount: demoMessages.length,
          messages: demoMessages.map((m: any) => ({ 
            id: m.id, 
            content: m.content, 
            senderName: m.senderName,
            senderId: m.senderId 
          }))
        });
        
        setMessages(prev => ({
          ...prev,
          [conversationId]: demoMessages
        }))
        return demoMessages
      }
      
      const backendMessages = await messagesAPI.getForConversation(conversationId)
      
      const transformedMessages: Message[] = backendMessages.map((msg: any) => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        senderName: msg.sender?.name || 'Unknown',
        content: msg.content,
        messageType: msg.message_type,
        createdAt: msg.created_at
      }))
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: transformedMessages
      }))
      
      return transformedMessages
    } catch (err) {
      console.error('Fetch messages error:', err)
      
      // Fallback to localStorage on error
      const storedMessages = localStorage.getItem(`agriconnect-myanmar-messages-${conversationId}`)
      const fallbackMessages = storedMessages ? JSON.parse(storedMessages) : []
      setMessages(prev => ({
        ...prev,
        [conversationId]: fallbackMessages
      }))
      return fallbackMessages
    }
  }, [backendAvailable])

  // Send a message
  const sendMessage = useCallback(async (conversationId: string, content: string, messageType: 'text' | 'image' | 'offer' = 'text') => {
    try {
      if (!backendAvailable) {
        // Get real user information
        const users = JSON.parse(localStorage.getItem('agriconnect-myanmar-users') || '[]')
        const currentUser = users.find((user: any) => user.id === userId)
        
        const newMessage: Message = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          conversationId,
          senderId: userId || 'demo-user',
          senderName: currentUser?.name || 'You',
          content,
          messageType,
          createdAt: new Date().toISOString(),
          status: 'sending'
        }
        
        const currentMessages = messages[conversationId] || []
        const updatedMessages = [...currentMessages, newMessage]
        
        setMessages(prev => ({
          ...prev,
          [conversationId]: updatedMessages
        }))
        
        localStorage.setItem(`agriconnect-myanmar-messages-${conversationId}`, JSON.stringify(updatedMessages))
        
        // Update conversation timestamp and last message
        const conversations = JSON.parse(localStorage.getItem('agriconnect-myanmar-conversations') || '[]')
        const updatedConversations = conversations.map((conv: any) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: newMessage,
              updatedAt: new Date().toISOString()
            }
          }
          return conv
        })
        
        localStorage.setItem('agriconnect-myanmar-conversations', JSON.stringify(updatedConversations))
        setConversations(updatedConversations)
        
        // Simulate message delivery
        setTimeout(() => {
          const deliveredMessage = { ...newMessage, status: 'sent' }
          const updatedDeliveredMessages = updatedMessages.map(msg => 
            msg.id === newMessage.id ? deliveredMessage : msg
          )
          
          setMessages(prev => ({
            ...prev,
            [conversationId]: updatedDeliveredMessages
          }))
          
          localStorage.setItem(`agriconnect-myanmar-messages-${conversationId}`, JSON.stringify(updatedDeliveredMessages))
        }, 1000)
        
        // Simulate seller response after a delay (for demo purposes)
        // Only simulate response if current user is not the seller
        const storedConversations = JSON.parse(localStorage.getItem('agriconnect-myanmar-conversations') || '[]')
        const currentConversation = storedConversations.find((conv: any) => conv.id === conversationId)
        
        if (currentConversation && currentUser?.id !== currentConversation.sellerId) {
          setTimeout(() => {
            simulateSellerResponse(conversationId, content)
          }, 2000 + Math.random() * 3000) // Random delay between 2-5 seconds
        }
        
        return newMessage
      }
      
      const newMessage = await messagesAPI.send(conversationId, content, messageType)
      
      const transformedMessage: Message = {
        id: newMessage.id,
        conversationId: newMessage.conversation_id,
        senderId: newMessage.sender_id,
        senderName: 'You', // Will be updated by real-time subscription
        content: newMessage.content,
        messageType: newMessage.message_type,
        createdAt: newMessage.created_at
      }
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), transformedMessage]
      }))
      
      return transformedMessage
    } catch (err) {
      console.error('Send message error:', err)
      throw err
    }
  }, [backendAvailable, userId, messages])

  // Start a new conversation
  const startConversation = useCallback(async (sellerId: string, productId: string) => {
    try {
      if (!backendAvailable) {
        // Get real user and product information
        const users = JSON.parse(localStorage.getItem('agriconnect-myanmar-users') || '[]')
        const products = JSON.parse(localStorage.getItem('agriconnect-myanmar-local-products') || '[]')
        
        const seller = users.find((user: any) => user.id === sellerId)
        const product = products.find((prod: any) => prod.id === productId)
        const currentUser = users.find((user: any) => user.id === userId)
        
        // Check if conversation already exists
        const existingConversations = JSON.parse(localStorage.getItem('agriconnect-myanmar-conversations') || '[]')
        const existingConversation = existingConversations.find((conv: any) => 
          conv.buyerId === userId && conv.sellerId === sellerId && conv.productId === productId
        )
        
        if (existingConversation) {
          return existingConversation
        }
        
        // Create new real conversation
        const newConversation: Conversation = {
          id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          buyerId: userId || 'demo-user',
          sellerId,
          productId,
          status: 'active',
          productName: product?.name || 'Product',
          buyerName: currentUser?.name || 'You',
          sellerName: seller?.businessName || seller?.name || 'Seller',
          updatedAt: new Date().toISOString(),
          unreadCount: 0
        }
        
        const updatedConversations = [newConversation, ...existingConversations]
        
        setConversations(updatedConversations)
        localStorage.setItem('agriconnect-myanmar-conversations', JSON.stringify(updatedConversations))
        
        // Create initial greeting message from seller
        const greetingMessage: Message = {
          id: `msg-${Date.now()}`,
          conversationId: newConversation.id,
          senderId: sellerId,
          senderName: seller?.businessName || seller?.name || 'Seller',
          content: `Hello! I saw you're interested in my ${product?.name || 'product'}. How can I help you today?`,
          messageType: 'text',
          createdAt: new Date().toISOString(),
          status: 'sent'
        }
        
        const currentMessages = messages[newConversation.id] || []
        const updatedMessages = [...currentMessages, greetingMessage]
        
        setMessages(prev => ({
          ...prev,
          [newConversation.id]: updatedMessages
        }))
        
        localStorage.setItem(`agriconnect-myanmar-messages-${newConversation.id}`, JSON.stringify(updatedMessages))
        
        return newConversation
      }
      
      const conversation = await conversationsAPI.create(sellerId, productId)
      
      const transformedConversation: Conversation = {
        id: conversation.id,
        buyerId: conversation.buyer_id,
        sellerId: conversation.seller_id,
        productId: conversation.product_id,
        status: conversation.status,
        productName: 'Product', // Will be updated when we fetch full conversations
        buyerName: 'You',
        sellerName: 'Seller',
        updatedAt: conversation.updated_at
      }
      
      setConversations(prev => [transformedConversation, ...prev])
      
      return conversation
    } catch (err) {
      console.error('Start conversation error:', err)
      throw err
    }
  }, [backendAvailable, userId, conversations])

  // Initial fetch - only when we have both userId and backend availability confirmed
  useEffect(() => {
    if (userId && backendAvailable !== undefined) {
      // Simple delay to allow authentication to complete
      const timeoutId = setTimeout(() => {
        fetchConversations()
      }, 500) // Reduced delay for better UX
      
      return () => clearTimeout(timeoutId)
    }
  }, [userId, backendAvailable]) // Remove fetchConversations dependency to prevent loops

  // Set up real-time subscriptions for messages
  useEffect(() => {
    if (!userId || conversations.length === 0 || !backendAvailable) return

    const subscriptions = conversations.map(conversation => {
      return realtimeAPI.subscribeToMessages(conversation.id, (payload) => {
        console.log('Real-time message update:', payload)
        
        if (payload.eventType === 'INSERT') {
          const newMessage: Message = {
            id: payload.new.id,
            conversationId: payload.new.conversation_id,
            senderId: payload.new.sender_id,
            senderName: payload.new.sender?.name || 'Unknown',
            content: payload.new.content,
            messageType: payload.new.message_type,
            createdAt: payload.new.created_at
          }
          
          setMessages(prev => ({
            ...prev,
            [conversation.id]: [...(prev[conversation.id] || []), newMessage]
          }))
        }
      })
    })

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe())
    }
  }, [userId, conversations, backendAvailable])

  // Simulate seller responses for demo purposes
  const simulateSellerResponse = useCallback((conversationId: string, userMessage: string) => {
    const conversations = JSON.parse(localStorage.getItem('agriconnect-myanmar-conversations') || '[]')
    const conversation = conversations.find((conv: any) => conv.id === conversationId)
    
    if (!conversation) return
    
    const users = JSON.parse(localStorage.getItem('agriconnect-myanmar-users') || '[]')
    const seller = users.find((user: any) => user.id === conversation.sellerId)
    
    if (!seller) return
    
    // Generate contextual responses based on user message content
    let responses = []
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      responses = [
        "The current price is very competitive. I can offer special rates for bulk orders.",
        "Let me check the latest pricing for you. Quality comes first in my business.",
        "For the quality I provide, the price is very reasonable. Would you like to discuss quantities?",
        "I always offer fair prices to my customers. What quantity are you looking for?"
      ]
    } else if (lowerMessage.includes('quality') || lowerMessage.includes('fresh') || lowerMessage.includes('organic')) {
      responses = [
        "Quality is my top priority. All products are freshly harvested and carefully selected.",
        "I take great pride in the quality of my products. You can visit my farm anytime to see for yourself.",
        "Everything is organic and fresh. I don't use any harmful chemicals in my farming.",
        "My customers always appreciate the high quality. I have certifications if you'd like to see them."
      ]
    } else if (lowerMessage.includes('delivery') || lowerMessage.includes('shipping') || lowerMessage.includes('transport')) {
      responses = [
        "I can arrange delivery to your location. The cost depends on the distance and quantity.",
        "Yes, I offer delivery services throughout the region. When do you need the products?",
        "Delivery is available. I usually deliver within 24-48 hours for fresh products.",
        "I have reliable transportation. Let me know your location and I'll calculate the delivery cost."
      ]
    } else if (lowerMessage.includes('available') || lowerMessage.includes('stock') || lowerMessage.includes('quantity')) {
      responses = [
        "Yes, I have good stock available right now. How much do you need?",
        "The products are readily available. I just harvested a fresh batch this week.",
        "I maintain good inventory levels. What quantity are you planning to purchase?",
        "Availability is excellent this season. I can provide large quantities if needed."
      ]
    } else if (lowerMessage.includes('visit') || lowerMessage.includes('farm') || lowerMessage.includes('see')) {
      responses = [
        "You're welcome to visit my farm anytime during business hours. I'd be happy to show you around.",
        "I encourage customers to visit and see the quality firsthand. Just let me know when you're coming.",
        "A farm visit would be great! You can see the growing conditions and quality standards yourself.",
        "Feel free to visit. Seeing is believing when it comes to agricultural quality."
      ]
    } else {
      responses = [
        "Thank you for your interest! How can I assist you further?",
        "I'm here to help with any questions about my products.",
        "Let me know if you need more details about anything.",
        "What specific information can I provide for you?",
        "I appreciate your inquiry. What would you like to know more about?",
        "Is there anything specific you'd like to discuss about the product?"
      ]
    }
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    
    const sellerMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      senderId: conversation.sellerId,
      senderName: seller.businessName || seller.name,
      content: randomResponse,
      messageType: 'text',
      createdAt: new Date().toISOString(),
      status: 'sent'
    }
    
    // Get current messages from localStorage to avoid stale state
    const storedMessages = localStorage.getItem(`agriconnect-myanmar-messages-${conversationId}`)
    const currentMessages = storedMessages ? JSON.parse(storedMessages) : []
    const updatedMessages = [...currentMessages, sellerMessage]
    
    // Update state and localStorage
    setMessages(prev => ({
      ...prev,
      [conversationId]: updatedMessages
    }))
    
    localStorage.setItem(`agriconnect-myanmar-messages-${conversationId}`, JSON.stringify(updatedMessages))
    
    // Update conversation
    const updatedConversations = conversations.map((conv: any) => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: sellerMessage,
          updatedAt: new Date().toISOString()
        }
      }
      return conv
    })
    
    localStorage.setItem('agriconnect-myanmar-conversations', JSON.stringify(updatedConversations))
    setConversations(updatedConversations)
  }, []) // Remove messages dependency to avoid stale closures

  return {
    conversations,
    messages,
    loading,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    startConversation
  }
}