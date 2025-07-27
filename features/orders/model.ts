import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, trim: true },
    customer: { type: Schema.Types.ObjectId, required: true, ref: "Customer" },
    items: [
      {
        product: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        totalPrice: { type: Number, required: true, min: 0 },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    status: { 
      type: String, 
      required: true, 
      enum: ["Pending", "Processing", "Completed", "Cancelled"],
      default: "Pending"
    },
  },
  { timestamps: true },
);

// Indexes for better query performance
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ customer: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema); 