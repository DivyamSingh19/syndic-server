 import { fiatToCryptoController } from "../controllers/fiattocrypto.controller";
 import express,{NextFunction, Request,Response} from "express"

 const fiatToCryptoRouter = express.Router()


 fiatToCryptoRouter.post("/fiat-to-crypto",async (req:Request,res:Response,next:NextFunction) => {
    try {
        fiatToCryptoController(req,res)
    } catch (error) {
        next()
    }
 })


 export default fiatToCryptoRouter