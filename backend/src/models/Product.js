import mongoose, { Schema } from 'mongoose';


const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    badge: {
      type: String,
      enum: ['Best Seller', 'New Arrival', 'Sale', ''],
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    specifications: {
      brand: {
        type: String,
        default: 'OneShop',
      },
      model: {
        type: String,
        required: true,
      },
      weight: String,
      dimensions: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Product', productSchema);
