import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user: string;
  rating: number;
  title: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: String,
      required: [true, 'User name is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
    },
    text: {
      type: String,
      required: [true, 'Review text is required'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IReview>('Review', reviewSchema);
