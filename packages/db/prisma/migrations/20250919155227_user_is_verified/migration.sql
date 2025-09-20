/*
  Warnings:

  - A unique constraint covering the columns `[refreshToken]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `refreshToken` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Users" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "refreshToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Users_refreshToken_key" ON "public"."Users"("refreshToken");
