/*
  Warnings:

  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Usuario";

-- CreateTable
CREATE TABLE "User" (
    "userId" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "profileImage" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
