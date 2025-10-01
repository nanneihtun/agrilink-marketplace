// Product type definitions for AgriLink marketplace
// Simplified product structure - each product is now standalone (no variations)

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  price: number;
  unit: string;
  location: string;
  region?: string;
  sellerType: 'farmer' | 'trader';
  sellerName: string;
  image?: string; // Keep for backward compatibility
  images?: string[]; // Multiple images support
  quantity: string; // Available quantity (e.g., "100 bags", "50 kg")
  minimumOrder: string; // Minimum order requirement
  availableQuantity: string; // Total available stock description
  deliveryOptions: string[]; // Available delivery methods
  paymentTerms: string[]; // Accepted payment methods
  category?: string;
  description?: string;
  additionalNotes?: string; // Extra notes or special conditions
  priceChange?: number; // Percentage change in price from last week
  lastUpdated: string;
  isEditing?: boolean;
}

// Empty products array - users will create their own products
export const products: Product[] = [];