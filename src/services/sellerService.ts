import { supabase } from '../lib/supabase';

export interface SellerInfo {
  id: string;
  name: string;
  type: 'farmer' | 'trader' | 'buyer';
  accountType: 'individual' | 'business';
  location: string;
  description: string;
  image: string;
  rating: number;
  totalReviews: number;
  yearsActive: number;
  responseTime: string;
  certifications: string[];
  joinedDate: string;
  verified: boolean;
  businessVerified: boolean;
  verificationStatus: string;
  verificationSubmitted: boolean;
  phone: string;
  email: string;
  website: string;
  facebook: string;
  instagram: string;
  telegram: string;
  businessHours: string;
  specialties: string[];
  policies: any;
}

class SellerService {
  /**
   * Fetch seller data by ID from database
   */
  async getSellerById(sellerId: string): Promise<SellerInfo | null> {
    try {
      console.log('🔍 Fetching seller from database:', sellerId);
      
      const { data: seller, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          name,
          user_type,
          account_type,
          location,
          region,
          phone,
          business_name,
          business_description,
          verified,
          phone_verified,
          verification_status,
          verification_submitted,
          rating,
          total_reviews,
          response_time,
          storefront_image,
          website,
          facebook,
          instagram,
          telegram,
          business_hours,
          specialties,
          policies,
          certifications,
          joined_date,
          created_at,
          updated_at
        `)
        .eq('id', sellerId)
        .single();

      if (error) {
        console.error('❌ Error fetching seller:', error);
        return null;
      }

      if (!seller) {
        console.log('⚠️ Seller not found in database:', sellerId);
        return null;
      }

      // Transform database data to frontend format
      const sellerInfo: SellerInfo = {
        id: seller.id,
        name: seller.business_name || seller.name,
        type: seller.user_type,
        accountType: seller.account_type,
        location: seller.location,
        description: seller.business_description || `${seller.user_type} in ${seller.location}`,
        image: seller.storefront_image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop",
        rating: seller.rating || 0,
        totalReviews: seller.total_reviews || 0,
        yearsActive: 1, // Default since experience column doesn't exist
        responseTime: seller.response_time || (seller.user_type === "farmer" ? "3 hours" : "1 hour"),
        certifications: seller.certifications || [],
        joinedDate: seller.joined_date || "Recently",
        verified: seller.verified || false,
        businessVerified: seller.account_type === 'business' && seller.verified,
        verificationStatus: seller.verification_status || 'not_started',
        verificationSubmitted: seller.verification_submitted || false,
        phone: seller.phone || "",
        email: seller.email || "",
        website: seller.website || "",
        facebook: seller.facebook || "",
        instagram: seller.instagram || "",
        telegram: seller.telegram || "",
        businessHours: seller.business_hours || "9 AM - 6 PM, Mon-Sat",
        specialties: seller.specialties || [],
        policies: seller.policies || {
          returns: "",
          delivery: "",
          payment: "",
        },
      };

      console.log('✅ Seller data fetched from database:', sellerInfo.name);
      console.log('🖼️ Storefront image:', sellerInfo.image ? 'Has custom image' : 'Using fallback');
      return sellerInfo;
    } catch (error) {
      console.error('❌ Exception fetching seller:', error);
      return null;
    }
  }
}

export const sellerService = new SellerService();
