/*
  Warnings:

  - You are about to drop the column `profileImage` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Frequencia" AS ENUM ('DIARIA', 'SEMANAL', 'MENSUAL');

-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('SALUD', 'DEPORTE', 'ESTUDIO', 'TRABAJO', 'OCIO', 'OTROS');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "profileImage",
DROP COLUMN "role";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Habito" (
    "habitoId" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "frequencia" "Frequencia" NOT NULL,
    "categoria" "Categoria" NOT NULL,

    CONSTRAINT "Habito_pkey" PRIMARY KEY ("habitoId")
);

-- CreateIndex
CREATE INDEX "Habito_nombre_idx" ON "Habito"("nombre");

-- AddForeignKey
ALTER TABLE "Habito" ADD CONSTRAINT "Habito_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
