import mongoose, { Schema, Document } from "mongoose";

export interface IDemand extends Document {
  demandId: string;
  outletId?: mongoose.Types.ObjectId;
  warehouseId?: string;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  demandDate: Date;
  status: "pending" | "approved" | "converted" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const DemandSchema: Schema = new Schema(
  {
    demandId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    outletId: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
      required: false,
    },
    warehouseId: {
      type: String,
      required: false,
      trim: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    demandDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "converted", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

// Index for demandId queries (unique)
DemandSchema.index({ demandId: 1 }, { unique: true });

// Index for outletId queries
DemandSchema.index({ outletId: 1 });

// Index for warehouseId queries
DemandSchema.index({ warehouseId: 1 });

// Index for productId queries
DemandSchema.index({ productId: 1 });

// Index for status queries
DemandSchema.index({ status: 1 });

// Index for demandDate queries
DemandSchema.index({ demandDate: -1 });

// Index for createdAt
DemandSchema.index({ createdAt: -1 });

// Compound index for outletId and status
DemandSchema.index({ outletId: 1, status: 1 });

// Compound index for productId and status
DemandSchema.index({ productId: 1, status: 1 });

// Check if model already exists to prevent overwrite error
export default mongoose.models.Demand ||
  mongoose.model<IDemand>("Demand", DemandSchema); 