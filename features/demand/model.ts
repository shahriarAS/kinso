import mongoose, { Schema, Document } from "mongoose";

export interface IDemand extends Document {
  location: mongoose.Types.ObjectId;
  locationType: string;
  products: {
    product: mongoose.Types.ObjectId;
    quantity: number;
  }[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const DemandSchema: Schema = new Schema(
  {
    location: { type: Schema.Types.ObjectId, required: true },
    locationType: { type: String, required: true, enum: ["Warehouse", "Outlet"] },
    products: [
      {
        product: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    status: { type: String, required: true, enum: ["Pending", "Approved", "ConvertedToStock"] },
  },
  { timestamps: true },
);
DemandSchema.index({ location: 1, status: 1 });

export default mongoose.models.Demand || mongoose.model<IDemand>("Demand", DemandSchema);