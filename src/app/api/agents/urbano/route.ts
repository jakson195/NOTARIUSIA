import { NextRequest, NextResponse } from 'next/server';
import type Anthropic from '@anthropic-ai/sdk';
import { anthropic, CLAUDE_MODEL, montarBlocosDeConteudo, DocumentoAnexo } from '@/lib/anthropic';
import { URBANO_SYSTEM_PROMPT } from '@/lib/agents/prompts';

// POST /api/agents/urbano
// body: { texto?: string, anexos: DocumentoAnexo[] }
//
// Fluxo do Urbano é "one-shot": o escrivão manda os documentos (podendo
// mandar em etapas, reenviando junto com o histórico anterior) e recebe a
// lista pronta + pendências. Não é um chat.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const texto: string = body.texto ?? '';
    const anexos: DocumentoAnexo[] = body.anexos ?? [];
    // Histórico opcional: quando o escrivão está enviando documentos em
    // etapas, o frontend reenvia o texto consolidado das respostas
    // anteriores aqui para o agente "lembrar" do que já foi extraído.
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
      system: URBANO_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: montarBlocosDeConteudo(textoUsuario, anexos),
        },
      ],
    });

    const textoResposta = resposta.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n');

    return NextResponse.json({ resultado: textoResposta });
  } catch (err) {
    console.error('[Urbano] erro ao processar documentos:', err);
    return NextResponse.json(
      { error: 'Erro ao processar os documentos. Tente novamente.' },
      { status: 500 }
    );
  }
}
