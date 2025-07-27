import mongoose, { Schema, Document } from "mongoose";

export interface IVendor extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);
VendorSchema.index({ name: 1 });

export default mongoose.models.Vendor || mongoose.model<IVendor>("Vendor", VendorSchema);