import prisma from "@repo/db";
import { Request,Response } from "express";


//this is just for email verified users we have removed the phone number verification
export const verifyUser = async (req:Request,res:Response) => {
    try {
        const {userEmail} = req.body;
        if(!userEmail){
            return res.status(400).json({
                success:false,
                message:"User email not specified,bad request"
            })
        }
        const user = await prisma.users.findUnique({
            where:{email:userEmail},
          
        })
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        } 
        const verifyUser = await prisma.users.update({
            where:{email:userEmail},
            data:{isVerified:true}
        })
        return res.status(500).json({

        })
    } catch (error) {
        return res.status(500).json({
            succcess:false,
            message:"User verification failed,internal server error"
        })
    }
}

export const cancelVerification = async (req:Request,res:Response) => {
    try {
        const {userEmail} = req.body;
        if(!userEmail){
            return res.status(400).json({
                success:false,
                message:"User email not specified,bad request"
            })
        }
        const user = await prisma.users.findUnique({
            where:{email:userEmail},
          
        })
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"User verification canceled , internal server error"
        })
    }
}