import { useCallback } from "react";
import { toast } from "sonner";
import type { Product } from "../data/products";
import { analyticsAPI } from "../services/analytics";

interface UseChatManagementProps {
  currentUser: any;
  allProducts: Product[];
  startConversation: (buyerId: string, sellerId: string, productId: string) => Promise<void>;
  setSelectedChat: (id: string | null) => void;
  setCurrentView: (view: string) => void;
}

export function useChatManagement({
  currentUser,
  allProducts,
  startConversation,
  setSelectedChat,
  setCurrentView,
}: UseChatManagementProps) {

  const handleChat = useCallback(
    async (productId: string) => {
      if (!currentUser) {
        // Simple redirect to login page
        setCurrentView("login");
        return;
      }

      // Chat is now open to all users - no verification blocking
      // Warnings and trust indicators are shown in the chat interface
      try {
        const product = allProducts.find(
          (p) => p.id === productId,
        );
        if (product) {
          // Track inquiry before starting conversation
          try {
            await analyticsAPI.trackInquiry(productId, currentUser.id, product.sellerId, 'chat');
            console.log('📊 Inquiry tracked for product:', product.name);
          } catch (trackingError) {
            console.error('❌ Error tracking inquiry:', trackingError);
            // Don't block the chat if tracking fails
          }

          await startConversation(currentUser.id, product.sellerId, productId);
          setSelectedChat(productId);
        }
      } catch (error) {
        console.error("Failed to start conversation:", error);
        if (
          error instanceof Error &&
          !error.message.includes("Not authenticated")
        ) {
          toast.error(
            "Failed to start conversation. Please try again.",
          );
        }
      }
    },
    [currentUser, allProducts, startConversation, setSelectedChat, setCurrentView],
  );

  return {
    handleChat,
  };
}