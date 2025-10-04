import express,{Request,Response} from "express"
import { analyzeQuotes, publishBestRoutes } from "../controllers/quote"

const quoteRouter = express.Router()


quoteRouter.get('/get-all-quotes',analyzeQuotes)

quoteRouter.get('/get-best-routes',publishBestRoutes)

export default quoteRouter