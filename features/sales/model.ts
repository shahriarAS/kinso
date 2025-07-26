import mongoose, { Schema, Document } from "mongoose";

export interface ISaleItem {
  stockId: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  discountApplied: number;
}

export interface ISale extends Document {
  saleId: string;
  outletId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  saleDate: Date;
  totalAmount: number;
  items: ISaleItem[];
  paymentMethod: "CASH" | "BKASH" | "ROCKET" | "NAGAD" | "BANK" | "CARD";
  discountAmount: number;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SaleItemSchema: Schema = new Schema(
  {
    stockId: {
      type: Schema.Types.ObjectId,
      ref: "Stock",
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
    discountApplied: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false },
);

const SaleSchema: Schema = new Schema(
  {
    saleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    outletId: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
    },
    saleDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    items: [SaleItemSchema],
    paymentMethod: {
      type: String,
      required: true,
      enum: ["CASH", "BKASH", "ROCKET", "NAGAD", "BANK", "CARD"],
      default: "CASH",
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient queries
SaleSchema.index({ saleId: 1 }, { unique: true });
SaleSchema.index({ outletId: 1 });
SaleSchema.index({ customerId: 1 });
SaleSchema.index({ saleDate: 1 });
SaleSchema.index({ createdBy: 1 });
SaleSchema.index({ "outletId": 1, "saleDate": 1 });
SaleSchema.index({ "customerId": 1, "saleDate": 1 });

// Check if model already exists to prevent overwrite error
export default mongoose.models.Sale ||
  mongoose.model<ISale>("Sale", SaleSchema); 