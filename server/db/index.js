import mongoose from "mongoose";

export default async function connectDB() {
  const config = useRuntimeConfig()
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(config.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}