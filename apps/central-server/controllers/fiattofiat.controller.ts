//main fiat to fiat controller
//create-payment => step 1 . first hit get quotes
//               => step 2 . Second intialize transaction (success:true from fronted api call send money to user wallet)
//               => step 3 . Make a dummy blockchain transaction to show that the system interacts with the blc
//               => step 4 . Credit the amount-fees in receiver's wallet on synic (api/v2/wallet/add-funds)

import { Request, Response } from 'express';
import axios from 'axios';
import prisma from '@repo/db';

interface QuoteRequest {
  senderEmail: string;
  amount: string;
  senderCurrency: string;
  receiverCurrency: string;
  receiverCountry: string;
}

interface ProviderQuote {
  provider: string;
  amount: number;
  currency: string;
  fees: number;
  exchangeRate: number;
  estimatedDelivery: string;
  providerId: string;
}

interface WiseQuoteResponse {
  id?: string;
  sourceAmount?: number;
  targetAmount?: number;
  sourceCurrency?: string;
  targetCurrency?: string;
  rate?: number;
  fee?: string;
  time?: string;
}

interface PayPalQuoteResponse {
  conversion_result?: {
    currency_code?: string;
    value?: string;
  };
  conversion_rate?: string;
  fee?: string;
}

export const getQuote = async (req: Request, res: Response) => {
  try {
    const { senderEmail, amount, senderCurrency, receiverCurrency, receiverCountry }: QuoteRequest = req.body;

 
    if (!senderEmail || !amount || !senderCurrency || !receiverCurrency || !receiverCountry) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: senderEmail, amount, senderCurrency, receiverCurrency, receiverCountry'
      });
    }

    // Validate sender user exists
    const sender = await prisma.users.findUnique({
      where: { email: senderEmail }
    });

    if (!sender) {
      return res.status(404).json({
        success: false,
        message: 'Sender not found'
      });
    }

    // Validate currencies
    const validCurrencies = ['USD', 'EUR', 'GBP', 'AED', 'INR', 'JPY', 'CAD', 'AUD'];
    if (!validCurrencies.includes(senderCurrency) || !validCurrencies.includes(receiverCurrency)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid currency. Supported currencies: USD, EUR, GBP, AED, INR, JPY, CAD, AUD'
      });
    }

    // Parse amount
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    const quotes: ProviderQuote[] = [];

     
    try {
      const wiseQuote = await getWiseQuote(numericAmount, senderCurrency, receiverCurrency);
      if (wiseQuote) {
        quotes.push(wiseQuote);
      }
    } catch (error) {
      console.error('Wise API error:', error);
    }

    // Get quote from PayPal
    try {
      const paypalQuote = await getPayPalQuote(numericAmount, senderCurrency, receiverCurrency);
      if (paypalQuote) {
        quotes.push(paypalQuote);
      }
    } catch (error) {
      console.error('PayPal API error:', error);
    }

    if (quotes.length === 0) {
      return res.status(503).json({
        success: false,
        message: 'Unable to get quotes from any providers'
      });
    }

    // Store quote request in database for tracking
    const quoteRecord = await prisma.fiatToFiatTransaction.create({
      data: {
        userEmail: sender.email,
        senderCurrency,
        receiverCurrency,
        senderCountry: senderCurrency,  
        receiverCountry,
        routes: {
          create: {}
        }
      }
    });

    // Find best quote (lowest fees)
    const bestQuote = quotes.reduce((best, current) => 
      current.fees < best.fees ? current : best
    );

    return res.status(200).json({
      success: true,
      message: 'Quotes retrieved successfully',
      quotes,
      bestQuote,
      quoteId: quoteRecord.id,
      originalAmount: `${amount} ${senderCurrency}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting quotes:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching quotes'
    });
  }
};

 
 
const getWiseQuote = async (amount: number, fromCurrency: string, toCurrency: string): Promise<ProviderQuote | null> => {
  try {
     
    const mockExchangeRates: { [key: string]: number } = {
      'USD_EUR': 0.8534,
      'USD_GBP': 0.7921,
      'USD_AED': 3.6725,
      'USD_INR': 83.12,
      'USD_JPY': 149.85,
      'USD_CAD': 1.3654,
      'USD_AUD': 1.5218,
      'EUR_USD': 1.1721,
      'EUR_GBP': 0.9275,
      'EUR_AED': 4.2987,
      'EUR_INR': 96.84,
      'EUR_JPY': 175.65,
      'EUR_CAD': 1.6023,
      'EUR_AUD': 1.7854,
      'GBP_USD': 1.2634,
      'GBP_EUR': 1.0781,
      'GBP_AED': 4.6321,
      'GBP_INR': 104.85,
      'GBP_JPY': 189.21,
      'GBP_CAD': 1.7281,
      'GBP_AUD': 1.9241,
      'AED_USD': 0.2723,
      'AED_EUR': 0.2326,
      'AED_GBP': 0.2158,
      'AED_INR': 22.65,
      'AED_JPY': 40.81,
      'AED_CAD': 0.3716,
      'AED_AUD': 0.4135,
      'INR_USD': 0.0120,
      'INR_EUR': 0.0103,
      'INR_GBP': 0.0095,
      'INR_AED': 0.0441,
      'INR_JPY': 1.8034,
      'INR_CAD': 0.0164,
      'INR_AUD': 0.0182
    };

    if (fromCurrency === toCurrency) {
      return {
        provider: 'Wise',
        amount: amount,
        currency: toCurrency,
        fees: 0,
        exchangeRate: 1,
        estimatedDelivery: 'Same day',
        providerId: `wise_${Date.now()}`
      };
    }

    const rateKey = `${fromCurrency}_${toCurrency}`;
    let exchangeRate = mockExchangeRates[rateKey];

    // If direct rate not found, use USD as intermediary
    if (!exchangeRate) {
      const usdFrom = mockExchangeRates[`${fromCurrency}_USD`];
      const usdTo = mockExchangeRates[`USD_${toCurrency}`];
      if (usdFrom && usdTo) {
        exchangeRate = usdFrom * usdTo;
      } else {
        console.log(`No mock rate found for ${fromCurrency} to ${toCurrency}`);
        return null;
      }
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const fee = amount * 0.008; // Wise typically charges ~0.8%

    // Add some realistic variance to simulate market fluctuation
    const variance = 0.95 + Math.random() * 0.1; // ±2.5% variance
    const adjustedExchangeRate = exchangeRate * variance;
    const adjustedTargetAmount = adjustedExchangeRate * amount;

    return {
      provider: 'Wise',
      amount: Math.round(adjustedTargetAmount * 100) / 100, // Round to 2 decimal places
      currency: toCurrency,
      fees: Math.round(fee * 100) / 100,
      exchangeRate: Math.round(adjustedExchangeRate * 10000) / 10000, // Round to 4 decimal places
      estimatedDelivery: '1-2 business days',
      providerId: `wise_${Date.now()}`
    };

  } catch (error) {
    console.error('Wise Mock API error:', error);
    return null;
  }
};

// PayPal Mock API - Simulates real PayPal response
const getPayPalQuote = async (amount: number, fromCurrency: string, toCurrency: string): Promise<ProviderQuote | null> => {
  try {
    // Use same mock rates as Wise but with slight differences to simulate different providers
    const mockExchangeRates: { [key: string]: number } = {
      'USD_EUR': 0.8534,
      'USD_GBP': 0.7921,
      'USD_AED': 3.6725,
      'USD_INR': 83.12,
      'USD_JPY': 149.85,
      'USD_CAD': 1.3964,
      'USD_AUD': 1.5218,
      'EUR_USD': 1.1721,
      'EUR_GBP': 0.9275,
      'EUR_AED': 4.2987,
      'EUR_INR': 96.84,
      'EUR_JPY': 175.65,
      'EUR_CAD': 1.6023,
      'EUR_AUD': 1.7854,
      'GBP_USD': 1.2634,
      'GBP_EUR': 1.0781,
      'GBP_AED': 4.6321,
      'GBP_INR': 104.85,
      'GBP_JPY': 189.21,
      'GBP_CAD': 1.7281,
      'GBP_AUD': 1.9241,
      'AED_USD': 0.2723,
      'AED_EUR': 0.2326,
      'AED_GBP': 0.2158,
      'AED_INR': 22.65,
      'AED_JPY': 40.81,
      'AED_CAD': 0.3716,
      'AED_AUD': 0.4135,
      'INR_USD': 0.0120,
      'INR_EUR': 0.0103,
      'INR_GBP': 0.0095,
      'INR_AED': 0.0441,
      'INR_JPY': 1.8034,
      'INR_CAD': 0.0164,
      'INR_AUD': 0.0182
    };

    if (fromCurrency === toCurrency) {
      return {
        provider: 'PayPal',
        amount: amount,
        currency: toCurrency,
        fees: 0,
        exchangeRate: 1,
        estimatedDelivery: 'Instant',
        providerId: `paypal_${Date.now()}`
      };
    }

    const rateKey = `${fromCurrency}_${toCurrency}`;
    let exchangeRate = mockExchangeRates[rateKey];

    // If direct rate not found, use USD as intermediary
    if (!exchangeRate) {
      const usdFrom = mockExchangeRates[`${fromCurrency}_USD`];
      const usdTo = mockExchangeRates[`USD_${toCurrency}`];
      if (usdFrom && usdTo) {
        exchangeRate = usdFrom * usdTo;
      } else {
        console.log(`No mock rate found for ${fromCurrency} to ${toCurrency}`);
        return null;
      }
    }

    // Simulate PayPal API delay (faster than Wise)
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 500));

    // PayPal typically has slightly worse rates than Wise
    const paypalPremium = 0.98; // 2% worse than market rate
    const adjustedExchangeRate = exchangeRate * paypalPremium;
    
    // PayPal fee structure: 2.9% + $0.30 (converted to source currency for non-USD)
    const baseFee = amount * 0.029;
    const fixedFeeUSD = 0.30;
    const fixedFeeInSourceCurrency = fromCurrency === 'USD' ? fixedFeeUSD : fixedFeeUSD / mockExchangeRates[`USD_${fromCurrency}`];
    const totalFee = baseFee + fixedFeeInSourceCurrency;

    // Add some variance to simulate market fluctuation (less variance than Wise)
    const variance = 0.98 + Math.random() * 0.04; // ±1% variance
    const finalExchangeRate = adjustedExchangeRate * variance;
    const targetAmount = finalExchangeRate * amount;

    return {
      provider: 'PayPal',
      amount: Math.round(targetAmount * 100) / 100, // Round to 2 decimal places
      currency: toCurrency,
      fees: Math.round(totalFee * 100) / 100,
      exchangeRate: Math.round(finalExchangeRate * 10000) / 10000, // Round to 4 decimal places
      estimatedDelivery: 'Instant',
      providerId: `paypal_${Date.now()}`
    };

  } catch (error) {
    console.error('PayPal Mock API error:', error);
    return null;
  }
};

interface TransferRequest {
  senderEmail: string;
  receiverEmail: string;
  senderCountry: string;
  receiverCountry: string;
  sentAmount: number;
  receiverAmount: number;
  senderCurrency: string;
  receiverCurrency: string;
  provider: string;
  fees: number;
}

export const createTransfer = async (req: Request, res: Response) => {
  try {
    const {
      senderEmail,
      receiverEmail,
      senderCountry,
      receiverCountry,
      sentAmount,
      receiverAmount,
      senderCurrency,
      receiverCurrency,
      provider,
      fees
    }: TransferRequest = req.body;

  
    if (!senderEmail || !receiverEmail || !senderCountry || !receiverCountry || 
        !sentAmount || !receiverAmount || !senderCurrency || !receiverCurrency || !provider) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: senderEmail, receiverEmail, senderCountry, receiverCountry, sentAmount, receiverAmount, senderCurrency, receiverCurrency, provider'
      });
    }

    // Validate currencies
    const validCurrencies = ['USD', 'AED', 'INR'];
    if (!validCurrencies.includes(senderCurrency) || !validCurrencies.includes(receiverCurrency)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid currency. Supported currencies: USD, AED, INR'
      });
    }

    // Use Prisma transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Get sender and receiver details
      const [sender, receiver] = await Promise.all([
        tx.users.findUnique({
          where: { email: senderEmail }
        }),
        tx.users.findUnique({
          where: { email: receiverEmail }
        })
      ]);

      if (!sender || !receiver) {
        throw new Error('Sender or receiver not found');
      }

    
      const [senderWallet, receiverWallet] = await Promise.all([
        tx.syndicWallet.findUnique({ 
          where: { userEmail: senderEmail }
        }),
        tx.syndicWallet.findUnique({
          where: { userEmail: receiverEmail }
        })
      ]);

      if (!senderWallet || !receiverWallet) {
        throw new Error('Wallet not found for sender or receiver');
      }

      
      const senderCurrencyField = `total${senderCurrency}` as 'totalUSD' | 'totalAED' | 'totalINR';
      const receiverCurrencyField = `total${receiverCurrency}` as 'totalUSD' | 'totalAED' | 'totalINR';
      
      if (senderWallet[senderCurrencyField] < sentAmount) {
        throw new Error(`Insufficient ${senderCurrency} balance`);
      }

      // Deduct amount from sender's wallet
      await tx.syndicWallet.update({
        where: { userEmail: senderEmail },
        data: { 
          [senderCurrencyField]: { 
            decrement: sentAmount 
          } 
        }
      });

      // Add amount to receiver's wallet
      await tx.syndicWallet.update({
        where: { userEmail: receiverEmail },
        data: { 
          [receiverCurrencyField]: { 
            increment: receiverAmount 
          } 
        }
      });

      // Create transaction record
      const transaction = await tx.fiatToFiatTransaction.create({
        data: {
          userEmail: senderEmail,
          receiverEmail: receiver.email,
          senderCurrency,
          receiverCurrency,
          senderCountry,
          receiverCountry,
          routes: {
            create: {}
          }
        }
      });

     
      await tx.successfulTransactions.create({
        data: {
          userEmail: sender.email,
          receiverEmail: receiver.email,
          currencySent: senderCurrency,
          currencyReceived: receiverCurrency,
          senderCountry,
          receiverCountry,
          routeUsed: provider,
          method: 'CentralizedTransaction',
          
        }
      });

      return {
        transactionId: transaction.id,
        amountSent: sentAmount,
        amountReceived: receiverAmount,
        fees: fees || (sentAmount - receiverAmount)
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Transfer completed successfully',
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Transfer error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process transfer'
    });
  }
};

export default { getQuote, createTransfer };

 