import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  phone: string;
  email: string;
  address?: string;
  membershipActive: boolean;
  totalPurchaseLastMonth: number;
  totalSales: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    membershipActive: { type: Boolean, default: false },
    totalPurchaseLastMonth: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);