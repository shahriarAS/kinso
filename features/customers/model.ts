import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  customerId: string;
  customerName: string;
  contactInfo: string;
  purchaseAmount: number;
  membershipStatus: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema = new Schema(
  {
    customerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    contactInfo: {
      type: String,
      required: true,
      trim: true,
    },
    purchaseAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    membershipStatus: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Index for customerId queries
CustomerSchema.index({ customerId: 1 });

// Index for customerName queries
CustomerSchema.index({ customerName: 1 });

// Index for membershipStatus queries
CustomerSchema.index({ membershipStatus: 1 });

// Index for purchaseAmount queries
CustomerSchema.index({ purchaseAmount: -1 });

// Add index for createdAt
CustomerSchema.index({ createdAt: -1 });

// Check if model already exists to prevent overwrite error
export default mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);
