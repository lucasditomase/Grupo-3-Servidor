/*
  Warnings:

  - You are about to drop the `Habito` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Habito" DROP CONSTRAINT "Habito_autorId_fkey";

-- DropTable
DROP TABLE "Habito";
