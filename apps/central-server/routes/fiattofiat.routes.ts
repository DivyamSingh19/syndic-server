import express,{Request,Response} from "express"
import { getQuote } from "../controllers/fiattofiat.controller"



const fiatToFiatRouter = express.Router()

fiatToFiatRouter.post('/get-quote',getQuote)



export default fiatToFiatRouter