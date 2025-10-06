import express , {Request,Response,NextFunction} from "express"
import { getWalletData,addMoney} from "../controllers/wallet.controller"

const walletRouter = express.Router()

walletRouter.post('/get-wallet-data',async (req:Request,res:Response,next:NextFunction) => {
    try {
        getWalletData(req,res)
    } catch (error) {
        next()
    }
})

walletRouter.post('/add-funds',async (req:Request,res:Response,next:NextFunction) => {
    try {
        addMoney(req,res)
    } catch (error) {
        next()
    }
})
  
export default walletRouter