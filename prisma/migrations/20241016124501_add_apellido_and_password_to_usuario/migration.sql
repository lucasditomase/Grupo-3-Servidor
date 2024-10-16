/*
  Warnings:

  - You are about to drop the column `autorId` on the `Habito` table. All the data in the column will be lost.
  - Added the required column `apellido` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Habito" DROP CONSTRAINT "Habito_autorId_fkey";

-- AlterTable
ALTER TABLE "Habito" DROP COLUMN "autorId",
ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "apellido" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Habito" ADD CONSTRAINT "Habito_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
