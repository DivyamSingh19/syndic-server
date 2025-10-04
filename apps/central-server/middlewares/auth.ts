import { verifyAccessToken } from "@repo/utils";
import { Request,Response,NextFunction } from "express";

interface AuthenticatedRequest extends Request{
    userId:string
}
export const authMiddleware = (req:AuthenticatedRequest,res:Response,next:NextFunction)=>{
    try {
        const token = req.cookies?.accessToken
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Not authenticated to access"
            })
        }
        const decoded =verifyAccessToken(token,process.env.ACCESS_TOKEN_SECRET as string)
        if(!decoded){
            return res.status(401).json({
                success:false,
                message:"User not found"
            })
        }
        req.userId = decoded as any
        next()
    } catch (error) {
        return res.status(500).json({
            success:false,
            error:"Failed to complete authentication , try again later"
        })
    }
}