import mongoose, { Schema, Document } from "mongoose";

export interface IBrand extends Document {
  brandId: string;
  brandName: string;
  vendorId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema: Schema = new Schema(
  {
    brandId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    brandName: {
      type: String,
      required: true,
      trim: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for brandId queries
BrandSchema.index({ brandId: 1 });

// Index for brandName queries
BrandSchema.index({ brandName: 1 });

// Index for vendorId queries
BrandSchema.index({ vendorId: 1 });

// Add index for createdAt
BrandSchema.index({ createdAt: -1 });

// Check if model already exists to prevent overwrite error
export default mongoose.models.Brand ||
  mongoose.model<IBrand>("Brand", BrandSchema); 