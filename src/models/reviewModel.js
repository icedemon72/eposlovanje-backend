import mongoose from 'mongoose';

const ObjectId = mongoose.Schema.Types.ObjectId;

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: ObjectId,
      required: true
    },
    product: {
      type: ObjectId,
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      required: false,
      maxLength: 256
    }
  },
  {
    timestamps: true
  }
);

const Review = mongoose.model('Reviews', reviewSchema);

export default Review;