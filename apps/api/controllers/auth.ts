import express, { Request, Response } from "express";
import prisma from "@repo/db";
import { newUser, loginSchema } from "@repo/zod";
import {
  hashPassword,
  verifyPassword,
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashRefreshToken,
  rotateTokens,
} from "@repo/utils";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const validation = newUser.safeParse(req.body);

    if (!validation.success) {
      return res
        .status(400)
        .json({ error: "Enter the data in the correct format" });
    }

    const { firstName, lastName, email, password } = validation.data;

    const existingUser = await prisma.users.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPwd = await hashPassword(password);

    const user = await prisma.users.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPwd,
        isVerified: false,
      },
    });

    const checkUser = await prisma.users.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!checkUser) {
      return res.status(500).json({ error: "Registration Process Failed" });
    } else {
      return res.status(201).json({
        message: "User registered successfully",
        user: user,
      });
    }
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res
        .status(400)
        .json({ error: "Enter the data in the correct format" });
    }

    const { email, password } = validation.data;

    const user = await prisma.users.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPwd = await verifyPassword(password, user.password);

    if (!isValidPwd) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessTokenPayload = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const refreshTokenPayload = {
      userId: user.id,
    };

    const accessToken = createAccessToken(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      process.env.ACCESS_TOKEN_EXPIRY!
    );

    const refreshToken = createRefreshToken(
      refreshTokenPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      process.env.REFRESH_TOKEN_EXPIRY!
    );

    const hashedRefreshToken = await hashRefreshToken(refreshToken);

    await prisma.users.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? ("none" as const)
          : ("lax" as const),
      path: "/",
    };

    console.log("accesstoken", accessToken);
    console.log("refreshtoken", refreshToken);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        message: "User logged in successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const me = async (req: Request, res: Response) => {
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

    const { userId } = decoded as any;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      user: user,
    });
  } catch (error) {
    console.error("Me Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const refreshTokens = async (req: Request, res: Response) => {
  try {
    const normieRT = req.cookies?.refreshToken;

    if (!normieRT) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    const decoded = verifyRefreshToken(
      normieRT,
      process.env.REFRESH_TOKEN_SECRET!
    );

    if (!decoded) {
      return res
        .status(401)
        .json({ error: "Invalid or expired refresh token" });
    }

    const { userId } = decoded as any;

    const user = await prisma.users.findUnique({ where: { id: userId } });

    if (!user || !user.refreshToken) {
      return res
        .status(404)
        .json({ error: "User not found or no refresh token stored" });
    }
    
    const isValidRT = await verifyPassword(
      normieRT,
      user.refreshToken
    );

    if (!isValidRT) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const newTokens = rotateTokens(
      {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET!,
      process.env.REFRESH_TOKEN_SECRET!
    );

    const hashedNewRefreshToken = await hashRefreshToken(
      newTokens.refreshToken
    );

    await prisma.users.update({
      where: { id: userId },
      data: { refreshToken: hashedNewRefreshToken },
    });

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? ("none" as const)
          : ("lax" as const),
      path: "/",
    };

    return res
      .cookie("accessToken", newTokens.accessToken, options)
      .cookie("refreshToken", newTokens.refreshToken, options)
      .json({ message: "Tokens refreshed successfully" });
  } catch (error) {
    console.error("Token refresh error:", error);
    return res.status(500).json({ error: "Token refresh failed" });
  }
};