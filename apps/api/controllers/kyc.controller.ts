import { Request, Response } from 'express';
import prisma from '@repo/db';
// Add new KYC information
export const addKYCInfo = async (req: Request, res: Response) => {
  try {
    const { userId, panNumber, aadhaarNumber, panImageUrl, aadhaarImageUrl, status } = req.body;

    // Validate required fields
    if (!userId || !panNumber || !aadhaarNumber || !panImageUrl || !aadhaarImageUrl) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if KYC already exists
    const existingKYC = await prisma.userKYC.findUnique({
      where: { userId }
    });

    if (existingKYC) {
      return res.status(409).json({
        success: false,
        message: 'KYC already exists for this user'
      });
    }

    // Create KYC record
    const kycData = await prisma.userKYC.create({
      data: {
        userId,
        panNumber,
        aadhaarNumber,
        panImageUrl,
        aadhaarImageUrl
      }
    });

    return res.status(201).json({
      success: true,
      message: 'KYC added successfully',
      data: kycData
    });

  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'PAN or Aadhaar number already exists'
      });
    }

    console.error('Error adding KYC:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update existing KYC information
export const updateKYC = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { panNumber, aadhaarNumber, panImageUrl, aadhaarImageUrl } = req.body;

    // Check if KYC exists
    const existingKYC = await prisma.userKYC.findUnique({
      where: { userId }
    });

    if (!existingKYC) {
      return res.status(404).json({
        success: false,
        message: 'KYC not found'
      });
    }

    // Update KYC record
    const updatedKYC = await prisma.userKYC.update({
      where: { userId },
      data: {
        ...(panNumber && { panNumber }),
        ...(aadhaarNumber && { aadhaarNumber }),
        ...(panImageUrl && { panImageUrl }),
        ...(aadhaarImageUrl && { aadhaarImageUrl })
      }
    });

    return res.status(200).json({
      success: true,
      message: 'KYC updated successfully',
      data: updatedKYC
    });

  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'PAN or Aadhaar number already exists'
      });
    }

    console.error('Error updating KYC:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};