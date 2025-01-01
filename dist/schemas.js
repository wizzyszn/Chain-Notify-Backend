"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserSchema = void 0;
const joi_1 = __importDefault(require("joi"));
//validator for user
const createUserSchema = joi_1.default.object({
    lastName: joi_1.default.string().min(2).max(30).required().messages({
        'string.empty': 'Last name is required.',
        'string.min': 'Last name must be at least 2 characters.',
        'string.max': 'Last name must not exceed 30 characters.',
    }),
    firstName: joi_1.default.string().min(2).max(30).required().messages({
        'string.empty': 'First name is required.',
        'string.min': 'First name must be at least 2 characters.',
        'string.max': 'First name must not exceed 30 characters.',
    }),
    email: joi_1.default.string().email().required().messages({
        'string.empty': 'Email is required.',
        'string.email': 'Email must be a valid email address.',
    }),
    password: joi_1.default.string().min(8).max(128).required().messages({
        'string.empty': 'Password is required.',
        'string.min': 'Password must be at least 8 characters.',
        'string.max': 'Password must not exceed 128 characters.',
    }),
});
exports.createUserSchema = createUserSchema;
