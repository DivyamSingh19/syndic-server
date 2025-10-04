/*
  Warnings:

  - You are about to drop the column `userId` on the `CryptoToFiatTransactions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `CryptoTransactions` table. All the data in the column will be lost.
  - You are about to drop the `CentralizedTransactions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userEmail` to the `CryptoToFiatTransactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userEmail` to the `CryptoTransactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."CentralizedTransactions" DROP CONSTRAINT "CentralizedTransactions_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CryptoToFiatTransactions" DROP CONSTRAINT "CryptoToFiatTransactions_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CryptoTransactions" DROP CONSTRAINT "CryptoTransactions_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FiatToFiatRoutes" DROP CONSTRAINT "FiatToFiatRoutes_transactionId_fkey";

-- AlterTable
ALTER TABLE "public"."CryptoToFiatTransactions" DROP COLUMN "userId",
ADD COLUMN     "userEmail" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."CryptoTransactions" DROP COLUMN "userId",
ADD COLUMN     "userEmail" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."CentralizedTransactions";

-- CreateTable
CREATE TABLE "public"."FiatToFiatTransaction" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "receiverId" TEXT,
    "senderCurrency" TEXT NOT NULL,
    "receiverCurrency" TEXT NOT NULL,
    "senderCountry" TEXT NOT NULL,
    "receiverCountry" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FiatToFiatTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."CryptoTransactions" ADD CONSTRAINT "CryptoTransactions_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "public"."Users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FiatToFiatTransaction" ADD CONSTRAINT "FiatToFiatTransaction_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "public"."Users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CryptoToFiatTransactions" ADD CONSTRAINT "CryptoToFiatTransactions_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "public"."Users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FiatToFiatRoutes" ADD CONSTRAINT "FiatToFiatRoutes_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."FiatToFiatTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
