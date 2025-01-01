"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Explicitly type cookies and handle undefined case
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
    console.log(token);
    if (!token) {
        res.status(401).json({ message: "Invalid or missing Access Token" });
        return;
    }
    try {
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
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
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.authenticate = authenticate;
