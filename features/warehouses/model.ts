import mongoose, { Schema, Document } from "mongoose";

export interface IWarehouse extends Document {
  name: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

const WarehouseSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for name queries
WarehouseSchema.index({ name: 1 });
// Index for location queries
WarehouseSchema.index({ location: 1 });

// Check if model already exists to prevent overwrite error
export default mongoose.models.Warehouse ||
  mongoose.model<IWarehouse>("Warehouse", WarehouseSchema); 