// Estimativa de custo em dólares (USD) por chamada à API da Anthropic.
// Preços por milhão de tokens do Claude Sonnet (conferir em
// https://www.anthropic.com/pricing se a Anthropic reajustar):
//   input US$ 3,00 | output US$ 15,00 | escrita de cache US$ 3,75 | leitura de cache US$ 0,30
// É uma ESTIMATIVA — serve para acompanhar consumo e definir o plano,
// não como fatura oficial.
const PRECO_INPUT_POR_MILHAO = 3.0;
const PRECO_OUTPUT_POR_MILHAO = 15.0;
const PRECO_CACHE_ESCRITA_POR_MILHAO = 3.75;
const PRECO_CACHE_LEITURA_POR_MILHAO = 0.3;

export type UsoTokens = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
};

export function estimarCustoUsd(usage: UsoTokens): number {
  return (
    (usage.input_tokens / 1_000_000) * PRECO_INPUT_POR_MILHAO +
    (usage.output_tokens / 1_000_000) * PRECO_OUTPUT_POR_MILHAO +
    ((usage.cache_creation_input_tokens ?? 0) / 1_000_000) * PRECO_CACHE_ESCRITA_POR_MILHAO +
    ((usage.cache_read_input_tokens ?? 0) / 1_000_000) * PRECO_CACHE_LEITURA_POR_MILHAO
  );
}
