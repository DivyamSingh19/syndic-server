import { setupProfile,editProfile,getUserProfileData } from "../controllers/profile";
import express,{NextFunction, Request,Response} from "express"
import { authMiddleware } from "../middlewares/auth";
const profileRouter = express.Router()

profileRouter.post("/setupProfile",authMiddleware,async (req:Request,res:Response,next:NextFunction) => {
    try {
        setupProfile(req,res)
    } catch (error) {
        next()
    }
})

profileRouter.put("/edit-profile",authMiddleware,async (req:Request,res:Response,next:NextFunction) => {
    try {
        editProfile(req,res)
    } catch (error) {
        next()
    }
})

profileRouter.get("/user-data",authMiddleware,async (req:Request,res:Response,next:NextFunction) => {
    try {
        getUserProfileData(req,res)
    } catch (error) {
        next()
    }
})

export default profileRouter;