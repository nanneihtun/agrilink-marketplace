import { toast } from "sonner";

interface StorageCleanupResult {
  conversationsRemoved: number;
  messagesRemoved: number;
  offersRemoved: number;
  totalBytesFreed: number;
}

/**
 * Comprehensive chat storage cleanup utility
 * Removes old, invalid, and orphaned chat data
 */
export class ChatStorageManager {
  private static readonly RETENTION_DAYS = 30;
  private static readonly MAX_MESSAGES_PER_CONVERSATION = 1000;

  /**
   * Clean up all chat-related storage with detailed reporting
   */
  static async performCleanup(): Promise<StorageCleanupResult> {
    console.log('🧹 Starting comprehensive chat storage cleanup...');
    
    const result: StorageCleanupResult = {
      conversationsRemoved: 0,
      messagesRemoved: 0,
      offersRemoved: 0,
      totalBytesFreed: 0
    };

    const initialStorageSize = this.getStorageSize();

    try {
      // 1. Clean up conversations
      result.conversationsRemoved = await this.cleanupConversations();
      
      // 2. Clean up messages
      result.messagesRemoved = await this.cleanupMessages();
      
      // 3. Clean up offers
      result.offersRemoved = await this.cleanupOffers();
      
      // 4. Remove orphaned data
      await this.removeOrphanedData();
      
      // Calculate bytes freed
      const finalStorageSize = this.getStorageSize();
      result.totalBytesFreed = Math.max(0, initialStorageSize - finalStorageSize);
      
      console.log('✅ Chat storage cleanup completed:', result);
      
      if (result.conversationsRemoved + result.messagesRemoved + result.offersRemoved > 0) {
        toast.success(`Cleaned up ${result.conversationsRemoved + result.messagesRemoved + result.offersRemoved} items`, {
          description: `Freed ${Math.round(result.totalBytesFreed / 1024)} KB of storage space`
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ Failed to cleanup chat storage:', error);
      toast.error('Failed to cleanup chat storage');
      throw error;
    }
  }

  /**
   * Clean up invalid and old conversations
   */
  private static async cleanupConversations(): Promise<number> {
    try {
      const conversations = this.getStoredConversations();
      const cutoffDate = new Date(Date.now() - this.RETENTION_DAYS * 24 * 60 * 60 * 1000);
      
      const validConversations = conversations.filter(conv => {
        // Check if conversation is valid
        if (!conv.id || !conv.productId || !conv.buyerId || !conv.sellerId) {
          return false;
        }
        
        // Check if conversation is recent enough
        const convDate = new Date(conv.updatedAt || conv.createdAt || '2024-01-01');
        if (convDate < cutoffDate) {
          return false;
        }
        
        return true;
      });
      
      const removedCount = conversations.length - validConversations.length;
      
      if (removedCount > 0) {
        localStorage.setItem('agriconnect-myanmar-conversations', JSON.stringify(validConversations));
        console.log(`🗑️ Removed ${removedCount} invalid/old conversations`);
      }
      
      return removedCount;
    } catch (error) {
      console.error('Failed to cleanup conversations:', error);
      // If parsing fails, clear all conversations
      localStorage.removeItem('agriconnect-myanmar-conversations');
      return 1;
    }
  }

  /**
   * Clean up message storage
   */
  private static async cleanupMessages(): Promise<number> {
    try {
      const allKeys = Object.keys(localStorage);
      const messageKeys = allKeys.filter(key => key.startsWith('agriconnect-myanmar-messages-'));
      const validConversations = this.getStoredConversations();
      const validConversationIds = new Set(validConversations.map(c => c.id));
      
      let removedCount = 0;
      const cutoffDate = new Date(Date.now() - this.RETENTION_DAYS * 24 * 60 * 60 * 1000);
      
      for (const key of messageKeys) {
        try {
          const conversationId = key.replace('agriconnect-myanmar-messages-', '');
          
          // Remove messages for non-existent conversations
          if (!validConversationIds.has(conversationId)) {
            localStorage.removeItem(key);
            removedCount++;
            continue;
          }
          
          const messages = JSON.parse(localStorage.getItem(key) || '[]');
          
          // Filter out old and invalid messages
          const validMessages = messages.filter((msg: any) => {
            if (!msg.id || !msg.content || !msg.senderId) {
              return false;
            }
            
            const messageDate = new Date(msg.createdAt || msg.timestamp || '2024-01-01');
            return messageDate > cutoffDate;
          });
          
          // Limit messages per conversation
          const limitedMessages = validMessages.slice(-this.MAX_MESSAGES_PER_CONVERSATION);
          
          const originalCount = messages.length;
          const finalCount = limitedMessages.length;
          
          if (finalCount === 0) {
            localStorage.removeItem(key);
            removedCount += originalCount;
          } else if (finalCount !== originalCount) {
            localStorage.setItem(key, JSON.stringify(limitedMessages));
            removedCount += originalCount - finalCount;
          }
        } catch (error) {
          console.warn(`Failed to process message key ${key}:`, error);
          localStorage.removeItem(key);
          removedCount++;
        }
      }
      
      if (removedCount > 0) {
        console.log(`🗑️ Removed ${removedCount} invalid/old messages`);
      }
      
      return removedCount;
    } catch (error) {
      console.error('Failed to cleanup messages:', error);
      return 0;
    }
  }

  /**
   * Clean up offers storage
   */
  private static async cleanupOffers(): Promise<number> {
    try {
      const offers = this.getStoredOffers();
      const cutoffDate = new Date(Date.now() - this.RETENTION_DAYS * 24 * 60 * 60 * 1000);
      
      const validOffers = offers.filter(offer => {
        // Check if offer is valid
        if (!offer.id || !offer.buyerId || !offer.sellerId || !offer.productId) {
          return false;
        }
        
        // Check if offer is recent enough
        const offerDate = new Date(offer.createdAt || '2024-01-01');
        if (offerDate < cutoffDate) {
          return false;
        }
        
        // Check if offer status indicates it should be kept
        if (offer.status === 'accepted' || offer.status === 'counter_offered') {
          return true;
        }
        
        return true;
      });
      
      const removedCount = offers.length - validOffers.length;
      
      if (removedCount > 0) {
        localStorage.setItem('agriconnect-myanmar-offers', JSON.stringify(validOffers));
        console.log(`🗑️ Removed ${removedCount} invalid/old offers`);
      }
      
      return removedCount;
    } catch (error) {
      console.error('Failed to cleanup offers:', error);
      // If parsing fails, clear all offers
      localStorage.removeItem('agriconnect-myanmar-offers');
      return 1;
    }
  }

  /**
   * Remove orphaned data that references non-existent entities
   */
  private static async removeOrphanedData(): Promise<void> {
    try {
      // Get valid user IDs
      const users = this.getStoredUsers();
      const validUserIds = new Set(users.map(u => u.id));
      
      // Get valid product IDs
      const products = this.getStoredProducts();
      const validProductIds = new Set(products.map(p => p.id));
      
      // Clean conversations that reference non-existent users/products
      const conversations = this.getStoredConversations();
      const validConversations = conversations.filter(conv => 
        validUserIds.has(conv.buyerId) && 
        validUserIds.has(conv.sellerId) && 
        validProductIds.has(conv.productId)
      );
      
      if (validConversations.length !== conversations.length) {
        localStorage.setItem('agriconnect-myanmar-conversations', JSON.stringify(validConversations));
        console.log(`🗑️ Removed ${conversations.length - validConversations.length} orphaned conversations`);
      }
      
      // Clean offers that reference non-existent users/products
      const offers = this.getStoredOffers();
      const validOffers = offers.filter(offer => 
        validUserIds.has(offer.buyerId) && 
        validUserIds.has(offer.sellerId) && 
        validProductIds.has(offer.productId)
      );
      
      if (validOffers.length !== offers.length) {
        localStorage.setItem('agriconnect-myanmar-offers', JSON.stringify(validOffers));
        console.log(`🗑️ Removed ${offers.length - validOffers.length} orphaned offers`);
      }
    } catch (error) {
      console.error('Failed to remove orphaned data:', error);
    }
  }

  /**
   * Complete reset of all chat data
   */
  static async performFullReset(): Promise<void> {
    try {
      console.log('🚨 Performing full chat data reset...');
      
      // Remove all chat-related localStorage items
      const allKeys = Object.keys(localStorage);
      const chatKeys = allKeys.filter(key => 
        key.startsWith('agriconnect-myanmar-messages-') ||
        key === 'agriconnect-myanmar-conversations' ||
        key === 'agriconnect-myanmar-offers'
      );
      
      chatKeys.forEach(key => localStorage.removeItem(key));
      
      // Clear chat-related session storage
      const sessionKeys = Object.keys(sessionStorage);
      const chatSessionKeys = sessionKeys.filter(key =>
        key.includes('chat') || key.includes('conversation') || key.includes('message')
      );
      
      chatSessionKeys.forEach(key => sessionStorage.removeItem(key));
      
      console.log(`🗑️ Removed ${chatKeys.length + chatSessionKeys.length} chat storage items`);
      
      toast.success('All chat data has been reset', {
        description: 'You can now start fresh conversations'
      });
    } catch (error) {
      console.error('❌ Failed to perform full reset:', error);
      toast.error('Failed to reset chat data');
      throw error;
    }
  }

  /**
   * Get storage size in bytes
   */
  private static getStorageSize(): number {
    try {
      return JSON.stringify(localStorage).length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Helper methods to get stored data
   */
  private static getStoredConversations(): any[] {
    try {
      return JSON.parse(localStorage.getItem('agriconnect-myanmar-conversations') || '[]');
    } catch {
      return [];
    }
  }

  private static getStoredOffers(): any[] {
    try {
      return JSON.parse(localStorage.getItem('agriconnect-myanmar-offers') || '[]');
    } catch {
      return [];
    }
  }

  private static getStoredUsers(): any[] {
    try {
      return JSON.parse(localStorage.getItem('agriconnect-myanmar-users') || '[]');
    } catch {
      return [];
    }
  }

  private static getStoredProducts(): any[] {
    try {
      return JSON.parse(localStorage.getItem('agriconnect-myanmar-local-products') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Get chat storage statistics
   */
  static getStorageStats() {
    try {
      const conversations = this.getStoredConversations();
      const offers = this.getStoredOffers();
      const messageKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('agriconnect-myanmar-messages-')
      );
      
      const totalMessageCount = messageKeys.reduce((count, key) => {
        try {
          const messages = JSON.parse(localStorage.getItem(key) || '[]');
          return count + messages.length;
        } catch {
          return count;
        }
      }, 0);
      
      return {
        conversations: conversations.length,
        messageConversations: messageKeys.length,
        totalMessages: totalMessageCount,
        offers: offers.length,
        storageSize: this.getStorageSize()
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        conversations: 0,
        messageConversations: 0,
        totalMessages: 0,
        offers: 0,
        storageSize: 0
      };
    }
  }
}

/**
 * Auto-cleanup function that runs periodically
 */
export const schedulePeriodicCleanup = () => {
  // Check if cleanup has been run recently
  const lastCleanup = localStorage.getItem('agriconnect-last-chat-cleanup');
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  if (!lastCleanup || now - parseInt(lastCleanup) > oneDayMs) {
    // Run cleanup in background
    setTimeout(async () => {
      try {
        await ChatStorageManager.performCleanup();
        localStorage.setItem('agriconnect-last-chat-cleanup', now.toString());
      } catch (error) {
        console.error('Periodic cleanup failed:', error);
      }
    }, 5000); // Delay to not interfere with initial load
  }
};