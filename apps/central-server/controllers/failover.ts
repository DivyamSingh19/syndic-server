//this is to just resend the top 5 after the first fails from redis
import prisma from "@repo/db";
import { Request,Response } from "express";

export const initializeFailover = async (req:Request,res:Response) => {
    try {
        const {} = req.body;
    } catch (error) {
        return res.status(500).json({
            success:false,
            message :"Failover completion failed"
        })
    }
}

export const completeFailover = async (req:Request,res:Response) => {
    try {
       const {} = req.body
    } catch (error) {
        return res.status(500).json({
            success:false,
            message :"Failover completion failed"
        })
    }
}

export const cancelFailover = async (req:Request,res:Response) => {
    try {
        const {} = req.body
    } catch (error) {
        return res.status(500).json({
            success:false,
            message :"Failover completion failed"
        })
    }
}