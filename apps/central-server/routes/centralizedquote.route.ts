import express,{Request,Response} from "express"
import prisma from "@repo/db"
//for fiat to fiat


export const getTransactionData = async (req:Request,res:Response) => {
    try {
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Coudn't get transaction data, internal server error"
        })
    }
}

export const sendOptimalRoutes = async (req:Request,res:Response) => {
    try {
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Error sending optimal routes, internal server error"
        })
    }
}