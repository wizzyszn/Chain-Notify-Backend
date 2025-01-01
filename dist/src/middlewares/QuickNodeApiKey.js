"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAPIKey = void 0;
// Middleware to verify API Key
const verifyAPIKey = (req, res, next) => {
    const apiKey = req.headers["x-api-key"];
    const validApiKey = process.env.QUICK_API_KEY;
    if (apiKey !== validApiKey) {
        res.status(403).json({ success: false, message: "Invalid API key" });
        return;
    }
    next();
};
exports.verifyAPIKey = verifyAPIKey;
