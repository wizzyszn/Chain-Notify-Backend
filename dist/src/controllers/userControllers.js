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
exports.requestEmailVerification = exports.verifyEmail = exports.signInUser = exports.closeAccount = exports.createUser = void 0;
const types_1 = require("../types");
const schemas_1 = require("../schemas");
const response_1 = require("../utils/response");
const userModel_1 = require("../models/userModel");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const general_1 = require("../utils/general");
const createToken_1 = require("../helpers/createToken");
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../utils/env");
;
const transporter = nodemailer_1.default.createTransport({
    service: "Yahoo",
    secure: false,
    auth: {
        user: (0, env_1.getEnvVar)("EMAIL"),
        pass: (0, env_1.getEnvVar)("EMAIL_PASSWORD"),
    },
});
// Generate OTP (6-digit number)
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
// Send OTP to user's email
const sendOTPEmail = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Email Verification OTP",
        text: `Your OTP for email verification is: ${otp}. It is valid for 10 minutes.`,
    };
    yield transporter.sendMail(mailOptions);
});
//?* Register User
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lastName, firstName, email, password } = req.body;
        const { error } = schemas_1.createUserSchema.validate({
            lastName,
            firstName,
            email,
            password,
        }, {
            abortEarly: false,
        });
        if (error) {
            const errors = error.details.map((err) => {
                return {
                    field: err.type,
                    message: err.message,
                    path: err.path,
                    context: err.context,
                };
            });
            return (0, response_1.sendFailedRes)(res, 400, undefined, "Validation Error", errors);
        }
        const checkUser = yield userModel_1.userModel.findOne({ email });
        if (!checkUser) {
            const salt = yield bcryptjs_1.default.genSalt(10);
            const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
            const response = yield userModel_1.userModel.create({
                lastName,
                firstName,
                email,
                password: hashedPassword,
            });
            const cleanedCopy = (0, general_1.cleanPassword)(response);
            return (0, response_1.sendSuccessRes)(cleanedCopy, res, "Registeration successful", 201, types_1.typeOfResponse.json, true);
        }
        return (0, response_1.sendFailedRes)(res, 400, undefined, "User already exists");
    }
    catch (err) {
        console.error("Error occurred during user registration:", err);
        return (0, response_1.sendFailedRes)(res, 500, undefined, err.message);
    }
});
exports.createUser = createUser;
//?* Sign in User 
const signInUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield userModel_1.userModel.findOne({ email });
        if (user) {
            const checkPassword = yield bcryptjs_1.default.compare(password, user.password);
            if (checkPassword) {
                const token = (0, createToken_1.createToken)({
                    email: email,
                    id: user._id
                });
                res.cookie('token', token, {});
                return (0, response_1.sendSuccessRes)((0, general_1.cleanPassword)(user), res, "Sign in successful", 200, types_1.typeOfResponse.json, true);
            }
            else {
                return (0, response_1.sendFailedRes)(res, 400, undefined, "Incorrect password");
            }
        }
        else {
            return (0, response_1.sendFailedRes)(res, 400, undefined, "This user doesn't exist please register");
        }
    }
    catch (err) {
        console.error("Error occurred during closing account", err);
        return (0, response_1.sendFailedRes)(res, 500, undefined, "Error occurred Loggin in.......");
    }
});
exports.signInUser = signInUser;
//?& Logout user
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    try {
        const response = yield userModel_1.userModel.findById(id);
    }
    catch (err) {
    }
});
//?* Close Account
const closeAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    try {
        const user = yield userModel_1.userModel.findById(id);
        if (!user) {
            return (0, response_1.sendFailedRes)(res, 400, undefined, "This user does not exist in our database");
        }
        user.deleteOne();
        yield user.save();
    }
    catch (err) {
        console.error("Error occurred during closing account", err);
        return (0, response_1.sendFailedRes)(res, 500, undefined, "Error occurred while we tried closing your account");
    }
});
exports.closeAccount = closeAccount;
//?* Request OTP
const requestEmailVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield userModel_1.userModel.findOne({ email });
        if (!user) {
            return (0, response_1.sendFailedRes)(res, 400, undefined, "User not found");
        }
        // Generate OTP and expiration time
        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        // Update user record with OTP and expiration
        user.otp = otp;
        user.otpExpiresAt = otpExpiresAt;
        yield user.save();
        // Send OTP to the user's email
        yield sendOTPEmail(email, otp);
        return (0, response_1.sendSuccessRes)({ email }, res, "OTP sent successfully. Please check your email.", 200, types_1.typeOfResponse.json, true);
    }
    catch (err) {
        console.error("Error during OTP request", err);
        return (0, response_1.sendFailedRes)(res, 500, undefined, "Error occurred while requesting OTP");
    }
});
exports.requestEmailVerification = requestEmailVerification;
//?* Verify Email With OTP
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        const user = yield userModel_1.userModel.findOne({ email });
        if (!user) {
            return (0, response_1.sendFailedRes)(res, 400, undefined, "User not found");
        }
        if (user.otp !== otp) {
            return (0, response_1.sendFailedRes)(res, 400, undefined, "Invalid OTP");
        }
        if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
            return (0, response_1.sendFailedRes)(res, 400, undefined, "OTP has expired");
        }
        // Mark the user as verified and clear OTP fields
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        yield user.save();
        return (0, response_1.sendSuccessRes)({ email }, res, "Email verified successfully", 200, types_1.typeOfResponse.json, true);
    }
    catch (err) {
        console.error("Error during email verification", err);
        return (0, response_1.sendFailedRes)(res, 500, undefined, "Error occurred during email verification");
    }
});
exports.verifyEmail = verifyEmail;
