import mongoose, { Schema, Document } from 'mongoose';

export interface IStock {
  warehouse: mongoose.Types.ObjectId;
  unit: number;
  dp: number; // Dealer Price
  mrp: number; // Maximum Retail Price
}

export interface IProduct extends Document {
  name: string;
  upc: string;
  category: mongoose.Types.ObjectId;
  stock: IStock[];
  createdAt: Date;
  updatedAt: Date;
}

const StockSchema: Schema = new Schema({
  warehouse: {
    type: Schema.Types.ObjectId,
    ref: 'Warehouse',
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
    required: true,
    min: 0,
  },
  mrp: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const ProductSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  upc: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  stock: [StockSchema],
}, {
  timestamps: true,
});

// Index for UPC queries
ProductSchema.index({ upc: 1 });

// Index for name queries
ProductSchema.index({ name: 1 });

// Index for category queries
ProductSchema.index({ category: 1 });

// Index for stock queries
ProductSchema.index({ 'stock.warehouse': 1 });

// Check if model already exists to prevent overwrite error
export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema); 