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

// Configuration
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const SENDER_PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY || ''; // Base58 encoded private key
const SOLANA_AMOUNT = 0.01; // Hardcoded amount in SOL

interface FiatToCryptoRequest {
  success: boolean;
  receiverWallet: string;
}

/**
 * Send Solana to receiver wallet
 */
const sendSolana = async (
  receiverAddress: string,
  amount: number
): Promise<string> => {
  // Initialize connection
  const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  
  // Get sender keypair from private key
  const senderKeypair = Keypair.fromSecretKey(
    bs58.decode(SENDER_PRIVATE_KEY)
  );
  
  // Get receiver public key
  const receiverPublicKey = new PublicKey(receiverAddress);
  
  // Convert SOL to lamports
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

/**
 * Main controller for Fiat to Crypto conversion
 */
export const fiatToCryptoController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { success, receiverWallet }: FiatToCryptoRequest = req.body;
    
    // Validate required fields
    if (!success || !receiverWallet) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: success and receiverWallet',
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
    
    // Send Solana
    const solanaSignature = await sendSolana(receiverWallet, SOLANA_AMOUNT);
    
    res.status(200).json({
      success: true,
      message: 'Solana sent successfully',
      solanaSignature,
      amount: SOLANA_AMOUNT,
      receiverWallet,
    });
    
  } catch (error) {
    console.error('Error in fiatToCryptoController:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send Solana',
      details: error.message,
    });
  }
};