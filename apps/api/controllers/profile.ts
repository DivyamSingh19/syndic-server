import prisma from "@repo/db";
import { verifyAccessToken } from "@repo/utils";
import { Request,Response } from "express";
import { setupProfileSchema } from "@repo/zod";
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET as string
export const setupProfile = async (req: Request, res: Response) => {
  try {
    // Get token from cookies
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No authorization token found"
      });
    }

    // Verify token and get user ID
    const decoded = verifyAccessToken(token, accessTokenSecret) as any;
    const userId = decoded.id || decoded.userId; // Adjust based on your JWT payload structure

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    
    const validationResult = setupProfileSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues
      });
    }

    const { phoneNumber, country, address, platformPin } = validationResult.data;

    const existingProfile = await prisma.userProfile.findUnique({
      where: { userID: userId }
    });

    let userProfile;

    if (existingProfile) {
       
      userProfile = await prisma.userProfile.update({
        where: { userID: userId },
        data: {
          phoneNumber,
          country,
          address,
          platformPin,
          pnIsVerified: "false", 
          updatedAt: new Date()
        }
      });

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
          id: userProfile.id,
          phoneNumber: userProfile.phoneNumber,
          country: userProfile.country,
          address: userProfile.address,
          pnIsVerified: userProfile.pnIsVerified,
          createdAt: userProfile.createdAt,
          updatedAt: userProfile.updatedAt
        }
      });
    } else {
      // Create new profile
      userProfile = await prisma.userProfile.create({
        data: {
          phoneNumber,
          country,
          address,
          platformPin,
          pnIsVerified: "false", 
          userID: userId
        }
      });

      return res.status(201).json({
        success: true,
        message: "Profile created successfully",
        data: {
          id: userProfile.id,
          phoneNumber: userProfile.phoneNumber,
          country: userProfile.country,
          address: userProfile.address,
          pnIsVerified: userProfile.pnIsVerified,
          createdAt: userProfile.createdAt,
          updatedAt: userProfile.updatedAt
        }
      });
    }
} catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Couldn't setup profile, internal server error"
    });
  }
};


 //use less right not TODO: later
// export const editProfile = async (req:Request,res:Response) => {
//     try {
        
//     } catch (error) {
//         return res.status(500).json({
//             success:false,
//             message:"Couldn't edit profile, internal server error"
//         })
//     }
// }

export const getUserProfileData = async (req:Request,res:Response) => {
    try {
        const token = req.cookies.accessToken
        if(!token){
            return res.status(400).json({
                success:false,
                message:"No auth token found, bad request"
            })
        }
        const decoded = verifyAccessToken(token,accessTokenSecret) as any
        if(!decoded){
            return res.status(401).json({
                success:false,
                message:"Token invalid or expired"
            })
        }
        const userId = decoded.id || decoded.userId
        const user = await prisma.users.findUnique({
            where:{id:userId}
        })
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }
        const userData = await prisma.userProfile.findUnique({
            where:{userID:userId},
            select:{
                phoneNumber:true,
                country:true,
                address:true,
                pnIsVerified:true,
            }
        })
        if(!userData){
            return res.status(404).json({
                success:false,
                message:"User data not found"
            })
        }
        return res.status(201).json({
            success:true,
            message:"User data fetched successfully",
            data:userData
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Couldn't get data , internal server error"
        })
    }
}