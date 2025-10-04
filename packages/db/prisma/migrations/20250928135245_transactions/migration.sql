/*
  Warnings:

  - Added the required column `method` to the `FailedTransactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `method` to the `SuccessfulTransactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."TransactionMethod" AS ENUM ('CryptoTransaction', 'CentralizedTransaction', 'CryptoToCentralized', 'CentralizedToCrypto');

-- AlterTable
ALTER TABLE "public"."FailedTransactions" ADD COLUMN     "method" "public"."TransactionMethod" NOT NULL;

-- AlterTable
ALTER TABLE "public"."SuccessfulTransactions" ADD COLUMN     "method" "public"."TransactionMethod" NOT NULL;

-- CreateTable
CREATE TABLE "public"."CryptoTransaction" (
    "id" TEXT NOT NULL,

    CONSTRAINT "CryptoTransaction_pkey" PRIMARY KEY ("id")
);
