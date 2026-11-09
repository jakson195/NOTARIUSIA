-- CreateTable
CREATE TABLE "LoginLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    "tabelionatoId" TEXT NOT NULL,
    "origem" TEXT NOT NULL DEFAULT 'LOGIN',
    "ip" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "LoginLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoginLog_usuarioId_idx" ON "LoginLog"("usuarioId");

-- CreateIndex
CREATE INDEX "LoginLog_tabelionatoId_idx" ON "LoginLog"("tabelionatoId");

-- CreateIndex
CREATE INDEX "LoginLog_createdAt_idx" ON "LoginLog"("createdAt");

-- AddForeignKey
ALTER TABLE "LoginLog" ADD CONSTRAINT "LoginLog_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginLog" ADD CONSTRAINT "LoginLog_tabelionatoId_fkey" FOREIGN KEY ("tabelionatoId") REFERENCES "Tabelionato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
