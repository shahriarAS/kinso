import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  contactInfo: {
    phone?: string;
    email?: string;
    address?: string;
  };
  membershipActive: boolean;
  totalPurchaseLastMonth: number;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    contactInfo: {
      phone: { type: String, trim: true },
      email: { type: String, trim: true },
      address: { type: String, trim: true },
    },
    membershipActive: { type: Boolean, default: false },
    totalPurchaseLastMonth: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
  },
  { timestamps: true },
);
CustomerSchema.index({ name: 1 });

export default mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);