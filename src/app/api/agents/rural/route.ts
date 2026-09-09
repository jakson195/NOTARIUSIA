import { NextRequest, NextResponse } from 'next/server';
import type Anthropic from '@anthropic-ai/sdk';
import { anthropic, CLAUDE_MODEL, montarBlocosDeConteudo, AnexoUpload } from '@/lib/anthropic';
import { RURAL_SYSTEM_PROMPT } from '@/lib/agents/prompts';

// POST /api/agents/rural
// body: { texto?: string, anexos: AnexoUpload[], respostaAnterior?: string }
//
// Mesmo padrão do Urbano: fluxo "one-shot", com suporte a documentos
// enviados em etapas dentro do mesmo atendimento.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const texto: string = body.texto ?? '';
    const anexos: AnexoUpload[] = body.anexos ?? [];
    const respostaAnterior: string | undefined = body.respostaAnterior;

    if (!texto && anexos.length === 0) {
      return NextResponse.json(
        { error: 'Envie ao menos um documento (PDF/imagem) ou um texto.' },
        { status: 400 }
      );
    }

    const textoUsuario = respostaAnterior
      ? `[EXTRAÇÃO ANTERIOR NESTE ATENDIMENTO — atualize/complete, não apague dados válidos]\n${respostaAnterior}\n\n[NOVOS DOCUMENTOS ENVIADOS AGORA]\n${texto}`
      : texto;

    const resposta = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 8000,
      system: RURAL_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: await montarBlocosDeConteudo(textoUsuario, anexos),
        },
      ],
    });

    const textoResposta = resposta.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n');

    return NextResponse.json({ resultado: textoResposta });
  } catch (err) {
    console.error('[Rural] erro ao processar documentos:', err);
    return NextResponse.json(
      { error: 'Erro ao processar os documentos. Tente novamente.' },
      { status: 500 }
    );
  }
}
