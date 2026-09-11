import { NextRequest, NextResponse } from 'next/server';
import type Anthropic from '@anthropic-ai/sdk';
import { anthropic, CLAUDE_MODEL, montarBlocosDeConteudo, AnexoUpload } from '@/lib/anthropic';
import { QUALIFLASH_SYSTEM_PROMPT } from '@/lib/agents/prompts';
import { sugerirTituloQualificacao } from '@/lib/agents/titulo';
import { prisma } from '@/lib/prisma';
import { pegarSessao } from '@/lib/auth';

type MensagemHistorico = { papel: 'user' | 'assistant'; conteudo: string };

// POST /api/agents/qualiflash
// body: { historico, texto, anexos?, atendimentoId?, tituloManual? }
export async function POST(req: NextRequest) {
  try {
    const sessao = await pegarSessao();
    if (!sessao) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const body = await req.json();
    const historico: MensagemHistorico[] = body.historico ?? [];
    const texto: string = body.texto ?? '';
    const anexos: AnexoUpload[] = body.anexos ?? [];
    const atendimentoId: string | undefined = body.atendimentoId;
    const tituloManual: string | undefined = body.tituloManual?.trim();

    if (!texto && anexos.length === 0 && historico.length === 0) {
      return NextResponse.json(
        { error: 'Envie uma mensagem ou documento para iniciar.' },
        { status: 400 }
      );
    }

    if (atendimentoId) {
      const existente = await prisma.atendimento.findUnique({ where: { id: atendimentoId } });
      if (!existente || existente.tabelionatoId !== sessao.tabelionatoId) {
        return NextResponse.json({ error: 'Atendimento não encontrado.' }, { status: 404 });
      }
    }

    const mensagens: Anthropic.MessageParam[] = historico.map((m) => ({
      role: m.papel,
      content: m.conteudo,
    }));

    const entradaResumo =
      texto || (anexos.length > 0 ? `${anexos.length} documento(s) anexado(s)` : '(sem texto)');

    mensagens.push({
      role: 'user',
      content: await montarBlocosDeConteudo(texto, anexos),
    });

    const resposta = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4000,
      // Ver comentário equivalente na rota do Urbano — cache de prompt.
      system: [
        { type: 'text', text: QUALIFLASH_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
      ] as any,
      messages: mensagens,
    });

    const textoResposta = resposta.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n');

    const tituloSugerido = sugerirTituloQualificacao(textoResposta);
    const pareceQualificacaoFinal = tituloSugerido !== 'Qualificação sem título';
    const tituloFinal = tituloManual || (pareceQualificacaoFinal ? tituloSugerido : undefined);

    let atendimento;
    if (atendimentoId) {
      atendimento = await prisma.atendimento.update({
        where: { id: atendimentoId },
        data: {
          ...(tituloFinal ? { titulo: tituloFinal } : {}),
          mensagens: {
            create: [
              { papel: 'user', conteudo: entradaResumo },
              { papel: 'assistant', conteudo: textoResposta },
            ],
          },
        },
      });
    } else {
      atendimento = await prisma.atendimento.create({
        data: {
          agente: 'QUALIFLASH',
          titulo: tituloFinal || 'Qualificação em andamento',
          tabelionatoId: sessao.tabelionatoId,
          usuarioId: sessao.usuarioId,
          mensagens: {
            create: [
              { papel: 'user', conteudo: entradaResumo },
              { papel: 'assistant', conteudo: textoResposta },
            ],
          },
        },
      });
    }

    return NextResponse.json({
      resposta: textoResposta,
      atendimentoId: atendimento.id,
    });
  } catch (err) {
    console.error('[QualiFlash] erro na conversa:', err);
    return NextResponse.json(
      { error: 'Erro ao processar a mensagem. Tente novamente.' },
      { status: 500 }
    );
  }
}
