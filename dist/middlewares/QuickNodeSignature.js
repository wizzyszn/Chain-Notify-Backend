"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyQuickNodeSignature = void 0;
const crypto_1 = __importDefault(require("crypto"));
// Middleware to verify QuickNode signature
const verifyQuickNodeSignature = (req, res, next) => {
    const signature = req.headers["x-quicknode-signature"];
    const secretKey = process.env.QUICKNODE_SECRET_KEY;
    const payload = JSON.stringify(req.body);
    const hash = crypto_1.default.createHmac("sha256", secretKey).update(payload).digest("hex");
    if (hash !== signature) {
        res.status(401).json({ success: false, message: "Unauthorized request" });
        return;
    }
    next();
};
exports.verifyQuickNodeSignature = verifyQuickNodeSignature;
