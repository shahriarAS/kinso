import mongoose, { Schema, Document } from "mongoose";

export interface ISale extends Document {
  saleId: string;
  outletId: string;
  customerId?: string;
  saleDate: string;
  totalAmount: number;
  items: {
    stockId: string;
    quantity: number;
    unitPrice: number;
    discountApplied: number;
  }[];
  paymentMethod: "CASH" | "BKASH" | "ROCKET" | "NAGAD" | "BANK" | "CARD";
  discountAmount: number;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema: Schema = new Schema(
  {
    saleId: { type: String, required: true, unique: true, trim: true },
    outletId: { type: String, required: true, ref: "Outlet" },
    customerId: { type: String, ref: "Customer", default: null },
    saleDate: { type: String, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    items: [
      {
        stockId: { type: String, required: true, ref: "Stock" },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        discountApplied: { type: Number, default: 0, min: 0 },
      },
    ],
    paymentMethod: { 
      type: String, 
      required: true, 
      enum: ["CASH", "BKASH", "ROCKET", "NAGAD", "BANK", "CARD"] 
    },
    discountAmount: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true },
    createdBy: { type: String, required: true, ref: "User" },
  },
  { timestamps: true },
);

// Indexes for better query performance
SaleSchema.index({ saleId: 1 });
SaleSchema.index({ outletId: 1, createdAt: -1 });
SaleSchema.index({ customerId: 1, createdAt: -1 });
SaleSchema.index({ saleDate: 1 });
SaleSchema.index({ paymentMethod: 1 });
SaleSchema.index({ createdBy: 1 });

export default mongoose.models.Sale || mongoose.model<ISale>("Sale", SaleSchema);