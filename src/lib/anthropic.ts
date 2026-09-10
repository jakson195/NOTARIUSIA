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

async function baixarComoBase64(url: string): Promise<string> {
  const resposta = await fetch(url);
  if (!resposta.ok) {
    throw new Error(`Falha ao baixar anexo (${resposta.status}): ${url}`);
  }
  const buffer = await resposta.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

// Monta os blocos de conteúdo (texto + documentos/imagens) no formato que a
// API da Claude espera, buscando cada anexo a partir da sua URL no Blob.
// Tipado como `any[]` de propósito: a tipagem estrita da SDK, nesta versão,
// não inclui blocos "document" (PDF) no tipo de MessageParam.content, mesmo
// a API aceitando esse formato normalmente em tempo de execução.
export async function montarBlocosDeConteudo(
  textoUsuario: string,
  anexos: AnexoUpload[]
): Promise<any[]> {
  const blocos: any[] = [];

  for (const anexo of anexos) {
    const base64 = await baixarComoBase64(anexo.url);

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
