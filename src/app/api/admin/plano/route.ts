import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pegarSessaoAdmin } from '@/lib/adminAuth';
import { fimDoTeste } from '@/lib/planos';

// POST /api/admin/plano (só admin)
//  { tabelionatoId, plano }           -> troca o plano (BASICO | INTERMEDIARIO)
//  { tabelionatoId, acao: 'liberar' } -> encerra o teste: cliente ativo (pago)
//  { tabelionatoId, acao: 'estender'} -> novo teste de 7 dias a partir de hoje
export async function POST(req: NextRequest) {
  try {
    if (!(await pegarSessaoAdmin())) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }
    const { tabelionatoId, plano, acao } = await req.json();
    if (!tabelionatoId) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    if (acao === 'liberar') {
      await prisma.tabelionato.update({ where: { id: tabelionatoId }, data: { testeAte: null } });
    } else if (acao === 'estender') {
      await prisma.tabelionato.update({ where: { id: tabelionatoId }, data: { testeAte: fimDoTeste() } });
    } else if (['BASICO', 'INTERMEDIARIO'].includes(plano)) {
      await prisma.tabelionato.update({
        where: { id: tabelionatoId },
        data: { plano, upgradeEm: plano === 'BASICO' ? null : undefined },
      });
    } else {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Admin] erro ao atualizar tabelionato:', err);
    return NextResponse.json({ error: 'Erro ao atualizar.' }, { status: 500 });
  }
}
