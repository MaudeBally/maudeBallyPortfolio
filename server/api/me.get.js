import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
    const token = getCookie(event, "token");
    if (!token) return { loggedIn: false };

    try {
        const config = useRuntimeConfig()
        const decoded = jwt.verify(token, config.jwt_secret);
        return { loggedIn: true, user: decoded };
    } catch (err) {
        return { loggedIn: false };
    }
});