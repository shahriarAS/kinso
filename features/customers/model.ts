import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  status: "active" | "inactive";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    totalOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for email queries
CustomerSchema.index({ email: 1 });

// Index for phone queries
CustomerSchema.index({ phone: 1 });

// Index for name queries
CustomerSchema.index({ name: 1 });

// Index for status queries
CustomerSchema.index({ status: 1 });

// Check if model already exists to prevent overwrite error
export default mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema); 