import {Router} from "express";
import { closeAccount, createUser, requestEmailVerification, signInUser, verifyEmail } from "../controllers/userControllers";

const userRouter = Router();
//Authentications
userRouter.post('/register', createUser);
userRouter.post('/close' , closeAccount);
userRouter.post('/login' , signInUser);
userRouter.post('/request-otp' , requestEmailVerification);
userRouter.post('/verify-otp' , verifyEmail);
userRouter.post('/login' , signInUser);


export {
    userRouter
}