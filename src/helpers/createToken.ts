import jwt from "jsonwebtoken";

export const createToken = (body: object): string => {
    if (!process.env.JWT_SECRET_KEY) {
        throw new Error("JWT_SECRET_KEY is not defined in the environment variables.");
    }

    const token = jwt.sign(body, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
    return token;
};
