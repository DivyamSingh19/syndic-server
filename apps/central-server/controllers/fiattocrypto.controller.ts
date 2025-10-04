import { Request, Response } from 'express';
import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import bs58 from 'bs58';
import prisma from '@repo/db';

// Configuration
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const SENDER_PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY || ''; // Base58 encoded private key
const SOLANA_AMOUNT = 1.2; 

interface FiatToCryptoRequest {
  success: boolean;
  receiverWallet: string;
  userEmail: string;
}

const sendSolana = async (
  receiverAddress: string,
  amount: number
): Promise<string> => {
 
  const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  
  
  const senderKeypair = Keypair.fromSecretKey(
    bs58.decode(SENDER_PRIVATE_KEY)
  );
  
  
  const receiverPublicKey = new PublicKey(receiverAddress);
  
 
  const lamports = amount * LAMPORTS_PER_SOL;
  
  // Create transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: senderKeypair.publicKey,
      toPubkey: receiverPublicKey,
      lamports: Math.floor(lamports),
    })
  );
  
  // Send and confirm transaction
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [senderKeypair],
    {
      commitment: 'confirmed',
    }
  );
  
  return signature;
};

export const fiatToCryptoController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { success, receiverWallet, userEmail }: FiatToCryptoRequest = req.body;
    
    // Validate required fields
    if (!success || !receiverWallet || !userEmail) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: success, receiverWallet, and userEmail',
      });
      return;
    }
    
    if (success !== true) {
      res.status(400).json({
        success: false,
        error: 'Payment not successful',
      });
      return;
    }
    
    // Verify user exists
    const user = await prisma.users.findUnique({
      where: { email: userEmail }
    });
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }
    
    // Send Solana
    const solanaSignature = await sendSolana(receiverWallet, SOLANA_AMOUNT);
    
    // Store transaction in database
    const transaction = await prisma.fiatToCryptoTransactions.create({
      data: {
        userEmail: userEmail,
        senderCurrency: 'INR',  
        receiverWallet: receiverWallet,
        recieverCrypto: 'SOL',
        routes: {
          create: {
           
          }
        }
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Solana sent successfully',
      solanaSignature,
      amount: SOLANA_AMOUNT,
      receiverWallet,
      transactionId: transaction.id,
      userEmail,
    });
    
  } catch (error) {
    console.error('Error in fiatToCryptoController:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send Solana',
    });
  }
};