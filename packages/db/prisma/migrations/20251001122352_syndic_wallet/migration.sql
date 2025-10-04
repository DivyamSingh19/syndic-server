-- CreateEnum
CREATE TYPE "public"."SupportedCurrencies" AS ENUM ('AED', 'USD', 'INR');

-- CreateEnum
CREATE TYPE "public"."SupportedCrypto" AS ENUM ('USDT', 'USDC', 'ETH', 'SOL');

-- AlterTable
ALTER TABLE "public"."UserProfile" ADD COLUMN     "defaultCryptoWallet" TEXT;

-- CreateTable
CREATE TABLE "public"."SyndicWallet" (
    "id" TEXT NOT NULL,
    "totalAED" DOUBLE PRECISION,
    "totalINR" DOUBLE PRECISION,
    "totalUSD" DOUBLE PRECISION,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SyndicWallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SyndicWallet_userId_key" ON "public"."SyndicWallet"("userId");

-- AddForeignKey
ALTER TABLE "public"."SyndicWallet" ADD CONSTRAINT "SyndicWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
