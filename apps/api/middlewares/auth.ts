import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@repo/utils";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    const decoded = verifyAccessToken(token, process.env.ACCESS_TOKEN_SECRET!);

    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = decoded as any;
    next(); 
  } catch (error) {
    return res.status(401).json({ error: "Authentication failed" });
  }
};
