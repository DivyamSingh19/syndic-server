import { sendOTP, verifyOTP } from "../controllers/otp";
import express, { NextFunction, Request, Response } from "express";

const otpRouter = express.Router();

otpRouter.post("/generate-otp",sendOTP);

otpRouter.post('/verify-otp',verifyOTP) 


export default otpRouter