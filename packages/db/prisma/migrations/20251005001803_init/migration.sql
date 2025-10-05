-- CreateEnum
CREATE TYPE "public"."TransactionMethod" AS ENUM ('CryptoTransaction', 'CentralizedTransaction', 'CryptoToCentralized', 'CentralizedToCrypto');

-- CreateEnum
CREATE TYPE "public"."SupportedCurrencies" AS ENUM ('AED', 'USD', 'INR');

-- CreateEnum
CREATE TYPE "public"."SupportedCrypto" AS ENUM ('USDT', 'USDC', 'ETH', 'SOL');

-- CreateEnum
CREATE TYPE "public"."KYCStatus" AS ENUM ('COMPLETED', 'INCOMPLETE', 'VERIFICATION_PENDING');

-- CreateTable
CREATE TABLE "public"."Users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserProfile" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "defaultCryptoWallet" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userID" TEXT NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserPlatformPin" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "platformPin" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPlatformPin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserKYC" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "panNumber" TEXT NOT NULL,
    "aadhaarNumber" TEXT NOT NULL,
    "panImageUrl" TEXT NOT NULL,
    "aadhaarImageUrl" TEXT NOT NULL,
    "status" "public"."KYCStatus" NOT NULL DEFAULT 'VERIFICATION_PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserKYC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SuccessfulTransactions" (
    "id" TEXT NOT NULL,
    "receiverEmail" TEXT NOT NULL,
    "currencySent" TEXT NOT NULL,
    "currencyReceived" TEXT NOT NULL,
    "senderCountry" TEXT NOT NULL,
    "receiverCountry" TEXT NOT NULL,
    "routeUsed" TEXT NOT NULL,
    "method" "public"."TransactionMethod" NOT NULL,
    "userEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuccessfulTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FailedTransactions" (
    "id" TEXT NOT NULL,
    "receiverEmail" TEXT NOT NULL,
    "currencySent" TEXT NOT NULL,
    "currencyReceived" TEXT NOT NULL,
    "senderCountry" TEXT NOT NULL,
    "receiverCountry" TEXT NOT NULL,
    "routeUsed" TEXT NOT NULL,
    "method" "public"."TransactionMethod" NOT NULL,
    "userEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FailedTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CryptoTransactions" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userWallet" TEXT NOT NULL,
    "receiverWallet" TEXT NOT NULL,
    "senderCrypto" TEXT NOT NULL,
    "receiverCrypto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CryptoTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FiatToFiatTransaction" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "receiverEmail" TEXT,
    "senderCurrency" TEXT NOT NULL,
    "receiverCurrency" TEXT NOT NULL,
    "senderCountry" TEXT NOT NULL,
    "receiverCountry" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FiatToFiatTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CryptoToFiatTransactions" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "senderWalletAddress" TEXT NOT NULL,
    "receiverId" TEXT,
    "receiverCurrency" TEXT NOT NULL,
    "senderCrypto" TEXT NOT NULL,
    "senderCountry" TEXT NOT NULL,
    "receiverCountry" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CryptoToFiatTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FiatToCryptoTransactions" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "senderCurrency" TEXT NOT NULL,
    "receiverId" TEXT,
    "receiverWallet" TEXT NOT NULL,
    "recieverCrypto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FiatToCryptoTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FiatToFiatRoutes" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,

    CONSTRAINT "FiatToFiatRoutes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FiatToCryptoRoutes" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,

    CONSTRAINT "FiatToCryptoRoutes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CryptoToFiatRoutes" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "offRampProvider" TEXT NOT NULL,
    "cryptoProvider" TEXT NOT NULL,
    "estimatedFees" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CryptoToFiatRoutes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CryptoToCryptoRoutes" (
    "id" TEXT NOT NULL,
    "sourceToken" TEXT NOT NULL,
    "destinationToken" TEXT NOT NULL,
    "path" JSONB NOT NULL,
    "minSlippage" INTEGER NOT NULL,
    "liquiditySource" TEXT NOT NULL,
    "estimatedFee" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" TEXT NOT NULL,

    CONSTRAINT "CryptoToCryptoRoutes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SyndicWallet" (
    "id" TEXT NOT NULL,
    "totalAED" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalINR" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalUSD" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "userEmail" TEXT NOT NULL,

    CONSTRAINT "SyndicWallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "public"."Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_refreshToken_key" ON "public"."Users"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_phoneNumber_key" ON "public"."UserProfile"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userID_key" ON "public"."UserProfile"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "UserPlatformPin_userID_key" ON "public"."UserPlatformPin"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "UserKYC_userEmail_key" ON "public"."UserKYC"("userEmail");

-- CreateIndex
CREATE UNIQUE INDEX "UserKYC_panNumber_key" ON "public"."UserKYC"("panNumber");

-- CreateIndex
CREATE UNIQUE INDEX "UserKYC_aadhaarNumber_key" ON "public"."UserKYC"("aadhaarNumber");

-- CreateIndex
CREATE UNIQUE INDEX "FailedTransactions_userEmail_key" ON "public"."FailedTransactions"("userEmail");

-- CreateIndex
CREATE UNIQUE INDEX "SyndicWallet_userEmail_key" ON "public"."SyndicWallet"("userEmail");

-- AddForeignKey
ALTER TABLE "public"."UserProfile" ADD CONSTRAINT "UserProfile_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserPlatformPin" ADD CONSTRAINT "UserPlatformPin_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserKYC" ADD CONSTRAINT "UserKYC_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "public"."Users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SuccessfulTransactions" ADD CONSTRAINT "SuccessfulTransactions_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "public"."Users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FailedTransactions" ADD CONSTRAINT "FailedTransactions_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "public"."Users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CryptoTransactions" ADD CONSTRAINT "CryptoTransactions_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "public"."Users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FiatToFiatTransaction" ADD CONSTRAINT "FiatToFiatTransaction_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "public"."Users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CryptoToFiatTransactions" ADD CONSTRAINT "CryptoToFiatTransactions_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "public"."Users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FiatToCryptoTransactions" ADD CONSTRAINT "FiatToCryptoTransactions_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "public"."Users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FiatToFiatRoutes" ADD CONSTRAINT "FiatToFiatRoutes_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."FiatToFiatTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CryptoToFiatRoutes" ADD CONSTRAINT "CryptoToFiatRoutes_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."CryptoToFiatTransactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CryptoToCryptoRoutes" ADD CONSTRAINT "CryptoToCryptoRoutes_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."CryptoTransactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SyndicWallet" ADD CONSTRAINT "SyndicWallet_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "public"."Users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
