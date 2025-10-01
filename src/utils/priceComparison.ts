import { Product } from '../data/products';

// Simplified price comparison data generator
export const generatePriceComparisonData = (productName: string, basePrice: number = 45000) => {
  // Create mock sellers for comparison
  const mockSellers = [
    { 
      id: 'mock-1',
      sellerName: 'Irrawaddy Valley Co-op',
      sellerType: 'farmer' as const,
      location: 'Pyay',
      quantity: '200 bags',
      lastUpdated: '3 hours ago'
    },
    { 
      id: 'mock-2',
      sellerName: 'Central Myanmar Trading',
      sellerType: 'trader' as const,
      location: 'Naypyidaw',
      quantity: '500 bags',
      lastUpdated: '1 hour ago'
    },
    { 
      id: 'mock-3',
      sellerName: 'Delta Agriculture Network',
      sellerType: 'farmer' as const,
      location: 'Bogalay',
      quantity: '150 bags',
      lastUpdated: '4 hours ago'
    }
  ];

  // Add price variations
  const mockListings = mockSellers.map(seller => {
    const priceVariation = (Math.random() - 0.5) * 0.15; // ±7.5% variation
    const price = Math.floor(basePrice * (1 + priceVariation));
    return { ...seller, price };
  });

  return mockListings;
};