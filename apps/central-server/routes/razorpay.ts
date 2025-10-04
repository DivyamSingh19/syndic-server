
import express,{Request,Response} from "express"
import { createPayment, verifyPayment } from "../controllers/razorpay"

const razorpayRouter = express.Router()


razorpayRouter.post('/create-transaction',createPayment)


razorpayRouter.post('/verify-payment',verifyPayment)

razorpayRouter.get("/",
    async (req:Request,res:Response) => {
        try {
            res.json(
                {
                    success:true,
                    message:"API works"
                }
            )
        } catch (error) {
            console.log(error)
            return res.json({
                success:false,
                message:"API failed"
            })
        }
    }
)

export default razorpayRouter