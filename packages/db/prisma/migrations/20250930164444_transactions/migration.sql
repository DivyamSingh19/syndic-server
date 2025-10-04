/*
  Warnings:

  - You are about to drop the column `pnIsVerified` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the `CryptoTransaction` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `FailedTransactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SuccessfulTransactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."FailedTransactions" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."SuccessfulTransactions" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."UserProfile" DROP COLUMN "pnIsVerified";

-- DropTable
DROP TABLE "public"."CryptoTransaction";

-- CreateTable
CREATE TABLE "public"."CryptoTransactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userWallet" TEXT NOT NULL,
    "receiverWallet" TEXT NOT NULL,
    "senderCrypto" TEXT NOT NULL,
    "receiverCrypto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CryptoTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CentralizedTransactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "receiverId" TEXT,
    "senderCurrency" TEXT NOT NULL,
    "receiverCurrency" TEXT NOT NULL,
    "senderCountry" TEXT NOT NULL,
    "receiverCountry" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CentralizedTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CryptoToFiatTransactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
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
    "userId" TEXT NOT NULL,
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

-- AddForeignKey
ALTER TABLE "public"."CryptoTransactions" ADD CONSTRAINT "CryptoTransactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CentralizedTransactions" ADD CONSTRAINT "CentralizedTransactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CryptoToFiatTransactions" ADD CONSTRAINT "CryptoToFiatTransactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FiatToCryptoTransactions" ADD CONSTRAINT "FiatToCryptoTransactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FiatToFiatRoutes" ADD CONSTRAINT "FiatToFiatRoutes_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."CentralizedTransactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FiatToCryptoRoutes" ADD CONSTRAINT "FiatToCryptoRoutes_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."FiatToCryptoTransactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CryptoToFiatRoutes" ADD CONSTRAINT "CryptoToFiatRoutes_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."CryptoToFiatTransactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CryptoToCryptoRoutes" ADD CONSTRAINT "CryptoToCryptoRoutes_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."CryptoTransactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
