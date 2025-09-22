import { createPin,editPin } from "../controllers/platfornpin";
import express, {Request,Response, NextFunction } from "express"

const pinRouter = express.Router()

pinRouter.post("/",async (req:Request,res:Response,next:NextFunction) => {
    try {
        createPin(req,res)
    } catch (error) {
        next()
    }
})


pinRouter.put("/change-pin",async (req:Request,res:Response,next:NextFunction) => {
    try {
        editPin(req,res)
    } catch (error) {
        
    }
})



export default pinRouter