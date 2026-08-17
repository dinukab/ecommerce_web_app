import mongoose, { Document, Schema } from 'mongoose';

export interface IStockHistory extends Document {
  product: mongoose.Types.ObjectId;
  type: string;
  quantity: number;
  reason: string;
  by: string;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
}

const stockHistorySchema = new Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    by: {
      type: String,
      required: true,
    },
    storeId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IStockHistory>('StockHistory', stockHistorySchema);
