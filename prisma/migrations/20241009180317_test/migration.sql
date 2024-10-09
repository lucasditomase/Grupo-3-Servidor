/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Habito" DROP CONSTRAINT "Habito_autorId_fkey";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "edad" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "esAdmin" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'USUARIO',

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_email_idx" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_edad_nombre_key" ON "Usuario"("edad", "nombre");

-- AddForeignKey
ALTER TABLE "Habito" ADD CONSTRAINT "Habito_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
