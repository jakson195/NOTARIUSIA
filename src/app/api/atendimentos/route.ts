import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Esta rota lê parâmetros da URL (busca, filtros de data) a cada chamada,
// então precisa ser sempre dinâmica — sem isso o Next.js tenta otimizar
// como página estática e quebra com "Dynamic server usage".
export const dynamic = 'force-dynamic';

// GET /api/atendimentos?q=texto&agente=URBANO&de=2026-01-01&ate=2026-01-31
//
// Lista o histórico para a barra lateral, com busca por título (nome) e
// filtro por período. Ainda sem filtro por tabelionato/usuário — isso entra
// quando a autenticação real existir (ver nota no schema.prisma).
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    const agente = searchParams.get('agente');
    const de = searchParams.get('de'); // yyyy-mm-dd
    const ate = searchParams.get('ate'); // yyyy-mm-dd

    const where: any = {};

    if (q) {
      where.titulo = { contains: q, mode: 'insensitive' };
    }
    if (agente && ['URBANO', 'RURAL', 'QUALIFLASH'].includes(agente)) {
      where.agente = agente;
    }
    if (de || ate) {
      where.createdAt = {};
      if (de) where.createdAt.gte = new Date(`${de}T00:00:00`);
      if (ate) where.createdAt.lte = new Date(`${ate}T23:59:59`);
    }

    const atendimentos = await prisma.atendimento.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        titulo: true,
        agente: true,
        status: true,
        createdAt: true,
      },
      take: 100,
    });

    return NextResponse.json({ atendimentos });
  } catch (err) {
    console.error('[Histórico] erro ao listar atendimentos:', err);
    return NextResponse.json(
      { error: 'Erro ao carregar o histórico.' },
      { status: 500 }
    );
  }
}
