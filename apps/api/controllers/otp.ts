import prisma from "@repo/db";
import { verifyAccessToken } from "@repo/utils";
import redisSC from "@repo/redis"
import { Request,Response } from "express";

function generateOTP(){
    return Math.floor(100000 + Math.random() *900000).toString();
} 


export const sendOTP = async (req:Request,res:Response) => {
    try {
        const {userEmail}= req.body
        if(!userEmail){
            return res.status(400).json({
                success:false,
                message:"Bad request, email not provided"
            })
        }
        const user = await prisma.users.findUnique({
            where:{email:userEmail}
        })
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }
        const otp = generateOTP();
        // await redisSC.set(`otp:${userEmail}`,otp,"EX",300)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Could not send OTP, internal server error"
        })
    }
}


export const verifyOTP = async (req:Request,res:Response) => {
    try {
        const {userEmail,otp} = req.body
        if(!userEmail||!otp){
            return res.status(400).json({
                success:false,
                message:"Bad request , email or OTP missing"
            })
        }
        // const storedOTP = await redisSC.get(`otp:${userEmail}`)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Could not verify OTP, internal server error"
        })
    }
}