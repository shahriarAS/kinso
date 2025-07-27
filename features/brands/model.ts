import mongoose, { Schema, Document } from "mongoose";

export interface IBrand extends Document {
  name: string;
  vendor: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    vendor: { type: Schema.Types.ObjectId, required: true, ref: "Vendor" },
  },
  { timestamps: true },
);
BrandSchema.index({ name: 1 });

export default mongoose.models.Brand || mongoose.model<IBrand>("Brand", BrandSchema);