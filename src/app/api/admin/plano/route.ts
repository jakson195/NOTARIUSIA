import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pegarSessaoAdmin } from '@/lib/adminAuth';

// POST /api/admin/plano { tabelionatoId, plano } — troca manual de plano (só admin).
export async function POST(req: NextRequest) {
  try {
    if (!(await pegarSessaoAdmin())) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }
    const { tabelionatoId, plano } = await req.json();
    if (!tabelionatoId || !['BASICO', 'INTERMEDIARIO'].includes(plano)) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }
    await prisma.tabelionato.update({
      where: { id: tabelionatoId },
      data: { plano, upgradeEm: plano === 'BASICO' ? null : undefined },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Admin] erro ao trocar plano:', err);
    return NextResponse.json({ error: 'Erro ao trocar o plano.' }, { status: 500 });
  }
}
