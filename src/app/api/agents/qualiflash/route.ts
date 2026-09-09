import { NextRequest, NextResponse } from 'next/server';
import type Anthropic from '@anthropic-ai/sdk';
import { anthropic, CLAUDE_MODEL, montarBlocosDeConteudo, AnexoUpload } from '@/lib/anthropic';
import { QUALIFLASH_SYSTEM_PROMPT } from '@/lib/agents/prompts';
import { sugerirTituloQualificacao } from '@/lib/agents/titulo';
import { prisma } from '@/lib/prisma';

type MensagemHistorico = { papel: 'user' | 'assistant'; conteudo: string };

// POST /api/agents/qualiflash
// body: { historico: MensagemHistorico[], texto: string, anexos?: AnexoUpload[], atendimentoId?: string }
//
// Fluxo em chat: o agente pode perguntar dados faltantes antes de fechar a
// qualificação. Cada turno salva as duas mensagens novas (usuário +
// assistente) no mesmo Atendimento, criado no primeiro turno.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const historico: MensagemHistorico[] = body.historico ?? [];
    const texto: string = body.texto ?? '';
    const anexos: AnexoUpload[] = body.anexos ?? [];
    const atendimentoId: string | undefined = body.atendimentoId;

    if (!texto && anexos.length === 0 && historico.length === 0) {
      return NextResponse.json(
        { error: 'Envie uma mensagem ou documento para iniciar.' },
        { status: 400 }
      );
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
      system: QUALIFLASH_SYSTEM_PROMPT,
      messages: mensagens,
    });

    const textoResposta = resposta.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n');

    // Só atualiza o título quando a resposta já parece a qualificação
    // finalizada (começa com nome, vírgula) — perguntas de esclarecimento
    // no meio do caminho não têm esse formato, então mantemos o título
    // anterior nesses turnos.
    const tituloSugerido = sugerirTituloQualificacao(textoResposta);
    const pareceQualificacaoFinal = tituloSugerido !== 'Qualificação sem título';

    let atendimento;
    if (atendimentoId) {
      atendimento = await prisma.atendimento.update({
        where: { id: atendimentoId },
        data: {
          ...(pareceQualificacaoFinal ? { titulo: tituloSugerido } : {}),
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
          titulo: pareceQualificacaoFinal ? tituloSugerido : 'Qualificação em andamento',
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
