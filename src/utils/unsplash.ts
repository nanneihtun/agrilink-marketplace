// Utility wrapper for unsplash_tool to handle image search
export async function unsplash_tool({ query }: { query: string }): Promise<string> {
  try {
    // In a real implementation, this would call the actual unsplash_tool
    // For now, we'll return agricultural placeholder images based on the query
    const agriculturalImages = [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop', // Rice
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop', // Vegetables
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop', // Grains
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', // Fruits
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&h=300&fit=crop', // Farming
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', // Agriculture
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop', // Beans
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop', // Spices
    ];

    // Select first image for consistency
    const randomImage = agriculturalImages[0];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return randomImage;
  } catch (error) {
    console.error('Unsplash image search failed:', error);
    // Return a default agricultural image
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop';
  }
}