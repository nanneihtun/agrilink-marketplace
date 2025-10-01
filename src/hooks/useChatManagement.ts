import { useCallback } from "react";
import { toast } from "sonner";
import type { Product } from "../data/products";

interface UseChatManagementProps {
  currentUser: any;
  allProducts: Product[];
  startConversation: (sellerId: string, productId: string) => Promise<void>;
  setSelectedChat: (id: string | null) => void;
  setAuthModal: (modal: "login" | "register" | null) => void;
}

export function useChatManagement({
  currentUser,
  allProducts,
  startConversation,
  setSelectedChat,
  setAuthModal,
}: UseChatManagementProps) {

  const handleChat = useCallback(
    async (productId: string) => {
      console.log('🔍 handleChat called with productId:', productId);
      console.log('🔍 currentUser:', currentUser);
      console.log('🔍 allProducts length:', allProducts.length);
      
      if (!currentUser) {
        console.log('❌ No current user, showing login modal');
        setAuthModal("login");
        return;
      }

      // Chat is now open to all users - no verification blocking
      // Warnings and trust indicators are shown in the chat interface
      try {
        const product = allProducts.find(
          (p) => p.id === productId,
        );
        console.log('🔍 Found product:', product);
        
        if (product) {
          console.log('🔍 Starting conversation with seller:', product.sellerId);
          await startConversation(product.sellerId, productId);
          console.log('🔍 Setting selected chat to:', productId);
          setSelectedChat(productId);
        } else {
          console.error('❌ Product not found:', productId);
          toast.error("Product not found. Please try again.");
        }
      } catch (error) {
        console.error("❌ Failed to start conversation:", error);
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
    [currentUser, allProducts, startConversation, setSelectedChat, setAuthModal],
  );

  return {
    handleChat,
  };
}