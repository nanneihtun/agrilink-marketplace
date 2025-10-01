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
      if (!currentUser) {
        setAuthModal("login");
        return;
      }

      // Chat is now open to all users - no verification blocking
      // Warnings and trust indicators are shown in the chat interface
      try {
        const product = allProducts.find(
          (p) => p.id === productId,
        );
        if (product) {
          await startConversation(product.sellerId, productId);
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
    [currentUser, allProducts, startConversation, setSelectedChat, setAuthModal],
  );

  return {
    handleChat,
  };
}