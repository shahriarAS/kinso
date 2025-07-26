import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  categoryId: string;
  name: string;
  applyVAT: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    categoryId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    applyVAT: { type: Boolean, default: false },
  },
  { timestamps: true },
);
CategorySchema.index({ categoryId: 1 });
CategorySchema.index({ name: 1 });

export default mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);