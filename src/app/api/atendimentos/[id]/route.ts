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

// PATCH /api/atendimentos/[id] — renomear o título e/ou mudar o status
// (ex: marcar como concluído). Envie só o que quiser alterar no corpo:
// { titulo?: string, status?: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'ARQUIVADO' }
const STATUS_VALIDOS = ['EM_ANDAMENTO', 'CONCLUIDO', 'ARQUIVADO'];

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
    const titulo: string | undefined = body.titulo?.trim();
    const status: string | undefined = body.status;

    if (body.titulo !== undefined && !titulo) {
      return NextResponse.json({ error: 'Título não pode ficar vazio.' }, { status: 400 });
    }
    if (status !== undefined && !STATUS_VALIDOS.includes(status)) {
      return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
    }

    const atendimento = await prisma.atendimento.update({
      where: { id: params.id },
      data: {
        ...(titulo ? { titulo } : {}),
        ...(status ? { status: status as any } : {}),
      },
    });

    return NextResponse.json({ atendimento });
  } catch (err) {
    console.error('[Histórico] erro ao atualizar atendimento:', err);
    return NextResponse.json({ error: 'Erro ao atualizar.' }, { status: 500 });
  }
}

// DELETE /api/atendimentos/[id] — exclui definitivamente o atendimento e suas
// mensagens. Restrito ao tabelionato da sessão (não dá pra apagar dado de
// outro tenant). A confirmação por senha acontece no front-end antes de
// chamar esta rota; aqui só reforçamos a checagem de que o usuário está
// autenticado e que o atendimento pertence ao tabelionato dele.
export async function DELETE(
  _req: NextRequest,
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

    // Apaga primeiro as mensagens (chave estrangeira) e depois o atendimento,
    // numa transação — ou apaga os dois, ou não apaga nenhum.
    await prisma.$transaction([
      prisma.mensagem.deleteMany({ where: { atendimentoId: params.id } }),
      prisma.atendimento.delete({ where: { id: params.id } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Histórico] erro ao excluir atendimento:', err);
    return NextResponse.json({ error: 'Erro ao excluir o atendimento.' }, { status: 500 });
  }
}
