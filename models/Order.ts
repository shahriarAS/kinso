import mongoose, { Schema, Document } from 'mongoose';

export type PaymentMethod = "CASH" | "BKASH" | "ROCKET" | "NAGAD" | "BANK";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  items: IOrderItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  discount?: number; // Discount amount for the order
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema: Schema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const OrderSchema: Schema = new Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["CASH", "BKASH", "ROCKET", "NAGAD", "BANK"],
  },
  discount: {
    type: Number,
    required: false,
    min: 0,
    default: 0,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index for order number queries
OrderSchema.index({ orderNumber: 1 });

// Index for customer queries
OrderSchema.index({ customerId: 1 });


// Compound index for customer and status
OrderSchema.index({ customerId: 1});

// Check if model already exists to prevent overwrite error
export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema); 