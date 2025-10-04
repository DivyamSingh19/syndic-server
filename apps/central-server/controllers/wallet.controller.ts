import prisma from "@repo/db";
import { Request,Response } from "express";



export const getWalletData = async (req:Request,res:Response) => {
    try {
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Error fetching wallet data, internal server error"
        })
    }
}