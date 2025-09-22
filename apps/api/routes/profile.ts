import { setupProfile,editProfile,getUserProfileData } from "../controllers/profile";
import express,{NextFunction, Request,Response} from "express"
const profileRouter = express.Router()

profileRouter.post("/setupProfile",async (req:Request,res:Response,next:NextFunction) => {
    try {
        setupProfile(req,res)
    } catch (error) {
        next()
    }
})

profileRouter.put("/edit-profile",async (req:Request,res:Response,next:NextFunction) => {
    try {
        editProfile(req,res)
    } catch (error) {
        next()
    }
})

profileRouter.get("/user-data",async (req:Request,res:Response,next:NextFunction) => {
    try {
        getUserProfileData(req,res)
    } catch (error) {
        next()
    }
})

export default profileRouter;