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

const ProjectSchema = new mongoose.Schema({
    category: {
        type: [String],
        enum: ["personnal", "collaborations", "clients"],
        required: true
    },
    title: {
        type: RequiredTranslatedStringSchema,
        required: true
    },
    description: {
        type: OptionalTranslatedStringSchema,
        required: false
    },
    photos: {
        type: [String],
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    }
});

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);