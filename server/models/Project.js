import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
    category: {
        type: [String],
        enum: ["Travaux personnels", "Collaborations", "Mandats"],
        required: true
    },
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: false,
    },
    photos: {
        type: [String],
        required: true
    }
});

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);