import mongoose, { Schema, Document } from "mongoose";

export interface IDiscount extends Document {
  discountId: string;
  productId: string;
  type: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DiscountSchema: Schema = new Schema(
  {
    discountId: { type: String, required: true, unique: true, trim: true },
    productId: { type: String, required: true, ref: "Product" },
    type: { type: String, required: true, enum: ["General", "Membership"] },
    amount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true },
);
DiscountSchema.index({ discountId: 1 });
DiscountSchema.index({ productId: 1, type: 1 });

export default mongoose.models.Discount || mongoose.model<IDiscount>("Discount", DiscountSchema);