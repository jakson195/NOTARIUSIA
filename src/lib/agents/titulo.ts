// Deriva um título/nome sugerido para o atendimento a partir do resultado
// do agente — usado no histórico e na busca. É só uma sugestão inicial:
// o escrivão pode renomear livremente depois (ver PATCH /api/atendimentos/[id]).

function primeiroValor(bloco: string, rotulos: string[]): string | null {
  for (const rotulo of rotulos) {
    const match = bloco.match(new RegExp(`${rotulo}:\\s*(.+)`, 'i'));
    const valor = match?.[1]?.trim();
    if (valor && !/^N[ÃA]O LOCALIZADO/i.test(valor) && !/^CONFLITO/i.test(valor)) {
      return valor;
    }
  }
  return null;
}

// Para Urbano/Rural: tenta achar o nome do primeiro vendedor e do primeiro
// comprador, dividindo o texto na primeira ocorrência de "OUTORGADO" ou
// "COMPRADOR" (marcador de início do bloco do comprador na minuta).
export function sugerirTituloExtracao(resultado: string): string {
  const marcador = resultado.search(/OUTORGADO|COMPRADOR/i);
  const blocoVendedor = marcador > -1 ? resultado.slice(0, marcador) : resultado;
  const blocoComprador = marcador > -1 ? resultado.slice(marcador) : '';

  const vendedor = primeiroValor(blocoVendedor, ['RAZÃO SOCIAL', 'NOME COMPLETO']);
  const comprador = primeiroValor(blocoComprador, ['RAZÃO SOCIAL', 'NOME COMPLETO']);

  if (vendedor && comprador) return `${vendedor} x ${comprador}`;
  if (vendedor) return vendedor;
  return 'Atendimento sem título';
}

// Para QualiFlash: a qualificação finalizada começa com o nome da pessoa,
// seguido de vírgula — extrai só essa primeira parte.
export function sugerirTituloQualificacao(textoResposta: string): string {
  const match = textoResposta.match(/^([^,\n]+),/);
  if (match?.[1]?.trim()) return match[1].trim();
  return 'Qualificação sem título';
}

// Respaldo quando o resultado não trouxe nenhum nome (ex: só foi anexado um
// documento do imóvel, como CAR/CCIR/matrícula, sem qualificação de pessoa
// ainda). Usa o nome do arquivo anexado, removendo palavras genéricas de
// tipo de documento e números (datas, códigos de matrícula etc.).
const PALAVRAS_GENERICAS = new Set([
  'CAR', 'CCIR', 'CNH', 'RG', 'CPF', 'CND', 'CNDT', 'ITBI', 'MATRICULA',
  'CERTIDAO', 'CONTRATO', 'PROCURACAO', 'AVALIACAO', 'INCRA', 'NIRF',
  'ESCRITURA', 'MINUTA', 'DOC', 'DOCUMENTO', 'RGI', 'PDF', 'IMG', 'SCAN',
  'CONF', 'SUL', 'MAT',
]);

function semAcento(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function sugerirTituloDeArquivo(nomesArquivos: string[]): string | null {
  for (const nomeOriginal of nomesArquivos) {
    const semExtensao = nomeOriginal.replace(/\.[a-zA-Z0-9]+$/, '');
    const tokens = semExtensao.split(/[\s_-]+/).filter(Boolean);
    const restantes = tokens.filter((tok) => {
      if (/\d/.test(tok)) return false; // datas, números de matrícula etc.
      const chave = semAcento(tok).toUpperCase();
      if (PALAVRAS_GENERICAS.has(chave)) return false;
      return /[a-zA-ZÀ-ÿ]/.test(tok);
    });
    if (restantes.length >= 1) {
      return restantes.join(' ');
    }
  }
  return null;
}
