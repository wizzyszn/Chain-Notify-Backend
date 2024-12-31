import express, { Request, Response } from "express";
import {
  typeOfResponse,
  UserInt,
} from "../types";
import { createUserSchema } from "../schemas";
import { sendFailedRes, sendSuccessRes } from "../utils/response";
import { userModel } from "../models/userModel";
import bcrypt from "bcryptjs";
import { cleanPassword } from "../utils/general";
import mongoose from "mongoose";
import { createToken } from "../helpers/createToken";
import nodemailer from 'nodemailer'
import { getEnvVar } from "../utils/env";
//create a user with credentials
interface CreateUserRequest extends Request {
  body: UserInt;
}
interface CloseAccountRequest extends Request {
    body : {
        id : mongoose.Schema.Types.ObjectId
    }
}
interface SignInUserRequest extends Request {
    body : {
        email : string,
        password : string
    }
};

interface VerifyEmailRequest extends Request {
  body: {
    email: string;
    otp: string;
  };
}

const transporter = nodemailer.createTransport({
  service: "Yahoo", 
  secure : false,
  auth: {
    user: getEnvVar("EMAIL"),
    pass: getEnvVar("EMAIL_PASSWORD"), 
  },
});

// Generate OTP (6-digit number)
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP to user's email
const sendOTPEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Email Verification OTP",
    text: `Your OTP for email verification is: ${otp}. It is valid for 10 minutes.`,
  };
  await transporter.sendMail(mailOptions);
};

//?* Register User
const createUser = async (req: CreateUserRequest, res: Response) => {
  try {
    const { lastName, firstName, email, password} = req.body;
    const { error } = createUserSchema.validate(
      {
        lastName,
        firstName,
        email,
        password,
      },
      {
        abortEarly: false,
      }
    );
    if (error) {
      const errors = error.details.map((err) => {
        return {
          field: err.type,
          message: err.message,
          path: err.path,
          context: err.context,
        };
      });
      return sendFailedRes(res, 400, undefined, "Validation Error", errors);
    }
    const checkUser = await userModel.findOne({ email });
    if (!checkUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const response = await userModel.create({
        lastName,
        firstName,
        email,
        password: hashedPassword,
      });
      const cleanedCopy = cleanPassword(response);
      return sendSuccessRes(
        cleanedCopy,
        res,
        "Registeration successful",
        201,
        typeOfResponse.json,
        true
      );
    } return sendFailedRes(res, 400, undefined, "User already exists");
    
  } catch (err: any) {
    console.error("Error occurred during user registration:", err);
    return sendFailedRes(
      res,
      500,
      undefined,
      err.message as string
    );
  }
};
//?* Sign in User 
const signInUser = async (req : SignInUserRequest,res : Response) =>{
    const {
        email,
        password
    }= req.body
    try{
        const user = await userModel.findOne({email});
        if(user){
            const checkPassword = await bcrypt.compare(password,user.password);
            if(checkPassword){
              const token = createToken({
                email : email,
                id : user._id
            });
            res.cookie('token', token, {
             
            })
                return sendSuccessRes(cleanPassword(user),res,"Sign in successful", 200, typeOfResponse.json, true)
            }else{
                return sendFailedRes(res,400,undefined,"Incorrect password")
            }
        }else{
            return sendFailedRes(res,400,undefined,"This user doesn't exist please register" )
        }
        
    }catch (err: unknown) {
        console.error("Error occurred during closing account", err);
        return sendFailedRes(
          res,
          500,
          undefined,
          "Error occurred Loggin in......."
        );
      }

}

//?& Logout user
const logoutUser = async(req : CloseAccountRequest, res : Response) =>{
    const {
        id
    } = req.body
    try{
        const response = await userModel.findById(id);
            
    }catch(err){

    }
}
//?* Close Account
const closeAccount = async (req: CloseAccountRequest, res : Response) =>{
    const {id} = req.body
    try{
        const user = await userModel.findById(id);
        if(!user){
            return sendFailedRes(res,400,undefined,"This user does not exist in our database")
        }
        user.deleteOne()
        await user.save()
    }catch (err: unknown) {
        console.error("Error occurred during closing account", err);
        return sendFailedRes(
          res,
          500,
          undefined,
          "Error occurred while we tried closing your account"
        );
      }
}
//?* Request OTP
const requestEmailVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return sendFailedRes(res, 400, undefined, "User not found");
    }

    // Generate OTP and expiration time
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Update user record with OTP and expiration
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // Send OTP to the user's email
    await sendOTPEmail(email, otp);

    return sendSuccessRes(
      { email },
      res,
      "OTP sent successfully. Please check your email.",
      200,
      typeOfResponse.json,
      true
    );
  } catch (err: unknown) {
    console.error("Error during OTP request", err);
    return sendFailedRes(
      res,
      500,
      undefined,
      "Error occurred while requesting OTP"
    );
  }
};


//?* Verify Email With OTP
const verifyEmail = async (req: VerifyEmailRequest, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return sendFailedRes(res, 400, undefined, "User not found");
    }

    if (user.otp !== otp) {
      return sendFailedRes(res, 400, undefined, "Invalid OTP");
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      return sendFailedRes(res, 400, undefined, "OTP has expired");
    }

    // Mark the user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return sendSuccessRes(
      { email },
      res,
      "Email verified successfully",
      200,
      typeOfResponse.json,
      true
    );
  } catch (err: unknown) {
    console.error("Error during email verification", err);
    return sendFailedRes(
      res,
      500,
      undefined,
      "Error occurred during email verification"
    );
  }
};

export { 
    createUser,closeAccount,signInUser,verifyEmail,requestEmailVerification
    
 };
