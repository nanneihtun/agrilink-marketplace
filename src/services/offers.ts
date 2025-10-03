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
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'completed';
  notes?: string;
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
      .select('*')
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
   * Map database offer to Offer interface
   */
  private static mapOfferFromDB(dbOffer: any): Offer {
    return {
      id: dbOffer.id,
      conversationId: dbOffer.conversation_id,
      productId: dbOffer.product_id,
      productName: dbOffer.product?.name,
      buyerId: dbOffer.buyer_id,
      buyerName: dbOffer.buyer?.name,
      sellerId: dbOffer.seller_id,
      sellerName: dbOffer.seller?.name,
      price: parseFloat(dbOffer.price),
      quantity: dbOffer.quantity,
      unit: dbOffer.unit,
      description: dbOffer.description,
      deliveryTerms: dbOffer.delivery_terms,
      deliveryLocation: dbOffer.delivery_location,
      validUntil: dbOffer.valid_until,
      status: dbOffer.status,
      notes: dbOffer.notes,
      createdAt: dbOffer.created_at,
      updatedAt: dbOffer.updated_at
    };
  }
}
