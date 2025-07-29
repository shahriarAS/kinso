import mongoose, { Schema, Document } from "mongoose";

export interface IStock extends Document {
  product: mongoose.Types.ObjectId;
  location: mongoose.Types.ObjectId;
  locationType: string;
  mrp: number;
  tp: number;
  expireDate: Date;
  unit: number;
  batchNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const StockSchema: Schema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
    location: {
      type: Schema.Types.ObjectId,
      required: true,
      // Note: This can reference either Warehouse or Outlet based on locationType
      // Manual population is handled in the service layer
    },
    locationType: {
      type: String,
      required: true,
      enum: ["Warehouse", "Outlet"],
    },
    mrp: { type: Number, required: true },
    tp: { type: Number, required: true },
    expireDate: { type: Date, required: true },
    unit: { type: Number, required: true, min: 0 },
    batchNumber: { type: String, required: true },
  },
  { timestamps: true },
);
StockSchema.index({ product: 1, location: 1 });

export default mongoose.models.Stock ||
  mongoose.model<IStock>("Stock", StockSchema);
