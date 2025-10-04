import { useCallback } from "react";
import { toast } from "sonner";
import type { Product } from "../data/products";

interface UseProductManagementProps {
  currentUser: any;
  createProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setEditingProduct: (product: Product | null) => void;
  setCurrentView: (view: string) => void;
  setPreviousView: (view: string) => void;
  setAuthModal: (modal: "login" | "register" | null) => void;
  currentView: string;
  previousView: string;
  allProducts: Product[];
}

export function useProductManagement({
  currentUser,
  createProduct,
  updateProduct,
  deleteProduct,
  setEditingProduct,
  setCurrentView,
  setPreviousView,
  setAuthModal,
  currentView,
  previousView,
  allProducts,
}: UseProductManagementProps) {

  const handleAddListing = useCallback(
    async (listing: Product) => {
      try {
        console.log("🚀 handleAddListing called with:", {
          productId: listing.id,
          productName: listing.name,
          price: listing.price,
          priceType: typeof listing.price,
          isEditing: listing.isEditing,
          hasImage: !!listing.image,
          imageSize: listing.image?.length || 0,
          totalSize: JSON.stringify(listing).length,
        });

        // Always use Supabase backend
        console.log("🌐 Using Supabase API");
        
        // Clean up the editing flag before sending to backend
        const cleanedListing = { ...listing };
        delete cleanedListing.isEditing;
        
        if (listing.isEditing) {
          console.log("✏️ Updating existing product via Supabase:", listing.id);
          console.log("📝 Product update data:", {
            id: listing.id,
            name: listing.name,
            price: listing.price,
            location: listing.location
          });
          
          await updateProduct(listing.id, cleanedListing);
          toast.success("Product updated successfully!");
        } else {
          console.log("➕ Creating new product via Supabase");
          await createProduct(cleanedListing);
          toast.success("Product added successfully!");
        }

        // Clear editing state and navigate back to where we came from
        console.log(
          "🧹 Clearing editing state and navigating back to:",
          previousView,
        );
        setEditingProduct(null);
        
        // Navigate immediately without setTimeout to prevent window blur issues
        console.log("📱 Navigating to:", previousView);
        setCurrentView(previousView);
        console.log("✅ Navigation completed");
      } catch (error) {
        console.error("❌ Product operation failed:", error);

        if (error instanceof Error) {
          toast.error(
            `Failed to save product: ${error.message}`,
          );
        } else {
          toast.error(
            "Failed to save product. Please try again.",
          );
        }
        throw error;
      }
    },
    [
      createProduct,
      updateProduct,
      previousView,
      currentUser,
      setEditingProduct,
      setCurrentView,
    ],
  );

  const handleEditListing = useCallback(
    (product: Product, allProducts: Product[]) => {
      console.log("✏️ Edit Product:", product.id);
      if (!currentUser) {
        setAuthModal("login");
        return;
      }

      // Only allow farmers and traders to edit listings
      if (currentUser.userType === "buyer") {
        return;
      }

      // Find the product in allProducts
      const productToEdit = allProducts.find((p) => p.id === product.id);

      if (!productToEdit) {
        console.error("❌ Product not found:", product.id);
        toast.error("Product not found. Please refresh and try again.");
        return;
      }

      console.log("📦 Product to edit:", {
        id: productToEdit.id,
        name: productToEdit.name,
        description: productToEdit.description?.substring(0, 50) + "..." || "None",
        category: productToEdit.category || "None",
        hasImage: !!productToEdit.image,
      });

      console.log("💰 Price debug - Product to edit:", {
        price: productToEdit.price,
        priceType: typeof productToEdit.price
      });

      setEditingProduct(productToEdit);
      setPreviousView(currentView);
      setCurrentView("add-listing");
    },
    [
      currentUser,
      setAuthModal,
      setEditingProduct,
      setPreviousView,
      setCurrentView,
      currentView,
    ],
  );

  const handleShowAddListing = useCallback(() => {
    console.log("🚀 handleShowAddListing called");
    console.log(
      "Current user:",
      currentUser?.email,
      currentUser?.userType,
    );
    console.log("Current view:", currentView);

    if (!currentUser) {
      console.log("❌ No current user - showing login modal");
      setAuthModal("login");
      return;
    }

    // Only allow farmers and traders to create listings
    if (currentUser.userType === "buyer") {
      console.log("❌ User is buyer - cannot create listings");
      return;
    }

    console.log("✅ Setting up add listing form");
    setEditingProduct(null);
    setPreviousView(currentView);
    setCurrentView("add-listing");
    console.log("✅ View changed to add-listing");
  }, [currentView, currentUser, setAuthModal, setEditingProduct, setPreviousView, setCurrentView]);

  const handleDeleteListing = useCallback(
    async (productId: string) => {
      console.log("🗑️ Deleting product:", productId);
      try {
        // Always use Supabase backend
        console.log("🌐 Deleting product via Supabase:", productId);
        await deleteProduct(productId);
        toast.success("Product deleted successfully");
      } catch (error) {
        console.error("❌ Delete product failed:", error);
        toast.error("Failed to delete product");
        throw error;
      }
    },
    [deleteProduct],
  );

  const handleBackFromAddListing = useCallback(() => {
    setEditingProduct(null);
    setCurrentView(previousView);
  }, [previousView, setEditingProduct, setCurrentView]);

  return {
    handleAddListing,
    handleEditListing,
    handleShowAddListing,
    handleDeleteListing,
    handleBackFromAddListing,
  };
}