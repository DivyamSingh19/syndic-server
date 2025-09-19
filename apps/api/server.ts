import express,{Request,Response} from "express"
 
const app = express()
const port = 4000



app.get("/health",async (req:Request,res:Response) => {
    res.json({
        success:true,
        message:"API workin"
    })
})

app.listen(port)