"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const userControllers_1 = require("../controllers/userControllers");
const userRouter = (0, express_1.Router)();
exports.userRouter = userRouter;
//Authentications
userRouter.post('/register', userControllers_1.createUser);
userRouter.post('/close', userControllers_1.closeAccount);
userRouter.post('/login', userControllers_1.signInUser);
userRouter.post('/request-otp', userControllers_1.requestEmailVerification);
userRouter.post('/verify-otp', userControllers_1.verifyEmail);
userRouter.post('/login', userControllers_1.signInUser);
