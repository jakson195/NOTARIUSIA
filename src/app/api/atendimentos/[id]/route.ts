import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pegarSessao } from '@/lib/auth';

// GET /api/atendimentos/[id] — carrega um atendimento com todas as mensagens.
// Só retorna se o atendimento pertencer ao tabelionato da sessão.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessao = await pegarSessao();
    if (!sessao) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const atendimento = await prisma.atendimento.findUnique({
      where: { id: params.id },
      include: { mensagens: { orderBy: { createdAt: 'asc' } } },
    });

    if (!atendimento || atendimento.tabelionatoId !== sessao.tabelionatoId) {
      return NextResponse.json({ error: 'Atendimento não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ atendimento });
  } catch (err) {
    console.error('[Histórico] erro ao carregar atendimento:', err);
    return NextResponse.json({ error: 'Erro ao carregar o atendimento.' }, { status: 500 });
  }
}

// PATCH /api/atendimentos/[id] — renomear o título.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessao = await pegarSessao();
    if (!sessao) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const existente = await prisma.atendimento.findUnique({ where: { id: params.id } });
    if (!existente || existente.tabelionatoId !== sessao.tabelionatoId) {
      return NextResponse.json({ error: 'Atendimento não encontrado.' }, { status: 404 });
    }

    const body = await req.json();
    const titulo: string = body.titulo?.trim();

    if (!titulo) {
      return NextResponse.json({ error: 'Título não pode ficar vazio.' }, { status: 400 });
    }

    const atendimento = await prisma.atendimento.update({
      where: { id: params.id },
      data: { titulo },
    });

    return NextResponse.json({ atendimento });
  } catch (err) {
    console.error('[Histórico] erro ao renomear atendimento:', err);
    return NextResponse.json({ error: 'Erro ao renomear.' }, { status: 500 });
  }
}
