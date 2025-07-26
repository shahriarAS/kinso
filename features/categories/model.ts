import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  categoryId: string;
  categoryName: string;
  vatStatus: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    categoryId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    vatStatus: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for categoryId queries
CategorySchema.index({ categoryId: 1 });

// Index for categoryName queries
CategorySchema.index({ categoryName: 1 });

// Index for vatStatus queries
CategorySchema.index({ vatStatus: 1 });

// Add index for createdAt
CategorySchema.index({ createdAt: -1 });

// Check if model already exists to prevent overwrite error
export default mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);
