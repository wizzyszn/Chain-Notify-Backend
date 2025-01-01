"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createToken = (body) => {
    if (!process.env.JWT_SECRET_KEY) {
        throw new Error("JWT_SECRET_KEY is not defined in the environment variables.");
    }
    const token = jsonwebtoken_1.default.sign(body, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
    return token;
};
exports.createToken = createToken;
