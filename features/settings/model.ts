import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettings extends Document {
  warrantyPolicy?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ISettingsModel extends Model<ISettings> {
  getSingleton(): Promise<ISettings>;
}

const SettingsSchema: Schema<ISettings> = new Schema(
  {
    warrantyPolicy: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

SettingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = (mongoose.models.Settings as ISettingsModel) ||
  mongoose.model<ISettings, ISettingsModel>("Settings", SettingsSchema);

export default Settings; 