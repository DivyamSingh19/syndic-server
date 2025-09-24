import { createPin,editPin, verifyPin } from "../controllers/platfornpin";
import express, {Request,Response, NextFunction } from "express"
import { authMiddleware } from "../middlewares/auth";

const pinRouter = express.Router()

pinRouter.post("/create-pin",authMiddleware,async (req:Request,res:Response,next:NextFunction) => {
    try {
        createPin(req,res)
    } catch (error) {
        next()
    }
})


pinRouter.put("/change-pin",authMiddleware,async (req:Request,res:Response,next:NextFunction) => {
    try {
        editPin(req,res)
    } catch (error) {
        next()
    }
})

pinRouter.post('/verify-pin',authMiddleware,async (req:Request,res:Response,next:NextFunction) => {
    try {
        verifyPin(req,res)
    } catch (error) {
        next()
    }
})

export default pinRouter