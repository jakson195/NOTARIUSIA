import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pegarSessaoAdmin } from '@/lib/adminAuth';

// GET /api/admin/logins — quem acessou o sistema (só admin).
// Retorna: resumo por usuário (último acesso e nº de acessos nos últimos 30
// dias) e os 300 acessos mais recentes.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!(await pegarSessaoAdmin())) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const recentes = await prisma.loginLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 300,
      include: {
        usuario: { select: { nome: true, email: true } },
        tabelionato: { select: { nome: true } },
      },
    });

    const usuarios = await prisma.usuario.findMany({
      include: {
        tabelionato: { select: { nome: true } },
        logins: { orderBy: { createdAt: 'desc' }, take: 1, select: { createdAt: true } },
      },
    });
    const desde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const contagem = await prisma.loginLog.groupBy({
      by: ['usuarioId'],
      where: { createdAt: { gte: desde } },
      _count: { _all: true },
    });
    const acessos30 = new Map(contagem.map((c) => [c.usuarioId, c._count._all]));

    const resumo = usuarios
      .map((u) => ({
        usuarioId: u.id,
        nome: u.nome,
        email: u.email,
        tabelionato: u.tabelionato.nome,
        ultimoAcesso: u.logins[0]?.createdAt ?? null,
        acessos30dias: acessos30.get(u.id) ?? 0,
      }))
      .sort((a, b) => {
        const ta = a.ultimoAcesso ? new Date(a.ultimoAcesso).getTime() : 0;
        const tb = b.ultimoAcesso ? new Date(b.ultimoAcesso).getTime() : 0;
        return tb - ta;
      });

    return NextResponse.json({
      resumo,
      recentes: recentes.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        origem: r.origem,
        ip: r.ip,
        userAgent: r.userAgent,
        nome: r.usuario.nome,
        email: r.usuario.email,
        tabelionato: r.tabelionato.nome,
      })),
    });
  } catch (err) {
    console.error('[Admin] erro ao carregar acessos:', err);
    return NextResponse.json({ error: 'Erro ao carregar os acessos.' }, { status: 500 });
  }
}
