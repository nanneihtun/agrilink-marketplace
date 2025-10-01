// Helper functions for testing the real chat system

export const createDemoConversation = (currentUserId: string, otherUserId: string, productId: string) => {
  // Get stored data
  const users = JSON.parse(localStorage.getItem('agriconnect-myanmar-users') || '[]');
  const products = JSON.parse(localStorage.getItem('agriconnect-myanmar-local-products') || '[]');
  
  const otherUser = users.find((user: any) => user.id === otherUserId);
  const product = products.find((prod: any) => prod.id === productId);
  
  if (!otherUser || !product) {
    console.error('User or product not found for demo conversation');
    return null;
  }

  // Create conversation
  const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const conversation = {
    id: conversationId,
    buyerId: currentUserId,
    sellerId: otherUserId,
    productId: productId,
    status: 'active',
    productName: product.name,
    buyerName: 'You',
    sellerName: otherUser.businessName || otherUser.name,
    updatedAt: new Date().toISOString(),
    unreadCount: 0
  };

  // Create initial messages
  const messages = [
    {
      id: `msg-${Date.now()}-1`,
      conversationId: conversationId,
      senderId: otherUserId,
      senderName: otherUser.businessName || otherUser.name,
      content: `Hello! I saw you're interested in my ${product.name}. How can I help you today?`,
      messageType: 'text',
      createdAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      status: 'sent'
    },
    {
      id: `msg-${Date.now()}-2`,
      conversationId: conversationId,
      senderId: currentUserId,
      senderName: 'You',
      content: `Hi! Yes, I'm interested in your ${product.name}. What's the current availability and pricing?`,
      messageType: 'text',
      createdAt: new Date(Date.now() - 240000).toISOString(), // 4 minutes ago
      status: 'sent'
    },
    {
      id: `msg-${Date.now()}-3`,
      conversationId: conversationId,
      senderId: otherUserId,
      senderName: otherUser.businessName || otherUser.name,
      content: `Great! I have plenty available. The current price is ${product.price?.toLocaleString()} MMK per ${product.unit}. For bulk orders over 50kg, I can offer a 10% discount.`,
      messageType: 'text',
      createdAt: new Date(Date.now() - 180000).toISOString(), // 3 minutes ago
      status: 'sent'
    }
  ];

  // Store conversation
  const existingConversations = JSON.parse(localStorage.getItem('agriconnect-myanmar-conversations') || '[]');
  existingConversations.push(conversation);
  localStorage.setItem('agriconnect-myanmar-conversations', JSON.stringify(existingConversations));

  // Store messages
  localStorage.setItem(`agriconnect-myanmar-messages-${conversationId}`, JSON.stringify(messages));

  console.log(`✅ Created demo conversation between user ${currentUserId} and ${otherUser.name} about ${product.name}`);
  return conversation;
};

export const createMultipleDemoConversations = (currentUserId: string) => {
  const users = JSON.parse(localStorage.getItem('agriconnect-myanmar-users') || '[]');
  const products = JSON.parse(localStorage.getItem('agriconnect-myanmar-local-products') || '[]');
  
  // Find other users and products to create conversations with
  const otherUsers = users.filter((user: any) => user.id !== currentUserId);
  
  if (otherUsers.length === 0 || products.length === 0) {
    console.log('❌ No other users or products found to create demo conversations');
    return;
  }

  // Create up to 3 demo conversations
  const conversationsToCreate = Math.min(3, otherUsers.length, products.length);
  
  for (let i = 0; i < conversationsToCreate; i++) {
    const otherUser = otherUsers[i % otherUsers.length];
    const product = products[i % products.length];
    
    createDemoConversation(currentUserId, otherUser.id, product.id);
  }

  console.log(`✅ Created ${conversationsToCreate} demo conversations for user ${currentUserId}`);
};

// Helper to clear all conversations (for testing)
export const clearAllConversations = () => {
  localStorage.removeItem('agriconnect-myanmar-conversations');
  
  // Remove all message storage
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('agriconnect-myanmar-messages-')) {
      localStorage.removeItem(key);
    }
  });
  
  console.log('🧹 Cleared all conversations and messages');
};