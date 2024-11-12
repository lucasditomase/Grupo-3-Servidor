/*
  Warnings:

  - The primary key for the `Usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Usuario` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `autorId` on the `Habito` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Habito" DROP CONSTRAINT "Habito_autorId_fkey";

-- AlterTable
ALTER TABLE "Habito" DROP COLUMN "autorId",
ADD COLUMN     "autorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Habito" ADD CONSTRAINT "Habito_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
