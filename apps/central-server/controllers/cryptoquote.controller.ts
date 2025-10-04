import prisma from "@repo/db";
import { Request,Response } from "express";


export const getTransactionData = async (req:Request,res:Response) => {
    try {
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Could not get transaction data, internal server error"
        })
    }
}


export const getQuotes = async (req:Request,res:Response) => {
    try {
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Could not get quotes, internal server error"
        })
    }
}

export const initializeTransaction = async (req:Request,res:Response) => {
    try {
        
    } catch (error) {
        return res.status(500).json({
            success:"false",
            message:"Could not initialize transaction"
        })
    }
}

export const cancelTransaction = async (req:Request,res:Response) => {
    try {
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Could not cancel transaction, internal server error"
        })
    }
}
export const saveTransaction = async (req:Request,res:Response) => {
    try {
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Could not save transaction, internal server error"
        })
    }
}