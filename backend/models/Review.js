import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true },
  reviewType: {
    type: String,
    enum: ['Restaurant', 'Food', 'Order'],
    required: true,
    index: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  isHidden: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
