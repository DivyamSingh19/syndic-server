/*
  Warnings:

  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userID]` on the table `FailedTransactions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userID]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `currencyReceived` to the `FailedTransactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currencySent` to the `FailedTransactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverCountry` to the `FailedTransactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `routeUsed` to the `FailedTransactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderCountry` to the `FailedTransactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `FailedTransactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `FailedTransactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `UserProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platformPin` to the `UserProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pnIsVerified` to the `UserProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `UserProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."FailedTransactions" ADD COLUMN     "currencyReceived" TEXT NOT NULL,
ADD COLUMN     "currencySent" TEXT NOT NULL,
ADD COLUMN     "receiverCountry" TEXT NOT NULL,
ADD COLUMN     "receiverId" TEXT,
ADD COLUMN     "routeUsed" TEXT NOT NULL,
ADD COLUMN     "senderCountry" TEXT NOT NULL,
ADD COLUMN     "userID" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."UserProfile" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "platformPin" INTEGER NOT NULL,
ADD COLUMN     "pnIsVerified" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userID" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Transaction";

-- CreateTable
CREATE TABLE "public"."SuccessfulTransactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "receiverId" TEXT,
    "currencySent" TEXT NOT NULL,
    "currencyReceived" TEXT NOT NULL,
    "senderCountry" TEXT NOT NULL,
    "receiverCountry" TEXT NOT NULL,
    "routeUsed" TEXT NOT NULL,
    "userID" TEXT NOT NULL,

    CONSTRAINT "SuccessfulTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SuccessfulTransactions_userID_key" ON "public"."SuccessfulTransactions"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "FailedTransactions_userID_key" ON "public"."FailedTransactions"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userID_key" ON "public"."UserProfile"("userID");

-- AddForeignKey
ALTER TABLE "public"."UserProfile" ADD CONSTRAINT "UserProfile_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SuccessfulTransactions" ADD CONSTRAINT "SuccessfulTransactions_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FailedTransactions" ADD CONSTRAINT "FailedTransactions_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
