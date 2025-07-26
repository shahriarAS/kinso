import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStock extends Document {
  productId: mongoose.Types.ObjectId;
  outletId?: mongoose.Types.ObjectId;
  warehouseId?: string;
  mrp: number;
  tp: number;
  expireDate: Date;
  units: number;
  entryDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StockSchema: Schema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    outletId: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
      required: false,
    },
    warehouseId: {
      type: String,
      required: false,
      trim: true,
      uppercase: true,
    },
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },
    tp: {
      type: Number,
      required: true,
      min: 0,
    },
    expireDate: {
      type: Date,
      required: true,
    },
    units: {
      type: Number,
      required: true,
      min: 1,
    },
    entryDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Validation: Either outletId or warehouseId must be present, but not both
StockSchema.pre("save", function (next) {
  if (!this.outletId && !this.warehouseId) {
    return next(new Error("Either outletId or warehouseId must be provided"));
  }
  if (this.outletId && this.warehouseId) {
    return next(new Error("Cannot have both outletId and warehouseId"));
  }
  next();
});

// Validation: expireDate must be in the future
StockSchema.pre("save", function (next) {
  if (this.expireDate <= new Date()) {
    return next(new Error("Expire date must be in the future"));
  }
  next();
});

// Indexes for efficient queries
StockSchema.index({ productId: 1 });
StockSchema.index({ outletId: 1 });
StockSchema.index({ warehouseId: 1 });
StockSchema.index({ expireDate: 1 });
StockSchema.index({ entryDate: 1 });
StockSchema.index({ "productId": 1, "outletId": 1 });
StockSchema.index({ "productId": 1, "warehouseId": 1 });
StockSchema.index({ "expireDate": 1, "entryDate": 1 });

// Compound index for FIFO queries
StockSchema.index({ "productId": 1, "outletId": 1, "entryDate": 1 });
StockSchema.index({ "productId": 1, "warehouseId": 1, "entryDate": 1 });

// Check if model already exists to prevent overwrite error
const Stock =
  (mongoose.models.Stock as mongoose.Model<IStock>) ||
  mongoose.model<IStock>("Stock", StockSchema);

export default Stock; 