import { NextRequest, NextResponse } from 'next/server';
import type Anthropic from '@anthropic-ai/sdk';
import { anthropic, CLAUDE_MODEL, montarBlocosDeConteudo, AnexoUpload } from '@/lib/anthropic';
import { RURAL_SYSTEM_PROMPT } from '@/lib/agents/prompts';
import { sugerirTituloExtracao } from '@/lib/agents/titulo';
import { prisma } from '@/lib/prisma';

// POST /api/agents/rural
// body: { texto?: string, anexos: AnexoUpload[], respostaAnterior?: string, atendimentoId?: string }
//
// Fluxo do Urbano é "one-shot": o escrivão manda os documentos (podendo
// mandar em etapas, reenviando junto com o histórico anterior) e recebe a
// lista pronta + pendências. Cada chamada salva/atualiza um Atendimento no
// banco, para aparecer no histórico com busca por data/nome.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const texto: string = body.texto ?? '';
    const anexos: AnexoUpload[] = body.anexos ?? [];
    const respostaAnterior: string | undefined = body.respostaAnterior;
    const atendimentoId: string | undefined = body.atendimentoId;

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

    const titulo = sugerirTituloExtracao(textoResposta);
    const entradaResumo =
      texto || (anexos.length > 0 ? `${anexos.length} documento(s) anexado(s)` : '(sem texto)');

    let atendimento;
    if (atendimentoId) {
      atendimento = await prisma.atendimento.update({
        where: { id: atendimentoId },
        data: {
          titulo,
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
          agente: 'RURAL',
          titulo,
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
      resultado: textoResposta,
      atendimentoId: atendimento.id,
      titulo,
    });
  } catch (err) {
    console.error('[Rural] erro ao processar documentos:', err);
    return NextResponse.json(
      { error: 'Erro ao processar os documentos. Tente novamente.' },
      { status: 500 }
    );
  }
}
