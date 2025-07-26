import mongoose, { Schema, Document } from "mongoose";

export interface ISale extends Document {
  saleId: string;
  outletId: string;
  customerId?: string;
  products: {
    productId: string;
    quantity: number;
    price: number;
    discountApplied?: {
      type: string;
      amount: number;
    };
  }[];
  totalAmount: number;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema: Schema = new Schema(
  {
    saleId: { type: String, required: true, unique: true, trim: true },
    outletId: { type: String, required: true, ref: "Outlet" },
    customerId: { type: String, ref: "Customer", default: null },
    products: [
      {
        productId: { type: String, required: true, ref: "Product" },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        discountApplied: {
          type: { type: String, enum: ["General", "Membership"] },
          amount: { type: Number, default: 0 },
        },
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
  },
  { timestamps: true },
);
SaleSchema.index({ saleId: 1 });
SaleSchema.index({ outletId: 1, createdAt: -1 });

export default mongoose.models.Sale || mongoose.model<ISale>("Sale", SaleSchema);