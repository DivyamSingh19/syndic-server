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
const SENDER_PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY || ''; 

interface FiatToCryptoRequest {
  success: boolean;
  receiverWallet: string;
  userEmail: string;
  fiatCurrency: string;
  fiatAmount: number;
  cryptoCurrency: string;
  cryptoAmount: number;
}

const sendSolana = async (
  receiverAddress: string,
  amount: number
): Promise<string> => {
  // Validate private key exists
  if (!SENDER_PRIVATE_KEY) {
    throw new Error('SOLANA_PRIVATE_KEY environment variable not set');
  }

  const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  
  // Decode sender keypair
  const senderKeypair = Keypair.fromSecretKey(
    bs58.decode(SENDER_PRIVATE_KEY)
  );
  
  // Validate receiver address
  let receiverPublicKey: PublicKey;
  try {
    receiverPublicKey = new PublicKey(receiverAddress);
  } catch (error) {
    throw new Error('Invalid receiver wallet address');
  }
  
  // Convert SOL to lamports
  const lamports = amount * LAMPORTS_PER_SOL;
  
  if (lamports <= 0) {
    throw new Error('Amount must be greater than 0');
  }
  
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
    const { 
      success, 
      receiverWallet, 
      userEmail, 
      fiatCurrency,
      fiatAmount,
      cryptoCurrency,
      cryptoAmount 
    }: FiatToCryptoRequest = req.body;
    
    // Validate required fields
    if (!success || !receiverWallet || !userEmail || !fiatCurrency || !fiatAmount || !cryptoCurrency || !cryptoAmount) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['success', 'receiverWallet', 'userEmail', 'fiatCurrency', 'fiatAmount', 'cryptoCurrency', 'cryptoAmount']
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

    // Validate amounts
    if (fiatAmount <= 0 || cryptoAmount <= 0) {
      res.status(400).json({
        success: false,
        error: 'Amounts must be greater than 0',
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
    console.log(`Sending ${cryptoAmount} ${cryptoCurrency} to ${receiverWallet}`);
    const solanaSignature = await sendSolana(receiverWallet, cryptoAmount);
    console.log(`Transaction successful: ${solanaSignature}`);
    
    // Store transaction in database with route
    const transaction = await prisma.fiatToCryptoTransactions.create({
      data: {
        userEmail: userEmail,
        senderCurrency: fiatCurrency,
        receiverWallet: receiverWallet,
        recieverCrypto: cryptoCurrency,
      },
    
    });
    
    res.status(200).json({
      success: true,
      message: 'Crypto sent successfully',
      solanaSignature,
      fiatAmount,
      fiatCurrency,
      cryptoAmount,
      cryptoCurrency,
      receiverWallet,
      transactionId: transaction.id,
      userEmail,
    });
    
  } catch (error: any) {
    console.error('Error in fiatToCryptoController:', error);
    
    // More detailed error response
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process transaction',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};