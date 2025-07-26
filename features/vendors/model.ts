import mongoose, { Schema, Document } from "mongoose";

export interface IVendor extends Document {
  vendorId: string;
  vendorName: string;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema: Schema = new Schema(
  {
    vendorId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    vendorName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Check if model already exists to prevent overwrite error
export default mongoose.models.Vendor ||
  mongoose.model<IVendor>("Vendor", VendorSchema); 