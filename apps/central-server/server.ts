import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { Request,Response } from "express"
import razorpayRouter from "./routes/razorpay"
import fiatToCryptoRouter from "./routes/fiattocrypto.route"
import previousTransactionRouter from "./routes/getUserTransactions.routes"
import walletRouter from "./routes/wallet.router"


const app = express()
const port = 5000
app.use(express.json())
app.use(cors())
app.use(cookieParser())

app.get('/health', async (req:Request,res:Response) => {
    try {
        res.status(500).json({
            success:true,
            message:"Server working"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Server failed"
        })
    }
})

app.use('/api/v2/razorpay',razorpayRouter)
// app.use('/api/v2/demo-transaction',demoTransactionRouter)
app.use('/api/v2/transaction/combination',fiatToCryptoRouter)
app.use('/api/v2/get-transaction-data',previousTransactionRouter)
app.use('/api/v2/wallet',walletRouter)
app.listen(port,()=>{
    console.log("Server started on :",port)
})