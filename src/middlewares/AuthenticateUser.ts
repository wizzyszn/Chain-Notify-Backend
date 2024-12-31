import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
    user?: string | JwtPayload;
}

export const authenticate = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    // Explicitly type cookies and handle undefined case
    const token = req.cookies?.token as string | undefined;
    console.log(token)
    if (!token) {
        res.status(401).json({ message: "Invalid or missing Access Token" });
        return;
    }

    try {
        jwt.verify(
            token,
            process.env.JWT_SECRET_KEY as string,
            (err: VerifyErrors | null, user: string | JwtPayload | undefined) => {
                if (err) {
                    if (err.name === "TokenExpiredError") {
                        res.status(403).json({ message: "Session expired" });
                        return;
                    }
                    if (err.name === "JsonWebTokenError") {
                        res.status(403).json({ message: "Invalid token" });
                        return;
                    }
                    res.sendStatus(403);
                    return;
                }

                req.user = user;
                next();
            }
        );
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
};