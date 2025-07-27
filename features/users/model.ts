import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  outlet?: mongoose.Types.ObjectId;
  role: "admin" | "manager" | "staff";
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "manager", "staff"],
      default: "staff",
    },
    avatar: {
      type: String,
    },
    lastLoginAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    outlet: { type: Schema.Types.ObjectId, ref: "Outlet", default: null },
  },
  {
    timestamps: true,
  },
);

// Index for email queries
UserSchema.index({ email: 1 });

// Index for role queries
UserSchema.index({ role: 1 });

// Index for active users
UserSchema.index({ isActive: 1 });

// Add index for createdAt
UserSchema.index({ createdAt: -1 });

// Check if model already exists to prevent overwrite error
export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
