/*
  Warnings:

  - You are about to drop the column `esAdmin` on the `Usuario` table. All the data in the column will be lost.
  - Added the required column `password` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "esAdmin",
ADD COLUMN     "password" TEXT NOT NULL;
