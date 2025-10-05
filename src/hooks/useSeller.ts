import { useState, useCallback } from 'react';
import { sellerService, type SellerInfo } from '../services/sellerService';

export const useSeller = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch a single seller by ID
   */
  const getSeller = useCallback(async (sellerId: string): Promise<SellerInfo | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const seller = await sellerService.getSellerById(sellerId);
      return seller;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch seller';
      setError(errorMessage);
      console.error('❌ Error in getSeller:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    getSeller,
    clearError,
  };
};
