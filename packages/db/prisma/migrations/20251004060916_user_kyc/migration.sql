/*
  Warnings:

  - Added the required column `cryptoProvider` to the `CryptoToFiatRoutes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimatedFees` to the `CryptoToFiatRoutes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `offRampProvider` to the `CryptoToFiatRoutes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CryptoToFiatRoutes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."KYCStatus" AS ENUM ('COMPLETED', 'INCOMPLETE', 'VERIFICATION_PENDING');

-- AlterTable
ALTER TABLE "public"."CryptoToFiatRoutes" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "cryptoProvider" TEXT NOT NULL,
ADD COLUMN     "estimatedFees" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "offRampProvider" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."UserKYC" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "panNumber" TEXT NOT NULL,
    "aadhaarNumber" TEXT NOT NULL,
    "panImageUrl" TEXT NOT NULL,
    "aadhaarImageUrl" TEXT NOT NULL,
    "status" "public"."KYCStatus" NOT NULL DEFAULT 'VERIFICATION_PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserKYC_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserKYC_userId_key" ON "public"."UserKYC"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserKYC_panNumber_key" ON "public"."UserKYC"("panNumber");

-- CreateIndex
CREATE UNIQUE INDEX "UserKYC_aadhaarNumber_key" ON "public"."UserKYC"("aadhaarNumber");

-- AddForeignKey
ALTER TABLE "public"."UserKYC" ADD CONSTRAINT "UserKYC_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
