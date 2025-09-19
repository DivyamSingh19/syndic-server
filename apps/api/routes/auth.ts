import express,{Request,Response} from "express"
import { registerUser,loginUser } from "../controllers/auth";
const authRouter = express.Router();


authRouter.post("/register",async (req:Request,res:Response) => {
    
})

authRouter.post("/login",async (req:Request,res:Response) => {
    
})


export default authRouter