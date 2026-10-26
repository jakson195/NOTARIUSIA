import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pegarSessaoAdmin } from '@/lib/adminAuth';
import { inicioDoMesSP, limiteBasicoUsd, PLANOS } from '@/lib/planos';

// GET /api/admin/uso — consumo de TODOS os tabelionatos (só admin) + situação
// de plano de cada um (consumo do mês x limite do Básico).
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!(await pegarSessaoAdmin())) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const registros = await prisma.usoApi.findMany({
      include: { usuario: { select: { nome: true } }, tabelionato: { select: { nome: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20000,
    });

    type Grupo = {
      tabelionatoId: string; tabelionatoNome: string; usuarioId: string; nome: string; mes: string;
      atendimentos: number; documentos: number; paginas: number;
      inputTokens: number; outputTokens: number; custoUsd: number;
    };
    const grupos = new Map<string, Grupo>();
    for (const r of registros) {
      const d = new Date(r.createdAt.getTime() - 3 * 60 * 60 * 1000); // fuso de SP
      const mes = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      const chave = `${r.tabelionatoId}-${r.usuarioId}-${mes}`;
      if (!grupos.has(chave)) {
        grupos.set(chave, {
          tabelionatoId: r.tabelionatoId, tabelionatoNome: r.tabelionato.nome,
          usuarioId: r.usuarioId, nome: r.usuario.nome, mes,
          atendimentos: 0, documentos: 0, paginas: 0, inputTokens: 0, outputTokens: 0, custoUsd: 0,
        });
      }
      const g = grupos.get(chave)!;
      g.atendimentos += 1;
      g.documentos += r.documentos;
      g.paginas += r.paginas;
      g.inputTokens += r.inputTokens;
      g.outputTokens += r.outputTokens;
      g.custoUsd += r.custoEstimadoUsd;
    }
    const uso = Array.from(grupos.values()).sort((a, b) => {
      if (a.mes !== b.mes) return a.mes < b.mes ? 1 : -1;
      if (a.tabelionatoNome !== b.tabelionatoNome) return a.tabelionatoNome.localeCompare(b.tabelionatoNome);
      return a.nome.localeCompare(b.nome);
    });

    const inicioMes = inicioDoMesSP();
    const tabs = await prisma.tabelionato.findMany({
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { usuarios: true } } },
    });
    const somas = await prisma.usoApi.groupBy({
      by: ['tabelionatoId'],
      where: { createdAt: { gte: inicioMes } },
      _sum: { custoEstimadoUsd: true, documentos: true, paginas: true },
      _count: { _all: true },
    });
    const mesPorTab = new Map(somas.map((x) => [x.tabelionatoId, x]));

    const tabelionatos = tabs.map((t) => ({
      id: t.id,
      nome: t.nome,
      cidade: t.cidade,
      uf: t.uf,
      plano: t.plano,
      precoBrl: (PLANOS as any)[t.plano]?.precoBrl ?? null,
      upgradeEm: t.upgradeEm,
      criadoEm: t.createdAt,
      usuarios: t._count.usuarios,
      custoMesUsd: mesPorTab.get(t.id)?._sum.custoEstimadoUsd ?? 0,
      documentosMes: mesPorTab.get(t.id)?._sum.documentos ?? 0,
      paginasMes: mesPorTab.get(t.id)?._sum.paginas ?? 0,
      atendimentosMes: mesPorTab.get(t.id)?._count._all ?? 0,
    }));

    return NextResponse.json({ uso, tabelionatos, limiteBasicoUsd: limiteBasicoUsd() });
  } catch (err) {
    console.error('[Admin] erro ao carregar relatório de uso:', err);
    return NextResponse.json({ error: 'Erro ao carregar relatório de uso.' }, { status: 500 });
  }
}
