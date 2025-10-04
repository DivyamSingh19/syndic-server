//core transaction logic => 
import prisma from "@repo/db";
import { Request,Response } from "express";


export const getTransactionData = async (req:Request,res:Response) => {
    try {
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Failed to send transaction data, internal server error"
        })
    }
}
export const initializeTransaction = async (req:Request,res:Response) => {
    try {
        
    } catch (error) {
         return res.status(500).json({
            success:false,
            message:"Failed to initialize transaction, internal server error"
        })
    }
}


export const failedTransaction = async (req:Request,res:Response) => {
    try {
        
    } catch (error) {
      return res.status(500).json({
            success:false,
            message:"Unable to store failed transaction, internal server error"
        })  
    }
}


export const successfultransaction = async (req:Request,res:Response) => {
    try{

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to store successful transaction, internal server error"
        })
    }
}


export const getSuccessfulUserTransactions = async (req:Request,res:Response) => {
    try {
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable fetch successful transactions, internal server error"
        })
    }
}

export const getFailedUserTransactions = async (req:Request,res:Response) => {
    try {
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable fetch failed transactions, internal server error"
        })
    }
}