import { supabase } from '../lib/supabase';

export interface Offer {
  id: string;
  conversationId: string;
  productId: string;
  productName?: string;
  buyerId: string;
  buyerName?: string;
  sellerId: string;
  sellerName?: string;
  price: number;
  quantity: number;
  unit: string;
  description?: string;
  deliveryTerms?: string;
  deliveryLocation?: string;
  validUntil: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  notes?: string;
  // Transaction tracking fields
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  shippingStatus?: 'pending' | 'shipped' | 'delivered';
  trackingNumber?: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  // Timestamps for each stage
  acceptedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export class OffersService {
  /**
   * Create a new offer
   */
  static async createOffer(offerData: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Offer> {
    const { data, error } = await supabase
      .from('offers')
      .insert({
        conversation_id: offerData.conversationId,
        product_id: offerData.productId,
        buyer_id: offerData.buyerId,
        seller_id: offerData.sellerId,
        price: offerData.price,
        quantity: offerData.quantity,
        unit: offerData.unit,
        description: offerData.description,
        delivery_terms: offerData.deliveryTerms,
        delivery_location: offerData.deliveryLocation,
        valid_until: offerData.validUntil,
        status: offerData.status,
        notes: offerData.notes
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to create offer:', error);
      throw error;
    }

    return this.mapOfferFromDB(data);
  }

  /**
   * Get offers for a conversation
   */
  static async getOffersForConversation(conversationId: string): Promise<Offer[]> {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        product:products!offers_product_id_fkey(id, name),
        buyer:users!offers_buyer_id_fkey(id, name),
        seller:users!offers_seller_id_fkey(id, name)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Failed to fetch offers:', error);
      throw error;
    }

    return data.map(offer => this.mapOfferFromDB(offer));
  }

  /**
   * Update offer status
   */
  static async updateOfferStatus(
    offerId: string, 
    status: Offer['status'], 
    updates: Partial<Pick<Offer, 'notes' | 'deliveryTerms' | 'deliveryLocation'>>
  ): Promise<Offer> {
    const updateData: any = { status };
    
    if (updates.notes) updateData.notes = updates.notes;
    if (updates.deliveryTerms) updateData.delivery_terms = updates.deliveryTerms;
    if (updates.deliveryLocation) updateData.delivery_location = updates.deliveryLocation;

    const { data, error } = await supabase
      .from('offers')
      .update(updateData)
      .eq('id', offerId)
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to update offer:', error);
      throw error;
    }

    return this.mapOfferFromDB(data);
  }

  /**
   * Get offers for a user (buyer or seller)
   */
  static async getUserOffers(userId: string): Promise<Offer[]> {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        product:products!offers_product_id_fkey(id, name),
        buyer:users!offers_buyer_id_fkey(id, name),
        seller:users!offers_seller_id_fkey(id, name)
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Failed to fetch user offers:', error);
      throw error;
    }

    return data.map(offer => this.mapOfferFromDB(offer));
  }

  /**
   * Delete an offer
   */
  static async deleteOffer(offerId: string): Promise<void> {
    const { error } = await supabase
      .from('offers')
      .delete()
      .eq('id', offerId);

    if (error) {
      console.error('❌ Failed to delete offer:', error);
      throw error;
    }
  }

  /**
   * Update offer status with tracking
   */
  static async updateOfferStatus(
    offerId: string, 
    status: Offer['status'],
    updates?: {
      paymentStatus?: Offer['paymentStatus'];
      shippingStatus?: Offer['shippingStatus'];
      trackingNumber?: string;
      deliveryAddress?: string;
      paymentMethod?: string;
    }
  ): Promise<Offer> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    // Add timestamp based on status
    switch (status) {
      case 'accepted':
        updateData.accepted_at = new Date().toISOString();
        break;
      case 'shipped':
        updateData.shipped_at = new Date().toISOString();
        break;
      case 'delivered':
        updateData.delivered_at = new Date().toISOString();
        break;
      case 'completed':
        updateData.completed_at = new Date().toISOString();
        break;
    }

    // Add additional updates - convert camelCase to snake_case for database
    if (updates) {
      if (updates.paymentStatus) {
        updateData.payment_status = updates.paymentStatus;
      }
      if (updates.shippingStatus) {
        updateData.shipping_status = updates.shippingStatus;
      }
      if (updates.trackingNumber) {
        updateData.tracking_number = updates.trackingNumber;
      }
      if (updates.deliveryAddress) {
        updateData.delivery_address = updates.deliveryAddress;
      }
      if (updates.paymentMethod) {
        updateData.payment_method = updates.paymentMethod;
      }
    }

    const { data, error } = await supabase
      .from('offers')
      .update(updateData)
      .eq('id', offerId)
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to update offer status:', error);
      throw error;
    }

    return this.mapOfferFromDB(data);
  }

  /**
   * Get offers by user with filtering
   */
  static async getOffersByUser(
    userId: string, 
    filters?: {
      status?: Offer['status'];
      role?: 'buyer' | 'seller';
    }
  ): Promise<Offer[]> {
    let query = supabase
      .from('offers')
      .select(`
        *,
        product:products(name),
        buyer:users!offers_buyer_id_fkey(id, name, email),
        seller:users!offers_seller_id_fkey(id, name, email)
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.role) {
      if (filters.role === 'buyer') {
        query = query.eq('buyer_id', userId);
      } else {
        query = query.eq('seller_id', userId);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Failed to fetch user offers:', error);
      throw error;
    }

    return data.map(offer => this.mapOfferFromDB(offer));
  }

  /**
   * Map database offer to Offer interface
   */
  private static mapOfferFromDB(dbOffer: any): Offer {
    // Debug logging to see what data we're getting
    console.log('🔍 Mapping offer from DB:', {
      id: dbOffer.id,
      product: dbOffer.product,
      buyer: dbOffer.buyer,
      seller: dbOffer.seller,
      price: dbOffer.price
    });

    return {
      id: dbOffer.id,
      conversationId: dbOffer.conversation_id,
      productId: dbOffer.product_id,
      productName: dbOffer.product?.name || 'Unknown Product',
      buyerId: dbOffer.buyer_id,
      buyerName: dbOffer.buyer?.name || 'Unknown Buyer',
      sellerId: dbOffer.seller_id,
      sellerName: dbOffer.seller?.name || 'Unknown Seller',
      price: parseFloat(dbOffer.price),
      quantity: dbOffer.quantity,
      unit: dbOffer.unit,
      description: dbOffer.description,
      deliveryTerms: dbOffer.delivery_terms,
      deliveryLocation: dbOffer.delivery_location,
      validUntil: dbOffer.valid_until,
      status: dbOffer.status,
      notes: dbOffer.notes,
      // Transaction tracking fields
      paymentStatus: dbOffer.payment_status,
      shippingStatus: dbOffer.shipping_status,
      trackingNumber: dbOffer.tracking_number,
      deliveryAddress: dbOffer.delivery_address,
      paymentMethod: dbOffer.payment_method,
      // Timestamps for each stage
      acceptedAt: dbOffer.accepted_at,
      shippedAt: dbOffer.shipped_at,
      deliveredAt: dbOffer.delivered_at,
      completedAt: dbOffer.completed_at,
      createdAt: dbOffer.created_at,
      updatedAt: dbOffer.updated_at
    };
  }
}
