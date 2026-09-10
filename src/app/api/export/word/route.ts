import { NextRequest, NextResponse } from 'next/server';
import { gerarDocxDeResultado } from '@/lib/export/word';

// POST /api/export/word
// body: { titulo: string, conteudo: string }
// Retorna o arquivo .docx pronto para download.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const titulo: string = body.titulo?.trim() || 'Atendimento';
    const conteudo: string = body.conteudo ?? '';

    if (!conteudo.trim()) {
      return NextResponse.json({ error: 'Nada para exportar.' }, { status: 400 });
    }

    const buffer = await gerarDocxDeResultado(titulo, conteudo);
    const nomeArquivo = `${titulo.replace(/[^\p{L}\p{N} ]/gu, '').trim() || 'atendimento'}.docx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${nomeArquivo}"`,
      },
    });
  } catch (err) {
    console.error('[Export Word] erro ao gerar documento:', err);
    return NextResponse.json({ error: 'Erro ao gerar o Word.' }, { status: 500 });
  }
}
