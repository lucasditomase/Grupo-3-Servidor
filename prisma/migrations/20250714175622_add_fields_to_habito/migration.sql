-- CreateEnum
CREATE TYPE "Prioridad" AS ENUM ('ALTA', 'MEDIA', 'BAJA');

-- AlterTable
ALTER TABLE "Habito" ADD COLUMN     "lastCompletionDate" TIMESTAMP(3),
ADD COLUMN     "objetivo" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "prioridad" "Prioridad" NOT NULL DEFAULT 'MEDIA',
ADD COLUMN     "progreso" INTEGER NOT NULL DEFAULT 0;
