import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
    const token = getCookie(event, "token");
    if (!token) return { loggedIn: false };

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { loggedIn: true, user: decoded };
    } catch (err) {
        return { loggedIn: false };
    }
});