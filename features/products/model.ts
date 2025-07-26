import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  productId: string;
  name: string;
  barcode: string;
  vendorId: string;
  brandId: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    productId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    barcode: { type: String, required: true, unique: true, trim: true },
    vendorId: { type: String, required: true, ref: "Vendor" },
    brandId: { type: String, required: true, ref: "Brand" },
    categoryId: { type: String, required: true, ref: "Category" },
  },
  { timestamps: true },
);
ProductSchema.index({ productId: 1 });
ProductSchema.index({ barcode: 1 });
ProductSchema.index({ name: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);