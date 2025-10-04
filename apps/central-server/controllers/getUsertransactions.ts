import prisma from "@repo/db";
import { Request, Response } from "express";

export const getFiatToFiatTransactions = async (
  req: Request,
  res: Response
) => {
  try {
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "userEmail is required",
      });
    }

    // Verify user exists
    const user = await prisma.users.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    
    const transactions = await prisma.fiatToFiatTransaction.findMany({
      where: { userEmail: user.email },
      include: {
        routes: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      message: "Fiat-to-fiat transactions retrieved successfully",
      transactions,
      count: transactions.length,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message:
        "Could not get previous Fiat transactions, Internal server error",
    });
  }
};

export const getFiatToCryptoTransactions = async (
  req: Request,
  res: Response
) => {
  try {
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "userEmail is required",
      });
    }

    // Verify user exists
    const user = await prisma.users.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get fiat-to-crypto transactions (FiatToCryptoTransactions table)
    const transactions = await prisma.fiatToCryptoTransactions.findMany({
      where: { userEmail: userEmail },
      include: {
        routes: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      message: "Fiat-to-crypto transactions retrieved successfully",
      transactions,
      count: transactions.length,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message:
        "Could not get previous Fiat to crypto transactions, Internal server error",
    });
  }
};

export const getCryptoToCryptoTransactions = async (
  req: Request,
  res: Response
) => {
  try {
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "userEmail is required",
      });
    }

    // Verify user exists
    const user = await prisma.users.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

  
    const transactions = await prisma.cryptoTransactions.findMany({
      where: { userEmail: user.email },
      include: {
        routes: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      message: "Crypto-to-crypto transactions retrieved successfully",
      transactions,
      count: transactions.length,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message:
        "Could not get previous crypto transactions, Internal server error",
    });
  }
};
