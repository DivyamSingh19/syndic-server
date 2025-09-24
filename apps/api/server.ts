import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth";
import profileRouter from "./routes/profile";
import pinRouter from "./routes/pin";

const app = express();
const port = 4000;
 
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());










//APIs
app.use("/api/v1/auth", authRouter); //auth
app.use("/api/v1/user",profileRouter) //profile
app.use("/api/v1/pin",pinRouter) //pin








app.get("/health", async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "API workin",
  });
});

app.listen(port);
