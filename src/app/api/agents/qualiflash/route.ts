import { NextRequest, NextResponse } from 'next/server';
import type Anthropic from '@anthropic-ai/sdk';
import { anthropic, CLAUDE_MODEL, montarBlocosDeConteudo, AnexoUpload } from '@/lib/anthropic';
import { QUALIFLASH_SYSTEM_PROMPT } from '@/lib/agents/prompts';

type MensagemHistorico = { papel: 'user' | 'assistant'; conteudo: string };

// POST /api/agents/qualiflash
// body: { historico: MensagemHistorico[], texto: string, anexos?: AnexoUpload[] }
//
// Fluxo em chat: o agente pode perguntar dados faltantes antes de fechar a
// qualificação, então o frontend reenvia o histórico completo a cada turno.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const historico: MensagemHistorico[] = body.historico ?? [];
    const texto: string = body.texto ?? '';
    const anexos: AnexoUpload[] = body.anexos ?? [];

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

    return NextResponse.json({ resposta: textoResposta });
  } catch (err) {
    console.error('[QualiFlash] erro na conversa:', err);
    return NextResponse.json(
      { error: 'Erro ao processar a mensagem. Tente novamente.' },
      { status: 500 }
    );
  }
}
