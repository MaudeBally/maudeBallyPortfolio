import connectDB from "../db/index.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { username, password } = body;

    await connectDB();
    const user = await User.findOne({ username });

    if (!user) {
        return { success: false, message: "Utilisateur introuvable" };
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return { success: false, message: "Mot de passe incorrect" };
    }

    // Créer un JWT
    const config = useRuntimeConfig()
    const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        config.jwt_secret,
        { expiresIn: "1h" }
    );

    // Stocker en cookie HTTP-only
    setCookie(event, "token", token, {
        httpOnly: true,
        secure: config.node_env === "production",
        sameSite: "strict",
        maxAge: 3600,
    });

    return { success: true, message: "Connexion réussie" };
});