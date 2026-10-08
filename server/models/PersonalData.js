import mongoose from "mongoose";

const RequiredTranslatedStringSchema = new mongoose.Schema(
  {
    fr: { type: String, required: true },
    en: { type: String, required: true }
  },
  { _id: false }
)

const OptionalTranslatedStringSchema = new mongoose.Schema(
  {
    fr: { type: String },
    en: { type: String }
  },
  { _id: false }
)

const PersonalDataSchema = new mongoose.Schema({
  email: {
    type: String,
    required: false
  },
  insta: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: false
  },
  biography: {
    type: OptionalTranslatedStringSchema,
    required: false
  }
});

export default mongoose.models.PersonalData || mongoose.model("PersonalData", PersonalDataSchema);