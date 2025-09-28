import { sendOTP, verifyOTP } from "../controllers/otp";
import express, { NextFunction, Request, Response } from "express";

const otpRouter = express.Router();

otpRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    sendOTP(req,res)
  } catch (error) {
    next()
  }
});

otpRouter.get('/verify-otp',async (req:Request,res:Response,next:NextFunction) => {
    try {
        verifyOTP(req,res)
    } catch (error) {
        next()
    }
}) 


export default otpRouter