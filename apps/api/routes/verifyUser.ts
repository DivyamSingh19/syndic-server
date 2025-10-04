import { cancelVerification,verifyUser } from "../controllers/verifyUser";
import express, {Request,Response} from "express"


const verificationRouter = express.Router()



verificationRouter.post('/verify-user',verifyUser)


verificationRouter.post('/cancel-verification',cancelVerification)



export default verificationRouter