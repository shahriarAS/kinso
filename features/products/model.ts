import mongoose, { Schema, Document } from "mongoose";

export interface IStock {
  warehouse: mongoose.Types.ObjectId;
  unit: number;
  dp?: number; // Dealer Price
  mrp: number; // Maximum Retail Price
}

export interface IProduct extends Document {
  name: string;
  barcode: string;
  vendorId: mongoose.Types.ObjectId;
  brandId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  warranty?: {
    value: number;
    unit: string;
  };
  stock: IStock[];
  createdAt: Date;
  updatedAt: Date;
}

const StockSchema: Schema = new Schema(
  {
    warehouse: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    unit: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    dp: {
      type: Number,
      min: 0,
    },
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    barcode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    warranty: {
      value: {
        type: Number,
        required: false,
      },
      unit: {
        type: String,
        required: false,
      },
    },
    stock: [StockSchema],
  },
  {
    timestamps: true,
  },
);

// Index for name queries
ProductSchema.index({ name: 1 });

// Index for barcode queries
ProductSchema.index({ barcode: 1 });

// Index for vendorId queries
ProductSchema.index({ vendorId: 1 });

// Index for brandId queries
ProductSchema.index({ brandId: 1 });

// Index for categoryId queries
ProductSchema.index({ categoryId: 1 });

// Index for stock queries
ProductSchema.index({ "stock.warehouse": 1 });

// Add index for createdAt
ProductSchema.index({ createdAt: -1 });

// Add compound index for stock.warehouse and stock.unit
ProductSchema.index({ "stock.warehouse": 1, "stock.unit": 1 });

// Check if model already exists to prevent overwrite error
export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);
