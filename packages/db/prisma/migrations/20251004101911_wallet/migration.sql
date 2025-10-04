/*
  Warnings:

  - You are about to drop the column `userId` on the `SyndicWallet` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userEmail]` on the table `SyndicWallet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userEmail` to the `SyndicWallet` table without a default value. This is not possible if the table is not empty.
  - Made the column `totalAED` on table `SyndicWallet` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalINR` on table `SyndicWallet` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalUSD` on table `SyndicWallet` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."SyndicWallet" DROP CONSTRAINT "SyndicWallet_userId_fkey";

-- DropIndex
DROP INDEX "public"."SyndicWallet_userId_key";

-- AlterTable
ALTER TABLE "public"."SyndicWallet" DROP COLUMN "userId",
ADD COLUMN     "userEmail" TEXT NOT NULL,
ALTER COLUMN "totalAED" SET NOT NULL,
ALTER COLUMN "totalAED" SET DEFAULT 0,
ALTER COLUMN "totalINR" SET NOT NULL,
ALTER COLUMN "totalINR" SET DEFAULT 0,
ALTER COLUMN "totalUSD" SET NOT NULL,
ALTER COLUMN "totalUSD" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "SyndicWallet_userEmail_key" ON "public"."SyndicWallet"("userEmail");

-- AddForeignKey
ALTER TABLE "public"."SyndicWallet" ADD CONSTRAINT "SyndicWallet_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "public"."Users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
