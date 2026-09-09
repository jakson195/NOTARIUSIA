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

export type DocumentoAnexo = {
  tipo: 'pdf' | 'imagem';
  mediaType: string; // ex: 'application/pdf', 'image/png', 'image/jpeg'
  base64: string;
};

// Monta os blocos de conteúdo (texto + documentos/imagens) no formato que a
// API da Claude espera, a partir dos anexos enviados pelo usuário.
export function montarBlocosDeConteudo(
  textoUsuario: string,
  anexos: DocumentoAnexo[]
): Anthropic.MessageParam['content'] {
  const blocos: Anthropic.MessageParam['content'] = [];

  for (const anexo of anexos) {
    if (anexo.tipo === 'pdf') {
      blocos.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: anexo.base64,
        },
      });
    } else {
      blocos.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: anexo.mediaType as
            | 'image/jpeg'
            | 'image/png'
            | 'image/gif'
            | 'image/webp',
          data: anexo.base64,
        },
      });
    }
  }

  blocos.push({ type: 'text', text: textoUsuario || '(documentos anexados)' });

  return blocos;
}
