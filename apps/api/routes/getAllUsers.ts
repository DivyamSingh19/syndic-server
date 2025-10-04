import { getAllUsers } from "../controllers/getAllUsers";
import express,{NextFunction, Request,Response} from "express"



const getUserRouter = express.Router()


getUserRouter.get('/',async (req:Request,res:Response,next:NextFunction) => {
    try {
        getAllUsers(req,res)
    } catch (error) {
        next()
    }
})


export default getUserRouter