/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[edad,nombre]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `edad` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USUARIO', 'ADMIN');

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "name",
ADD COLUMN     "edad" INTEGER NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "esAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nombre" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USUARIO',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateTable
CREATE TABLE "Habito" (
    "titulo" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateadoEn" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "autorId" TEXT NOT NULL,

    CONSTRAINT "Habito_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_edad_nombre_key" ON "User"("edad", "nombre");

-- AddForeignKey
ALTER TABLE "Habito" ADD CONSTRAINT "Habito_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
