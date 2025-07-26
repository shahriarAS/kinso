import mongoose, { Schema, Document } from "mongoose";

export interface IDemand extends Document {
  demandId: string;
  locationId: string;
  locationType: string;
  products: {
    productId: string;
    quantity: number;
  }[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const DemandSchema: Schema = new Schema(
  {
    demandId: { type: String, required: true, unique: true, trim: true },
    locationId: { type: String, required: true },
    locationType: { type: String, required: true, enum: ["Warehouse", "Outlet"] },
    products: [
      {
        productId: { type: String, required: true, ref: "Product" },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    status: { type: String, required: true, enum: ["Pending", "Approved", "ConvertedToStock"] },
  },
  { timestamps: true },
);
DemandSchema.index({ demandId: 1 });
DemandSchema.index({ locationId: 1, status: 1 });

export default mongoose.models.Demand || mongoose.model<IDemand>("Demand", DemandSchema);