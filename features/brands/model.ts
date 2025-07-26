import mongoose, { Schema, Document } from "mongoose";

export interface IBrand extends Document {
  brandId: string;
  name: string;
  vendorId: string;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema: Schema = new Schema(
  {
    brandId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    vendorId: { type: String, required: true, ref: "Vendor" },
  },
  { timestamps: true },
);
BrandSchema.index({ brandId: 1 });
BrandSchema.index({ name: 1 });

export default mongoose.models.Brand || mongoose.model<IBrand>("Brand", BrandSchema);