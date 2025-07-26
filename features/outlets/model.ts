import mongoose, { Schema, Document } from "mongoose";

export interface IOutlet extends Document {
  outletId: string;
  name: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

const OutletSchema: Schema = new Schema(
  {
    outletId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ["Micro Outlet", "Super Shop"] },
  },
  { timestamps: true },
);
OutletSchema.index({ outletId: 1 });
OutletSchema.index({ name: 1 });

export default mongoose.models.Outlet || mongoose.model<IOutlet>("Outlet", OutletSchema);