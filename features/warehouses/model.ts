import mongoose, { Schema, Document } from "mongoose";

export interface IWarehouse extends Document {
  warehouseId: string;
  name: string;
  location: string;
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
      uppercase: true,
    },
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

// Index for warehouseId queries (unique)
WarehouseSchema.index({ warehouseId: 1 }, { unique: true });
// Index for name queries
WarehouseSchema.index({ name: 1 });
// Index for location queries
WarehouseSchema.index({ location: 1 });

// Add index for createdAt
WarehouseSchema.index({ createdAt: -1 });

// Check if model already exists to prevent overwrite error
export default mongoose.models.Warehouse ||
  mongoose.model<IWarehouse>("Warehouse", WarehouseSchema);
