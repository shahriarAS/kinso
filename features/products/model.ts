import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  barcode: string;
  vendor: mongoose.Types.ObjectId;
  brand: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    barcode: { type: String, required: true, unique: true, trim: true },
    vendor: { type: Schema.Types.ObjectId, required: true, ref: "Vendor" },
    brand: { type: Schema.Types.ObjectId, required: true, ref: "Brand" },
    category: { type: Schema.Types.ObjectId, required: true, ref: "Category" },
  },
  { timestamps: true },
);
ProductSchema.index({ name: 1 });

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);
