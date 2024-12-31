import { Request, Response, NextFunction } from "express";

// Middleware to verify API Key
export const verifyAPIKey = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
    const apiKey = req.headers["x-api-key"];
    const validApiKey = process.env.QUICK_API_KEY;
  
    if (apiKey !== validApiKey) {
      res.status(403).json({ success: false, message: "Invalid API key" });
      return;
    }
  
    next();
};