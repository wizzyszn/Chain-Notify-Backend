import { Request, Response, NextFunction } from "express";
import crypto from 'crypto';

// Middleware to verify QuickNode signature
export const verifyQuickNodeSignature = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
    const signature = req.headers["x-quicknode-signature"] as string;
    const secretKey = process.env.QUICKNODE_SECRET_KEY as string;
  
    const payload = JSON.stringify(req.body);
    const hash = crypto.createHmac("sha256", secretKey).update(payload).digest("hex");
  
    if (hash !== signature) {
      res.status(401).json({ success: false, message: "Unauthorized request" });
      return;
    }
  
    next();
};