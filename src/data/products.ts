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

// Sample products to demonstrate the platform - will be supplemented by user-created products
export const products: Product[] = [
  {
    id: 'sample-rice-001',
    sellerId: 'farmer-thura-001',
    name: 'Premium Jasmine Rice - 50kg',
    price: 45000,
    unit: '50 kg bag',
    location: 'Bago',
    region: 'Bago Region', 
    sellerType: 'farmer',
    sellerName: 'Ko Thura Min',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=500&h=400&fit=crop'
    ],
    quantity: '500 bags available',
    minimumOrder: '10 bags minimum',
    availableQuantity: '500 bags in stock',
    deliveryOptions: ['Pickup', 'Local Delivery (Within 10km)', 'Regional Delivery'],
    paymentTerms: ['Cash on Pickup', 'Bank Transfer', '50% Advance, 50% on Delivery'],
    category: 'rice',
    description: 'Premium quality jasmine rice grown using traditional farming methods in Bago Region. Each grain is carefully selected for exceptional aroma and taste. Our rice is perfect for restaurants, hotels, and wholesale buyers looking for consistent quality and authentic Myanmar jasmine rice.',
    additionalNotes: 'Harvest date: January 2024. Storage in controlled environment.',
    priceChange: -2.1, // Price decreased by 2.1% (favorable for buyers)
    lastUpdated: (() => new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString())(), // 2 days ago
  },
  {
    id: 'sample-vegetables-001',
    sellerId: 'farmer-su-002',
    name: 'Fresh Tomatoes - 25kg',
    price: 18000,
    unit: '25 kg crate',
    location: 'Mandalay',
    region: 'Mandalay Region',
    sellerType: 'farmer',
    sellerName: 'Ma Su Hlaing',
    image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=500&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&h=400&fit=crop'
    ],
    quantity: '200 crates available',
    minimumOrder: '5 crates minimum',
    availableQuantity: '200 crates fresh daily',
    deliveryOptions: ['Pickup', 'Local Delivery (Within 10km)', 'Express Delivery'],
    paymentTerms: ['Cash on Pickup', 'Mobile Payment', 'Cash on Delivery'],
    category: 'vegetables',
    description: 'Fresh, vine-ripened tomatoes harvested daily from our organic farm. Perfect for markets, restaurants, and food processing. Rich color and excellent taste.',
    additionalNotes: 'Harvested fresh every morning. Best consumed within 5 days.',
    priceChange: 1.5, // Price increased by 1.5% (seasonal variation)
    lastUpdated: (() => new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString())(), // 1 day ago
  },
  {
    id: 'sample-spices-001',
    sellerId: 'trader-kyaw-003',
    name: 'Premium Turmeric Powder - 10kg',
    price: 25000,
    unit: '10 kg sack',
    location: 'Yangon',
    region: 'Yangon Region',
    sellerType: 'trader',
    sellerName: 'Ko Kyaw Zin',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1609501676725-7186f63e1099?w=500&h=400&fit=crop'
    ],
    quantity: '100 sacks available',
    minimumOrder: '3 sacks minimum',
    availableQuantity: '100 sacks in warehouse',
    deliveryOptions: ['Pickup', 'Nationwide Shipping', 'Local Delivery (Within 10km)'],
    paymentTerms: ['Bank Transfer', '30% Advance, 70% on Delivery', 'Cash on Pickup'],
    category: 'spices',
    description: 'High-quality turmeric powder sourced from trusted farmers in Sagaing Region. Finely ground, vibrant color, and strong aroma. Perfect for cooking and export.',
    additionalNotes: 'Processed and packaged in clean facility. 18-month shelf life.',
    priceChange: -0.8, // Price slightly decreased (market competition)
    lastUpdated: (() => new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())(), // 3 days ago
  },
  {
    id: 'sample-fruits-001', 
    sellerId: 'farmer-min-004',
    name: 'Dragon Fruit - 20kg',
    price: 32000,
    unit: '20 kg box',
    location: 'Magway',
    region: 'Magway Region',
    sellerType: 'farmer',
    sellerName: 'Ko Min Oo',
    image: 'https://images.unsplash.com/photo-1526318896980-cf78ec5c3fce?w=500&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1526318896980-cf78ec5c3fce?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=500&h=400&fit=crop'
    ],
    quantity: '80 boxes available',
    minimumOrder: '5 boxes minimum',
    availableQuantity: '80 boxes ready for harvest',
    deliveryOptions: ['Pickup', 'Cold Chain Transport', 'Express Delivery'],
    paymentTerms: ['Cash on Pickup', 'Bank Transfer', '50% Advance, 50% on Delivery'],
    category: 'fruits',
    description: 'Sweet and fresh dragon fruit grown in controlled environment. Perfect size and ripeness for retail and wholesale. High nutrition value and exotic taste.',
    additionalNotes: 'Harvest twice weekly. Best consumed within 7 days. Export quality.',
    lastUpdated: (() => new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString())(), // 5 hours ago
  }
];