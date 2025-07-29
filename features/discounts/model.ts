import mongoose, { Schema, Document } from "mongoose";

export interface IDiscount extends Document {
  product: mongoose.Types.ObjectId;
  type: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DiscountSchema: Schema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
    type: { type: String, required: true, enum: ["General", "Membership"] },
    amount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true },
);
DiscountSchema.index({ product: 1, type: 1 });

export default mongoose.models.Discount ||
  mongoose.model<IDiscount>("Discount", DiscountSchema);
