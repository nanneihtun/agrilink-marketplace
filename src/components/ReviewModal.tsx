import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { X, Star, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reviewData: ReviewData) => void;
  transaction: {
    id: string;
    productName: string;
    otherPartyName: string;
    otherPartyType: 'buyer' | 'seller';
    dealAmount: number;
    completedAt: string;
  };
  currentUser: {
    id: string;
    name: string;
  };
}

interface ReviewData {
  rating: number;
  comment: string;
  wouldRecommend: boolean;
  deliveryRating: number;
  communicationRating: number;
  qualityRating: number;
}

export function ReviewModal({ isOpen, onClose, onSubmit, transaction, currentUser }: ReviewModalProps) {
  const [formData, setFormData] = useState<ReviewData>({
    rating: 5,
    comment: '',
    wouldRecommend: true,
    deliveryRating: 5,
    communicationRating: 5,
    qualityRating: 5
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = (rating: number, onRatingChange: (rating: number) => void, label: string) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {rating}/5
        </span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Leave a Review
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Transaction Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold text-lg">Transaction Details</h3>
            <div className="space-y-2 mt-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product:</span>
                <span className="font-medium">{transaction.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {transaction.otherPartyType === 'seller' ? 'Seller:' : 'Buyer:'}
                </span>
                <span className="font-medium">{transaction.otherPartyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">{transaction.dealAmount.toLocaleString()} MMK</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed:</span>
                <span className="font-medium">
                  {new Date(transaction.completedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Overall Rating */}
            <div className="space-y-4">
              <h4 className="font-semibold">Overall Experience</h4>
              {renderStarRating(
                formData.rating,
                (rating) => setFormData({ ...formData, rating }),
                "How would you rate this transaction overall?"
              )}
            </div>

            {/* Detailed Ratings */}
            <div className="space-y-4">
              <h4 className="font-semibold">Detailed Ratings</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderStarRating(
                  formData.qualityRating,
                  (rating) => setFormData({ ...formData, qualityRating: rating }),
                  "Product Quality"
                )}
                {renderStarRating(
                  formData.communicationRating,
                  (rating) => setFormData({ ...formData, communicationRating: rating }),
                  "Communication"
                )}
                {renderStarRating(
                  formData.deliveryRating,
                  (rating) => setFormData({ ...formData, deliveryRating: rating }),
                  "Delivery"
                )}
              </div>
            </div>

            {/* Recommendation */}
            <div className="space-y-3">
              <Label>Would you recommend this {transaction.otherPartyType}?</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={formData.wouldRecommend ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, wouldRecommend: true })}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={!formData.wouldRecommend ? "destructive" : "outline"}
                  onClick={() => setFormData({ ...formData, wouldRecommend: false })}
                  className="flex items-center gap-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                  No
                </Button>
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment">Your Review (Optional)</Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="pl-10 min-h-[100px]"
                  placeholder="Share your experience with this transaction. What went well? What could be improved?"
                />
              </div>
            </div>

            {/* Review Summary */}
            <div className="bg-primary/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Review Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Overall Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= formData.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Recommendation:</span>
                  <Badge variant={formData.wouldRecommend ? "default" : "destructive"}>
                    {formData.wouldRecommend ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Quality:</span>
                  <span>{formData.qualityRating}/5</span>
                </div>
                <div className="flex justify-between">
                  <span>Communication:</span>
                  <span>{formData.communicationRating}/5</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>{formData.deliveryRating}/5</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}