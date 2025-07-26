import mongoose, { Schema, Document } from "mongoose";

export interface IOutlet extends Document {
  outletId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const OutletSchema: Schema = new Schema(
  {
    outletId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for outletId queries (unique)
OutletSchema.index({ outletId: 1 }, { unique: true });
// Index for name queries
OutletSchema.index({ name: 1 });
// Index for createdAt
OutletSchema.index({ createdAt: -1 });

// Check if model already exists to prevent overwrite error
export default mongoose.models.Outlet ||
  mongoose.model<IOutlet>("Outlet", OutletSchema); 