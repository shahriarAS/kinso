import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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

// Add index for createdAt
CategorySchema.index({ createdAt: -1 });

// Check if model already exists to prevent overwrite error
export default mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);
