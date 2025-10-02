import { useCallback } from "react";
import { toast } from "sonner";
import type { Product } from "../data/products";

interface UseProductManagementProps {
  currentUser: any;
  backendAvailable: boolean;
  backendProducts: Product[];
  localProducts: Product[];
  setLocalProducts: (products: Product[] | ((prev: Product[]) => Product[])) => void;
  createProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setEditingProduct: (product: Product | null) => void;
  setCurrentView: (view: string) => void;
  setPreviousView: (view: string) => void;
  setAuthModal: (modal: "login" | "register" | null) => void;
  currentView: string;
  previousView: string;
}

export function useProductManagement({
  currentUser,
  backendAvailable,
  backendProducts,
  localProducts,
  setLocalProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setEditingProduct,
  setCurrentView,
  setPreviousView,
  setAuthModal,
  currentView,
  previousView,
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

        // Always use backend when Supabase is available
        if (backendAvailable) {
          console.log("🌐 Backend mode: using Supabase API");
          
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
        } else {
          console.log("📱 Local mode: Supabase not available, handling locally");

          // Local mode: handle in localStorage and state only when backend is not available
          if (listing.isEditing) {
            console.log("✏️ Updating existing product locally:", listing.id);
            
            // Clean up the editing flag before storing
            const updatedProduct = { ...listing };
            delete updatedProduct.isEditing;
            
            // Update in local products state
            setLocalProducts((prev) =>
              prev.map((p) => {
                if (p.id === listing.id) {
                  console.log("🔄 Replacing product:", p.id, "with new data");
                  return updatedProduct;
                }
                return p;
              })
            );
          } else {
            console.log("➕ Adding new product locally");
            
            // Clean up any editing flags and create new product
            const cleanedListing = { ...listing };
            delete cleanedListing.isEditing;
            
            // Add new listing to local state with new ID
            const newProduct = {
              ...cleanedListing,
              id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              lastUpdated: new Date().toISOString(),
              sellerId: currentUser?.id || listing.sellerId,
            };
            setLocalProducts((prev) => [newProduct, ...prev]);
            console.log("✅ Added new product:", newProduct.id);
          }

          toast.success(
            listing.isEditing
              ? "Product updated successfully!"
              : "Product added successfully!"
          );
        }

        // Clear editing state and navigate back to where we came from
        console.log(
          "🧹 Clearing editing state and navigating back to:",
          previousView,
        );
        console.log("🧹 Clearing editing state and navigating back to:", previousView);
        setEditingProduct(null);
        
        // Add slight delay to ensure state updates are processed
        setTimeout(() => {
          console.log("📱 Navigating to:", previousView);
          setCurrentView(previousView);
          console.log("✅ Navigation completed");
        }, 100);
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
      backendAvailable,
      backendProducts,
      previousView,
      currentUser,
      setLocalProducts,
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

      // Find the product in allProducts (which includes local and backend products)
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
        // Always use backend when Supabase is available
        if (backendAvailable) {
          console.log("🌐 Backend mode: deleting product via Supabase:", productId);
          await deleteProduct(productId);
          toast.success("Product deleted successfully");
        } else {
          console.log("📱 Local mode: Supabase not available, handling locally");
          // Local mode: handle both local products and sample products
          
          // Check if it's a sample product (starts with 'sample-')
          if (productId.startsWith('sample-')) {
            console.log("🚫 Sample product detected - adding to deletion blacklist:", productId);
            
            // For sample products, we'll track them in localStorage to hide them
            try {
              const hiddenProducts = JSON.parse(localStorage.getItem('agriconnect-myanmar-hidden-sample-products') || '[]');
              if (!hiddenProducts.includes(productId)) {
                hiddenProducts.push(productId);
                localStorage.setItem('agriconnect-myanmar-hidden-sample-products', JSON.stringify(hiddenProducts));
                
                // Trigger a custom event to notify other components
                window.dispatchEvent(new Event('sample-products-changed'));
              }
              console.log("✅ Sample product hidden successfully:", productId);
              toast.success("Sample product removed from display");
            } catch (storageError) {
              console.error("❌ Failed to hide sample product:", storageError);
              toast.error("Failed to remove sample product - storage error");
              return;
            }
          } else {
            // For user-created products, remove from local products
            console.log("📝 Removing user product from local products:", productId);
            setLocalProducts((prev) => prev.filter((p) => p.id !== productId));
            console.log("✅ User product deletion completed:", productId);
            toast.success("Product deleted successfully");
          }
        }
      } catch (error) {
        console.error("❌ Delete product failed:", error);
        toast.error("Failed to delete product");
        throw error;
      }
    },
    [deleteProduct, backendAvailable, backendProducts, setLocalProducts],
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