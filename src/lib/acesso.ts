import { prisma } from '@/lib/prisma';
import { situacaoDoTeste } from '@/lib/planos';
import { CONTATO_EMAIL, CONTATO_TELEFONE } from '@/lib/contato';

// Retorna uma mensagem de erro se o teste grátis do tabelionato terminou
// (e ele ainda não foi liberado pelo admin); null se pode usar.
export async function bloqueioDeAcesso(tabelionatoId: string): Promise<string | null> {
  const t = await prisma.tabelionato.findUnique({
    where: { id: tabelionatoId },
    select: { testeAte: true },
  });
  if (t && situacaoDoTeste(t.testeAte).expirado) {
    return `O período de teste grátis terminou. Para ativar o seu plano, fale conosco: ${CONTATO_EMAIL} ou ${CONTATO_TELEFONE} (WhatsApp).`;
  }
  return null;
}
