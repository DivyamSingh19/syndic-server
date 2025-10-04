import express from "express";
import { Request,Response } from "express";
import cors from "cors"
import quoteRouter from "./routes/quote";
const app = express()
const port = 4001
//middlewares

app.use(express.json())
app.use(cors())


app.get("/health",async (req:Request,res:Response) => {
    try {
         res.status(200).json({
            success:true,
            message:"API working fine"
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Anton has failed"
        })
    }
})

app.use("/anton/api/v1/quote",quoteRouter)

app.listen(port)