import { getCryptoToCryptoTransactions,getFiatToCryptoTransactions,getFiatToFiatTransactions } from "../controllers/getUsertransactions";
import express, {Request,Response,NextFunction} from "express"


const previousTransactionRouter =  express.Router()

previousTransactionRouter.post('/crypto-to-crypto',async (req:Request,res:Response,next:NextFunction) => {
    try {
        getCryptoToCryptoTransactions(req,res)
    } catch (error) {
        next()
    }
})
previousTransactionRouter.post('/fiat-to-crypto',async (req:Request,res:Response,next:NextFunction) => {
    try {
        getFiatToCryptoTransactions(req,res)
    } catch (error) {
        next()
    }
})

previousTransactionRouter.post('/fiat-to-fiat',async (req:Request,res:Response,next:NextFunction) => {
    try {
        getFiatToFiatTransactions(req,res)
    } catch (error) {
        next()
    }
})

export default previousTransactionRouter