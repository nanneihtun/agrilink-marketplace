import { supabase } from '../lib/supabase';

export interface ReviewData {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  product_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer_name: string;
}

export interface SellerStats {
  rating: number;
  totalReviews: number;
  responseTime: string;
  recentReviews: ReviewData[];
}

export class ReviewsService {
  /**
   * Get seller statistics including rating, review count, and response time
   */
  static async getSellerStats(sellerId: string): Promise<SellerStats> {
    try {
      console.log('🔍 ReviewsService: Fetching stats for sellerId:', sellerId);
      
      // Get user's current rating and review count
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('rating, total_reviews, response_time')
        .eq('id', sellerId)
        .single();

      console.log('📊 ReviewsService: User data:', userData, 'Error:', userError);

      if (userError) {
        console.error('Error fetching user data:', userError);
        return this.getDefaultStats();
      }

      // Get recent reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          reviewer_id,
          reviewee_id,
          product_id,
          rating,
          comment,
          created_at,
          reviewer:users!reviews_reviewer_id_fkey(name)
        `)
        .eq('reviewee_id', sellerId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
      }

      // Calculate actual response time from messages
      const responseTime = await this.calculateResponseTime(sellerId);

      const result = {
        rating: userData.rating || 0,
        totalReviews: userData.total_reviews || 0,
        responseTime: responseTime || userData.response_time || 'Within 24 hours',
        recentReviews: reviews?.map(review => ({
          id: review.id,
          reviewer_id: review.reviewer_id,
          reviewee_id: review.reviewee_id,
          product_id: review.product_id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          reviewer_name: review.reviewer?.name || 'Anonymous'
        })) || []
      };

      console.log('✅ ReviewsService: Final result:', result);
      return result;
    } catch (error) {
      console.error('Error in getSellerStats:', error);
      return this.getDefaultStats();
    }
  }

  /**
   * Calculate actual response time from message data
   */
  private static async calculateResponseTime(sellerId: string): Promise<string> {
    try {
      // Get messages where seller responded (not the first message in a conversation)
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          created_at,
          sender_id,
          conversation_id
        `)
        .eq('sender_id', sellerId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error || !messages || messages.length === 0) {
        return 'Within 24 hours';
      }

      // Calculate average response time
      const responseTimes: number[] = [];
      
      for (const message of messages) {
        // Get the previous message in the same conversation
        const { data: prevMessage } = await supabase
          .from('messages')
          .select('created_at, sender_id')
          .eq('conversation_id', message.conversation_id)
          .lt('created_at', message.created_at)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (prevMessage && prevMessage.sender_id !== sellerId) {
          const responseTime = new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime();
          responseTimes.push(responseTime);
        }
      }

      if (responseTimes.length === 0) {
        return 'Within 24 hours';
      }

      // Calculate average response time in hours
      const avgResponseTimeMs = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const avgResponseTimeHours = avgResponseTimeMs / (1000 * 60 * 60);

      if (avgResponseTimeHours < 1) {
        return 'Within 1 hour';
      } else if (avgResponseTimeHours < 3) {
        return 'Within 3 hours';
      } else if (avgResponseTimeHours < 6) {
        return 'Within 6 hours';
      } else if (avgResponseTimeHours < 12) {
        return 'Within 12 hours';
      } else if (avgResponseTimeHours < 24) {
        return 'Within 24 hours';
      } else {
        return 'Within 2 days';
      }
    } catch (error) {
      console.error('Error calculating response time:', error);
      return 'Within 24 hours';
    }
  }

  /**
   * Get default stats when data is not available
   */
  private static getDefaultStats(): SellerStats {
    return {
      rating: 4.0,
      totalReviews: 0,
      responseTime: 'Within 24 hours',
      recentReviews: []
    };
  }

  /**
   * Submit a new review
   */
  static async submitReview(
    reviewerId: string,
    revieweeId: string,
    productId: string | undefined,
    rating: number,
    comment?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: reviewerId,
          reviewee_id: revieweeId,
          product_id: productId,
          rating,
          comment
        });

      if (error) {
        console.error('Error submitting review:', error);
        return false;
      }

      // Update user's rating and review count
      await this.updateUserStats(revieweeId);

      return true;
    } catch (error) {
      console.error('Error in submitReview:', error);
      return false;
    }
  }

  /**
   * Update user's rating and review count
   */
  private static async updateUserStats(userId: string): Promise<void> {
    try {
      // Get all reviews for this user
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewee_id', userId);

      if (error || !reviews) {
        console.error('Error fetching reviews for stats update:', error);
        return;
      }

      // Calculate new average rating and total count
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

      // Update user record
      const { error: updateError } = await supabase
        .from('users')
        .update({
          rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
          total_reviews: totalReviews
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user stats:', updateError);
      }
    } catch (error) {
      console.error('Error in updateUserStats:', error);
    }
  }
}
