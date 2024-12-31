import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { getEnvVar } from "./src/utils/env";
import dotenv from "dotenv";
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
const port = getEnvVar("SERVER_PORT", "5000");
dotenv.config();
import {userRouter} from "./src/routes/userRoute"
import {walletRouter} from "./src/routes/walletRoute"
import {quickNodeRouter} from "./src/routes/quickNode"
import { authenticate } from "./src/middlewares/AuthenticateUser";
import cors from 'cors'
const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.Frontend_URL || 'http://localhost:5173', // Frontend origin
    credentials: true, // Allow cookies or other credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json({ limit: '50mb' }));
//?* MIDDLEWARES
app.use(morgan("dev"));
//?* ROUTES
app.use('/webhook/quicknode', quickNodeRouter)
app.use('/api/v1/auth', userRouter);

//app.use(authenticate);
app.use('/api/v1/wallet',authenticate ,walletRouter);
app.get('/testing', (req,res) =>{
  res.send('working')
});

mongoose
  .connect(getEnvVar("MONGODB_URL", "5000"))
  .then(() => {
    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  })
  .catch((res) => {
    console.error(res);
  });


  // Graceful Shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await mongoose.connection.close();
  process.exit(0);
});