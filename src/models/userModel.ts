import mongoose, { Schema, Model, Document } from "mongoose";
import { UserInt}from"../types";
import { string } from "joi";
const userSchema: Schema<UserInt> = new Schema<UserInt>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    avi : String,
    password : {
      type : String,
      required : true
    },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    isVerified: { type: Boolean, default: false },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    wallet : {
      address: { type: String },
      balance: { type: Number, default: 0 },
      network: { type: String },    
      tokens : [
        {
          tokenName: { type: String },
          tokenSymbol: { type: String },
          amount: { type: Number },
        },
      ],
      transactions: [
        {
          hash: { type: String, },
          type: { type: String, enum: ["sent", "received"] },
          amount: { type: Number,  },
          token: { type: String,  },
          date: { type: Date, },
          read : {
            type : Boolean,
            default : false
          },
          message : String,
          from: { type: String }
        }]
    },
  },
  { timestamps: true }
);

const userModel: Model<UserInt> = mongoose.model<UserInt>("User", userSchema);

export { userModel };
