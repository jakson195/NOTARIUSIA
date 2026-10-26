import { prisma } from '@/lib/prisma';
import { situacaoDoTeste } from '@/lib/planos';

// Retorna uma mensagem de erro se o teste grátis do tabelionato terminou
// (e ele ainda não foi liberado pelo admin); null se pode usar.
export async function bloqueioDeAcesso(tabelionatoId: string): Promise<string | null> {
  const t = await prisma.tabelionato.findUnique({
    where: { id: tabelionatoId },
    select: { testeAte: true },
  });
  if (t && situacaoDoTeste(t.testeAte).expirado) {
    return 'O período de teste grátis terminou. Fale com o administrador para ativar o seu plano.';
  }
  return null;
}
