import { useMemo } from 'react';
import { Product } from '../data/products';
import { getRegionFromCity } from '../utils/regions';

export interface FilterState {
  search: string;
  category: string;
  location: string; // Keep for backward compatibility
  region: string;
  city: string;
  sellerType: string;
  verifiedStatus: string;
  priceRange: string;
  sortBy: string;
}

export const useProductFiltering = (products: Product[], filters: FilterState, isSellerVerified?: (sellerId: string) => boolean) => {
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !filters.search || 
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.sellerName.toLowerCase().includes(filters.search.toLowerCase());
      
      // Updated location matching logic
      let matchesLocation = true;
      
      // If region is selected
      if (filters.region && filters.region !== 'all') {
        const productRegion = getRegionFromCity(product.location);
        matchesLocation = productRegion === filters.region;
      }
      
      // If city is selected (more specific than region)
      if (filters.city && filters.city !== 'all') {
        matchesLocation = product.location === filters.city;
      }
      
      // Backward compatibility with old location filter
      if (filters.location && filters.location !== 'all') {
        matchesLocation = product.location === filters.location;
      }
      
      const matchesSellerType = !filters.sellerType || filters.sellerType === 'all' || 
        product.sellerType === filters.sellerType;

      // Verification status filtering
      let matchesVerificationStatus = true;
      if (filters.verifiedStatus && filters.verifiedStatus !== 'all' && isSellerVerified) {
        const sellerVerified = isSellerVerified(product.sellerId);
        if (filters.verifiedStatus === 'verified') {
          matchesVerificationStatus = sellerVerified;
        } else if (filters.verifiedStatus === 'unverified') {
          matchesVerificationStatus = !sellerVerified;
        }
      }

      // Category filtering
      const matchesCategory = !filters.category || filters.category === 'all' || 
        (product.category && product.category.toLowerCase().includes(filters.category.toLowerCase()));

      // Price range filtering
      let matchesPriceRange = true;
      if (filters.priceRange && filters.priceRange !== 'all') {
        const price = product.price;
        switch (filters.priceRange) {
          case '0-50000':
            matchesPriceRange = price >= 0 && price <= 50000;
            break;
          case '50000-100000':
            matchesPriceRange = price > 50000 && price <= 100000;
            break;
          case '100000-200000':
            matchesPriceRange = price > 100000 && price <= 200000;
            break;
          case '200000+':
            matchesPriceRange = price > 200000;
            break;
        }
      }

      return matchesSearch && matchesLocation && matchesSellerType && matchesVerificationStatus && matchesCategory && matchesPriceRange;
    }).sort((a, b) => {
      // Apply sorting
      switch (filters.sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'location':
          return a.location.localeCompare(b.location);
        case 'newest':
        default:
          // Sort by lastUpdated date (newest first)
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      }
    });
  }, [products, filters, isSellerVerified]);

  const getActiveFiltersCount = useMemo(() => {
    // Count only non-default, non-empty filter values
    let count = 0;
    
    // Search filter
    if (filters.search && filters.search.trim() !== '') {
      count++;
    }
    
    // Category filter
    if (filters.category && filters.category !== '' && filters.category !== 'all') {
      count++;
    }
    
    // Location filters (legacy and new) - Only count one location filter at a time
    if (filters.city && filters.city !== '' && filters.city !== 'all') {
      count++; // City is most specific, count it
    } else if (filters.region && filters.region !== '' && filters.region !== 'all') {
      count++; // Region is next most specific
    } else if (filters.location && filters.location !== '' && filters.location !== 'all') {
      count++; // Legacy location filter
    }
    
    // Seller type filter
    if (filters.sellerType && filters.sellerType !== '' && filters.sellerType !== 'all') {
      count++;
    }
    
    // Verification status filter
    if (filters.verifiedStatus && filters.verifiedStatus !== '' && filters.verifiedStatus !== 'all') {
      count++;
    }
    
    // Price range filter
    if (filters.priceRange && filters.priceRange !== '' && filters.priceRange !== 'all') {
      count++;
    }
    
    // Don't count sortBy as an active filter since it's always set to something
    
    return count;
  }, [filters]);

  return { filteredProducts, getActiveFiltersCount };
};