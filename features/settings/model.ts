import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettings extends Document {
  invoiceFooter?: string;
  invoiceFooterTitle?: string;
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ISettingsModel extends Model<ISettings> {
  getSingleton(): Promise<ISettings>;
}

const SettingsSchema: Schema<ISettings> = new Schema(
  {
    invoiceFooter: {
      type: String,
      trim: true,
      default: "",
    },
    invoiceFooterTitle: {
      type: String,
      trim: true,
      default: "Warranty Policy",
    },
    companyName: {
      type: String,
      trim: true,
      default: "",
    },
    companyEmail: {
      type: String,
      trim: true,
      default: "",
    },
    companyPhone: {
      type: String,
      trim: true,
      default: "",
    },
    companyAddress: {
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

const Settings =
  (mongoose.models.Settings as ISettingsModel) ||
  mongoose.model<ISettings, ISettingsModel>("Settings", SettingsSchema);

export default Settings;
