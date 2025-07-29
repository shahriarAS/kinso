import mongoose, { Schema, Document } from "mongoose";

export interface ISaleCounter extends Document {
  date: string; // Format: YYMMDD
  seq: number;
}

const SaleCounterSchema = new Schema<ISaleCounter>({
  date: { type: String, required: true, unique: true },
  seq: { type: Number, required: true, default: 0 },
});

export default mongoose.models.SaleCounter ||
  mongoose.model<ISaleCounter>("SaleCounter", SaleCounterSchema);
