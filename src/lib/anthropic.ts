import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  // Não derruba o build, mas deixa claro no log do servidor.
  console.warn(
    '[NotariusIA] ANTHROPIC_API_KEY não definida. Configure no .env antes de usar os agentes.'
  );
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Modelo usado pelos agentes. Centralizado aqui para facilitar troca futura
// (ex.: mover para um modelo mais barato/rápido em algum agente específico).
export const CLAUDE_MODEL = 'claude-sonnet-4-6';

// Os arquivos agora sobem primeiro para o Vercel Blob (upload direto do
// navegador, sem passar pelo corpo da nossa função serverless — ver
// /api/upload). Aqui recebemos só a URL pública do Blob e a função busca o
// conteúdo do arquivo no servidor, sem o limite de ~4.5MB por requisição
// que existia quando o base64 vinha direto no corpo do POST do navegador.
export type AnexoUpload = {
  tipo: 'pdf' | 'imagem';
  mediaType: string; // ex: 'application/pdf', 'image/png', 'image/jpeg'
  url: string; // URL pública retornada pelo Vercel Blob
  nome?: string; // nome original do arquivo — usado como respaldo para sugerir título
};

export type MetricasUpload = { documentos: number; paginas: number };

// Conta as páginas de um PDF (usado só para métrica de consumo; se falhar,
// usa uma contagem aproximada e segue — nunca derruba o atendimento).
async function contarPaginasPdf(buffer: Buffer): Promise<number> {
  try {
    const { PDFDocument } = await import('pdf-lib');
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true, updateMetadata: false });
    return Math.max(1, doc.getPageCount());
  } catch {
    const achados = buffer.toString('latin1').match(/\/Type\s*\/Page[^s]/g);
    return Math.max(1, achados?.length ?? 1);
  }
}

async function baixarComoBase64(
  url: string,
  tipo?: 'pdf' | 'imagem',
  metricas?: MetricasUpload
): Promise<string> {
  const resposta = await fetch(url);
  if (!resposta.ok) {
    throw new Error(`Falha ao baixar anexo (${resposta.status}): ${url}`);
  }
  const buffer = Buffer.from(await resposta.arrayBuffer());
  if (metricas) {
    metricas.documentos += 1;
    metricas.paginas += tipo === 'pdf' ? await contarPaginasPdf(buffer) : 1;
  }
  return buffer.toString('base64');
}

// Monta os blocos de conteúdo (texto + documentos/imagens) no formato que a
// API da Claude espera, buscando cada anexo a partir da sua URL no Blob.
// Tipado como `any[]` de propósito: a tipagem estrita da SDK, nesta versão,
// não inclui blocos "document" (PDF) no tipo de MessageParam.content, mesmo
// a API aceitando esse formato normalmente em tempo de execução.
export async function montarBlocosDeConteudo(
  textoUsuario: string,
  anexos: AnexoUpload[],
  metricas?: MetricasUpload
): Promise<any[]> {
  const blocos: any[] = [];

  for (const anexo of anexos) {
    const base64 = await baixarComoBase64(anexo.url, anexo.tipo, metricas);

    if (anexo.tipo === 'pdf') {
      blocos.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: base64,
        },
      });
    } else {
      blocos.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: anexo.mediaType,
          data: base64,
        },
      });
    }
  }

  blocos.push({ type: 'text', text: textoUsuario || '(documentos anexados)' });

  return blocos;
}
