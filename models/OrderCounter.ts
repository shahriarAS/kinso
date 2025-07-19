import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderCounter extends Document {
  date: string; // Format: YYMMDD
  seq: number;
}

const OrderCounterSchema = new Schema<IOrderCounter>({
  date: { type: String, required: true, unique: true },
  seq: { type: Number, required: true, default: 0 },
});

export default mongoose.models.OrderCounter ||
  mongoose.model<IOrderCounter>('OrderCounter', OrderCounterSchema); 