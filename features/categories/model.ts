import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  applyVAT: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    applyVAT: { type: Boolean, default: false },
  },
  { timestamps: true },
);
CategorySchema.index({ name: 1 });

export default mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);
