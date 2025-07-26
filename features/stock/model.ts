import mongoose, { Schema, Document } from "mongoose";

export interface IStock extends Document {
  stockId: string;
  productId: string;
  locationId: string;
  locationType: string;
  mrp: number;
  tp: number;
  expireDate: Date;
  quantity: number;
  batchNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const StockSchema: Schema = new Schema(
  {
    stockId: { type: String, required: true, unique: true, trim: true },
    productId: { type: String, required: true, ref: "Product" },
    locationId: { type: String, required: true },
    locationType: { type: String, required: true, enum: ["Warehouse", "Outlet"] },
    mrp: { type: Number, required: true },
    tp: { type: Number, required: true },
    expireDate: { type: Date, required: true },
    quantity: { type: Number, required: true, min: 0 },
    batchNumber: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);
StockSchema.index({ stockId: 1 });
StockSchema.index({ productId: 1, locationId: 1, batchNumber: 1 });

export default mongoose.models.Stock || mongoose.model<IStock>("Stock", StockSchema);