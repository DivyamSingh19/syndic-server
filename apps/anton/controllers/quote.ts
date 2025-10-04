import prisma from "@repo/db"
import { Request,Response } from "express"

//core logic to predict the best quote based on the ones that were receieved
export const analyzeQuotes = async (req:Request,res:Response) => {
    try {
        
    } catch (error) {
        return res.json({
            success:false,
            message:"Anton failed to analyze quotes,internal server error"
        })
    }
}

export const publishBestRoutes = async (req:Request,res:Response) => {
    try {
        
    } catch (error) {
        return res.json({
            success:false,
            message:"Failed to publish best routes,internal server error"
        })
    }
}