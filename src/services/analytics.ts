// Analytics service for tracking and retrieving real dashboard data
import { supabase } from '../lib/supabase';
import ENV from '../config/env';

export interface UserAnalytics {
  monthlyInquiries: number;
  monthlyProfileViews: number;
  monthlyProductViews: number;
  totalInquiries: number;
  totalProfileViews: number;
  totalProductViews: number;
}

export interface AnalyticsData {
  currentMonth: UserAnalytics;
  lastMonth: UserAnalytics;
  growth: {
    inquiries: number;
    profileViews: number;
    productViews: number;
  };
}

export const analyticsAPI = {
  // Get user analytics for dashboard
  getUserAnalytics: async (userId: string): Promise<AnalyticsData> => {
    try {
      if (!ENV.isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
      }

      const currentDate = new Date();
      const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

      // Get current month inquiries
      const { data: currentInquiries, error: currentInqError } = await supabase
        .from('inquiries')
        .select('id')
        .eq('seller_id', userId)
        .gte('created_at', currentMonthStart.toISOString());

      // Get last month inquiries
      const { data: lastInquiries, error: lastInqError } = await supabase
        .from('inquiries')
        .select('id')
        .eq('seller_id', userId)
        .gte('created_at', lastMonthStart.toISOString())
        .lt('created_at', lastMonthEnd.toISOString());

      // Get current month profile views
      const { data: currentProfileViews, error: currentPvError } = await supabase
        .from('profile_views')
        .select('id')
        .eq('viewed_user_id', userId)
        .gte('viewed_at', currentMonthStart.toISOString());

      // Get last month profile views
      const { data: lastProfileViews, error: lastPvError } = await supabase
        .from('profile_views')
        .select('id')
        .eq('viewed_user_id', userId)
        .gte('viewed_at', lastMonthStart.toISOString())
        .lt('viewed_at', lastMonthEnd.toISOString());

      // Get current month product views
      const { data: currentProductViews, error: currentProdVError } = await supabase
        .from('product_views')
        .select('id, products!inner(seller_id)')
        .eq('products.seller_id', userId)
        .gte('viewed_at', currentMonthStart.toISOString());

      // Get last month product views
      const { data: lastProductViews, error: lastProdVError } = await supabase
        .from('product_views')
        .select('id, products!inner(seller_id)')
        .eq('products.seller_id', userId)
        .gte('viewed_at', lastMonthStart.toISOString())
        .lt('viewed_at', lastMonthEnd.toISOString());

      // Calculate counts
      const currentMonthInquiries = currentInquiries?.length || 0;
      const lastMonthInquiries = lastInquiries?.length || 0;
      const currentMonthProfileViews = currentProfileViews?.length || 0;
      const lastMonthProfileViews = lastProfileViews?.length || 0;
      const currentMonthProductViews = currentProductViews?.length || 0;
      const lastMonthProductViews = lastProductViews?.length || 0;

      // Calculate growth percentages
      const calculateGrowth = (current: number, last: number) => {
        if (last === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - last) / last) * 100);
      };

      const growth = {
        inquiries: calculateGrowth(currentMonthInquiries, lastMonthInquiries),
        profileViews: calculateGrowth(currentMonthProfileViews, lastMonthProfileViews),
        productViews: calculateGrowth(currentMonthProductViews, lastMonthProductViews)
      };

      return {
        currentMonth: {
          monthlyInquiries: currentMonthInquiries,
          monthlyProfileViews: currentMonthProfileViews,
          monthlyProductViews: currentMonthProductViews,
          totalInquiries: currentMonthInquiries,
          totalProfileViews: currentMonthProfileViews,
          totalProductViews: currentMonthProductViews
        },
        lastMonth: {
          monthlyInquiries: lastMonthInquiries,
          monthlyProfileViews: lastMonthProfileViews,
          monthlyProductViews: lastMonthProductViews,
          totalInquiries: 0,
          totalProfileViews: 0,
          totalProductViews: 0
        },
        growth
      };

    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  },

  // Track profile view
  trackProfileView: async (viewedUserId: string, viewerUserId?: string): Promise<void> => {
    try {
      if (!ENV.isSupabaseConfigured()) {
        return;
      }

      const { error } = await supabase
        .from('profile_views')
        .insert({
          viewed_user_id: viewedUserId,
          viewer_user_id: viewerUserId || null
        });

      if (error) {
        console.error('Error tracking profile view:', error);
      }
    } catch (error) {
      console.error('Error tracking profile view:', error);
    }
  },

  // Track product view
  trackProductView: async (productId: string, viewerUserId?: string): Promise<void> => {
    try {
      if (!ENV.isSupabaseConfigured()) {
        return;
      }

      const { error } = await supabase
        .from('product_views')
        .insert({
          product_id: productId,
          viewer_user_id: viewerUserId || null
        });

      if (error) {
        console.error('Error tracking product view:', error);
      }
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  },

  // Track inquiry/message
  trackInquiry: async (productId: string, buyerId: string, sellerId: string, inquiryType: string = 'message'): Promise<string> => {
    try {
      if (!ENV.isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('inquiries')
        .insert({
          product_id: productId,
          buyer_id: buyerId,
          seller_id: sellerId,
          inquiry_type: inquiryType
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error tracking inquiry:', error);
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error tracking inquiry:', error);
      throw error;
    }
  },

  // Get recent inquiries for a user
  getRecentInquiries: async (userId: string, limit: number = 10) => {
    try {
      if (!ENV.isSupabaseConfigured()) {
        return [];
      }

      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          id,
          inquiry_type,
          created_at,
          is_read,
          products!inner(name, price),
          buyer:users!inquiries_buyer_id_fkey(name, user_type)
        `)
        .eq('seller_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent inquiries:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching recent inquiries:', error);
      return [];
    }
  }
};
