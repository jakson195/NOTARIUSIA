-- CreateEnum
CREATE TYPE "PlanoTipo" AS ENUM ('BASICO', 'PRO', 'ILIMITADO');

-- CreateEnum
CREATE TYPE "PapelUsuario" AS ENUM ('ADMIN', 'ESCRIVAO');

-- CreateEnum
CREATE TYPE "TipoAgente" AS ENUM ('URBANO', 'RURAL', 'QUALIFLASH');

-- CreateEnum
CREATE TYPE "StatusAtendimento" AS ENUM ('EM_ANDAMENTO', 'CONCLUIDO', 'ARQUIVADO');

-- CreateTable
CREATE TABLE "Tabelionato" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cidade" TEXT,
    "uf" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "plano" "PlanoTipo" NOT NULL DEFAULT 'BASICO',
    "limiteMensal" INTEGER NOT NULL DEFAULT 30,
    "stripeCustomerId" TEXT,

    CONSTRAINT "Tabelionato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" "PapelUsuario" NOT NULL DEFAULT 'ESCRIVAO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tabelionatoId" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Atendimento" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL DEFAULT 'Atendimento sem título',
    "agente" "TipoAgente" NOT NULL,
    "status" "StatusAtendimento" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "excluirEm" TIMESTAMP(3),
    "tabelionatoId" TEXT,
    "usuarioId" TEXT,

    CONSTRAINT "Atendimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mensagem" (
    "id" TEXT NOT NULL,
    "atendimentoId" TEXT NOT NULL,
    "papel" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mensagem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Atendimento_titulo_idx" ON "Atendimento"("titulo");

-- CreateIndex
CREATE INDEX "Atendimento_createdAt_idx" ON "Atendimento"("createdAt");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_tabelionatoId_fkey" FOREIGN KEY ("tabelionatoId") REFERENCES "Tabelionato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atendimento" ADD CONSTRAINT "Atendimento_tabelionatoId_fkey" FOREIGN KEY ("tabelionatoId") REFERENCES "Tabelionato"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atendimento" ADD CONSTRAINT "Atendimento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "Atendimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
