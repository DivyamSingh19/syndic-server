import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth";

const app = express();
const port = 4000;

// app.use(
//   cors(
//     // origin: process.env.CORS_ORIGIN as string,
//     // credentials: true,
//   )
// );

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/user", authRouter);

app.get("/health", async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "API workin",
  });
});

app.listen(port);
