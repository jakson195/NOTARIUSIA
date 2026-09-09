import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/atendimentos/[id] — carrega um atendimento com todas as mensagens
// (usado ao clicar em um item do histórico na barra lateral).
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const atendimento = await prisma.atendimento.findUnique({
      where: { id: params.id },
      include: { mensagens: { orderBy: { createdAt: 'asc' } } },
    });

    if (!atendimento) {
      return NextResponse.json({ error: 'Atendimento não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ atendimento });
  } catch (err) {
    console.error('[Histórico] erro ao carregar atendimento:', err);
    return NextResponse.json({ error: 'Erro ao carregar o atendimento.' }, { status: 500 });
  }
}

// PATCH /api/atendimentos/[id] — renomear o título (a sugestão automática
// é só um ponto de partida; o escrivão pode ajustar livremente).
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
