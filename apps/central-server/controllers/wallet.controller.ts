import prisma from "@repo/db";
import { Request,Response } from "express";



export const getWalletData = async (req:Request,res:Response) => {
    try {
        const { userEmail } = req.body;
        
        if (!userEmail) {
            return res.status(400).json({
                success: false,
                message: "User email is required"
            });
        }

       
        const user = await prisma.users.findUnique({
            where: { email: userEmail }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

     
        const walletData = await prisma.syndicWallet.findUnique({
            where: { userEmail: userEmail },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        if (!walletData) {
            return res.status(404).json({
                success: false,
                message: "Wallet not found. Please contact support."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Wallet data retrieved successfully",
            data: walletData
        });

    } catch (error) {
        console.error('Error fetching wallet data:', error);
        return res.status(500).json({
            success: false,
            message: "Error fetching wallet data, internal server error"
        });
    }
}

export const addMoney = async (req:Request,res:Response) => {
    try {
        const { receiverEmail, amount, currency } = req.body;
        
        if (!receiverEmail || !amount || !currency) {
            return res.status(400).json({
                success: false,
                message: "Receiver email, amount, and currency are required"
            });
        }
        const validCurrencies = ['AED', 'INR', 'USD'];
        if (!validCurrencies.includes(currency)) {
            return res.status(400).json({
                success: false,
                message: "Invalid currency. Supported currencies: AED, INR, USD"
            });
        }

        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be a positive number"
            });
        }

        // Verify user exists
        const user = await prisma.users.findUnique({
            where: { email: receiverEmail }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Receiver not found"
            });
        }

        // Get wallet data
        const wallet = await prisma.syndicWallet.findUnique({
            where: { userEmail: receiverEmail }
        });

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: "Wallet not found. Please ensure user has completed registration."
            });
        }

        // Update wallet balance
        const updateData: any = {};
        const currentBalance = wallet[`total${currency}` as keyof typeof wallet] as number;
        updateData[`total${currency}`] = currentBalance + amount;

        await prisma.syndicWallet.update({
            where: { userEmail: receiverEmail },
            data: updateData
        });

        // Get updated wallet with user information
        const updatedWallet = await prisma.syndicWallet.findUnique({
            where: { userEmail: receiverEmail },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: `Successfully added ${amount} ${currency} to wallet`,
            data: updatedWallet
        });

    } catch (error) {
        console.error('Error adding money to wallet:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to add money to wallet, internal server error"
        });
    }
}

export const deductMoney = async (req: Request, res: Response) => {
    try {
        const { receiverEmail, amount, currency } = req.body;
        
        if (!receiverEmail || !amount || !currency) {
            return res.status(400).json({
                success: false,
                message: "Receiver email, amount, and currency are required"
            });
        }

        // Validate currency
        const validCurrencies = ['AED', 'INR', 'USD'];
        if (!validCurrencies.includes(currency)) {
            return res.status(400).json({
                success: false,
                message: "Invalid currency. Supported currencies: AED, INR, USD"
            });
        }

        // Validate amount
        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be a positive number"
            });
        }

        // Get wallet data
        const wallet = await prisma.syndicWallet.findUnique({
            where: { userEmail: receiverEmail }
        });

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: "Wallet not found for this user"
            });
        }

        const currentBalance = wallet[`total${currency}` as keyof typeof wallet] as number;
        
        // Check if sufficient balance
        if (currentBalance < amount) {
            return res.status(400).json({
                success: false,
                message: `Insufficient balance. Current ${currency} balance: ${currentBalance}, Required: ${amount}`
            });
        }

        // Deduct amount
        const updateData: any = {};
        updateData[`total${currency}`] = currentBalance - amount;

        const updatedWallet = await prisma.syndicWallet.update({
            where: { userEmail: receiverEmail },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: `Successfully deducted ${amount} ${currency} from wallet`,
            data: updatedWallet
        });

    } catch (error) {
        console.error('Error deducting money from wallet:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to deduct money from wallet, internal server error"
        });
    }
}