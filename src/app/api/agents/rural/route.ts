import { NextRequest, NextResponse } from 'next/server';
import type Anthropic from '@anthropic-ai/sdk';
import { anthropic, CLAUDE_MODEL, montarBlocosDeConteudo, AnexoUpload } from '@/lib/anthropic';
import { RURAL_SYSTEM_PROMPT } from '@/lib/agents/prompts';
import { sugerirTituloExtracao, sugerirTituloDeArquivo } from '@/lib/agents/titulo';
import { prisma } from '@/lib/prisma';

// POST /api/agents/urbano
// body: { texto?, anexos: AnexoUpload[], respostaAnterior?, atendimentoId?, tituloManual? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const texto: string = body.texto ?? '';
    const anexos: AnexoUpload[] = body.anexos ?? [];
    const respostaAnterior: string | undefined = body.respostaAnterior;
    const atendimentoId: string | undefined = body.atendimentoId;
    const tituloManual: string | undefined = body.tituloManual?.trim();

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

    // Prioridade do título: manual > nome extraído do resultado > nome do
    // arquivo anexado > (na criação) rótulo genérico.
    const tituloAuto = sugerirTituloExtracao(textoResposta);
    const tituloDoArquivo =
      tituloAuto === 'Atendimento sem título'
        ? sugerirTituloDeArquivo(anexos.map((a) => a.nome).filter(Boolean) as string[])
        : null;
    const tituloFinal =
      tituloManual ||
      (tituloAuto !== 'Atendimento sem título' ? tituloAuto : tituloDoArquivo) ||
      undefined;

    const entradaResumo =
      texto || (anexos.length > 0 ? `${anexos.length} documento(s) anexado(s)` : '(sem texto)');

    let atendimento;
    if (atendimentoId) {
      atendimento = await prisma.atendimento.update({
        where: { id: atendimentoId },
        data: {
          ...(tituloFinal ? { titulo: tituloFinal } : {}), // nunca sobrescreve com fallback genérico
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
          titulo: tituloFinal || 'Atendimento sem título',
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
      titulo: atendimento.titulo,
    });
  } catch (err) {
    console.error('[Rural] erro ao processar documentos:', err);
    return NextResponse.json(
      { error: 'Erro ao processar os documentos. Tente novamente.' },
      { status: 500 }
    );
  }
}
