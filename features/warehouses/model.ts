import mongoose, { Schema, Document } from "mongoose";

export interface IWarehouse extends Document {
  warehouseId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const WarehouseSchema: Schema = new Schema(
  {
    warehouseId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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

// Index for warehouseId queries
WarehouseSchema.index({ warehouseId: 1 });

// Index for name queries
WarehouseSchema.index({ name: 1 });

// Index for createdAt
WarehouseSchema.index({ createdAt: -1 });

// Check if model already exists to prevent overwrite error
export default mongoose.models.Warehouse ||
  mongoose.model<IWarehouse>("Warehouse", WarehouseSchema);