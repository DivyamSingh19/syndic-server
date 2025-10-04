import prisma from "@repo/db";
import { hashPassword, verifyAccessToken } from "@repo/utils";
import { newPin } from "@repo/zod";
import { Request, Response } from "express";
export const createPin = async (req: Request, res: Response) => {
  try {
    const token = await req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }
    const decoded = verifyAccessToken(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    );
    if (!decoded) {
      return res.json({
        success: false,
        message: "Invalid or expired token",
      });
    }
    const { userId } = decoded as any;
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
      },
    });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    const verifyPin = newPin.safeParse(req.body);
    if (!verifyPin.success) {
      return res.json({
        success: false,
        message: "Invalid format",
      });
    }
    const pin = verifyPin.data;
    const existingPin = await prisma.userPlatformPin.findUnique({
      where: { userID: userId },
      select: { platformPin: true },
    });

    if (existingPin?.platformPin !== null) {
      return res.json({
        success: false,
        message: "Pin has already been set",
      });
    }
    const hashedPin = await hashPassword(pin.toString());
    const updatedPin = await prisma.userPlatformPin.upsert({
      where: { userID: userId },
      update: {
        platformPin: hashedPin,
      },
      create: {
        userID: userId,
        platformPin: hashedPin,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Pin set successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Pin creation failed, internal server error",
    });
  }
};
export const editPin = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.accessToken;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token not found",
      });
    }
    
    const decoded = verifyAccessToken(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    );
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Token invalid or expired",
      });
    }
    
    const { userId } = decoded as any;
    
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
      },
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const verifyPin = newPin.safeParse(req.body);
    
    if (!verifyPin.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid format",
       
      });
    }
    
    const { pin } = verifyPin.data;
    
    const existingPin = await prisma.userPlatformPin.findUnique({
      where: { userID: userId },
      select: { platformPin: true },
    });
    
    if (!existingPin) {
      return res.status(404).json({
        success: false,
        message: "User PIN record not found. Please create a PIN first",
      });
    }
    
    if (existingPin.platformPin === null) {
      return res.status(400).json({
        success: false,
        message: "No PIN found. Please create a PIN first"
      });
    }

   const hashedPin = await hashPassword(pin.toString())
    const updatedPin = await prisma.userPlatformPin.update({
      where: { userID: userId },
      data: {
        platformPin: hashedPin, 
      },
    });
    
    return res.status(200).json({
      success: true,
      message: "PIN updated successfully",
    });
    
  } catch (error) {
    console.error("PIN edit error:", error);
    return res.status(500).json({
      success: false,
      message: "Couldn't edit PIN, internal server error",
    });
  }
};


export const verifyPin = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.accessToken
    if(!token){
        return res.json({
            success:false,
            message:"Token not found"
        })
    }
    const decoded = verifyAccessToken(token, process.env.ACCESS_TOKEN_SECRET as string)
    if(!decoded){   
      return res.json({
        success:false,
        message:"Token invalid or expired"
      })
    }
    const {userId} = decoded as any
    const user = await prisma.users.findUnique({
      where:{id:userId},
      select:{
        id:true
      }
    })
    if(!user){
      return res.json({
        success:false,
        message:"User not found"
      })
    }

    const userID = user.id;
    const { pin } = req.body;
    if(!pin){
      return res.json({
        success:false,
        message:"PIN is required"
      })
    }
    const hashedPin = await hashPassword(pin.toString())
    const userPin = await prisma.userPlatformPin.findUnique({
      where: { userID },
      select: { platformPin: true },  
    })
    if (!userPin || !userPin.platformPin) {
      return res.json({
        success: false,
        message: "No PIN set for this user",
      });
    } 
    if (userPin.platformPin !== hashedPin) {
      return res.json({
        success: false,
        message: "Incorrect PIN",
      });
    } 
    return res.status(200).json({
      success: true,
      message: "PIN verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Verification failed, internal server error",
    });
  }
};
