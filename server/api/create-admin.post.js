import connectDB from "../db/index.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

export default defineEventHandler(async (event) => {
  await connectDB();

  // Pour la simplicité, on récupère username et password dans le body
  const { username, password } = await readBody(event);

  if (!username || !password) {
    return { success: false, message: "username et password requis" };
  }

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return { success: false, message: "Utilisateur déjà existant" };
  }

  // Hacher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  // Créer l'utilisateur admin
  const newUser = new User({
    username,
    password: hashedPassword,
    role: "admin"
  });

  await newUser.save();

  return { success: true, message: "Admin créé avec succès" };
});