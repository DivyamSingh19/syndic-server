import express,{Request,Response,NextFunction} from "express"
import { getQuote,createTransfer } from "../controllers/fiattofiat.controller"



const fiatToFiatRouter = express.Router()

fiatToFiatRouter.post('/get-quote',async (req:Request,res:Response,next:NextFunction) => {
    try {
        getQuote(req,res)
    } catch (error) {
        next()
    }
})

fiatToFiatRouter.post('/create-transfer',async (req:Request,res:Response,next:NextFunction) => {
    try {
        createTransfer(req,res)
    } catch (error) {
        next()
    }
})


export default fiatToFiatRouter