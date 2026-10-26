-- AlterEnum
ALTER TYPE "PlanoTipo" ADD VALUE IF NOT EXISTS 'INTERMEDIARIO';

-- AlterTable
ALTER TABLE "Tabelionato" ADD COLUMN "upgradeEm" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "UsoApi" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tabelionatoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "agente" "TipoAgente" NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "cacheCreationTokens" INTEGER NOT NULL DEFAULT 0,
    "cacheReadTokens" INTEGER NOT NULL DEFAULT 0,
    "custoEstimadoUsd" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "UsoApi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UsoApi_usuarioId_idx" ON "UsoApi"("usuarioId");

-- CreateIndex
CREATE INDEX "UsoApi_tabelionatoId_idx" ON "UsoApi"("tabelionatoId");

-- CreateIndex
CREATE INDEX "UsoApi_createdAt_idx" ON "UsoApi"("createdAt");

-- AddForeignKey
ALTER TABLE "UsoApi" ADD CONSTRAINT "UsoApi_tabelionatoId_fkey" FOREIGN KEY ("tabelionatoId") REFERENCES "Tabelionato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsoApi" ADD CONSTRAINT "UsoApi_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
