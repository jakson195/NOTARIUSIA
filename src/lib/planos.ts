// Planos do NotariusIA.
//
// - BASICO: R$ 750/mês. Vale enquanto o consumo mensal de IA do tabelionato
//   ficar até LIMITE_BASICO_USD (referência: o gasto médio de um tabelionato
//   no plano básico, medido na conta da Anthropic).
// - INTERMEDIARIO: R$ 1.500/mês. O tabelionato sobe para este plano
//   automaticamente quando o consumo do mês passa do limite do Básico.
//
// O limite pode ser ajustado SEM mexer no código: defina LIMITE_BASICO_USD
// (em dólares) nas variáveis de ambiente da Vercel.

export type PlanoChave = 'BASICO' | 'INTERMEDIARIO';

export const PLANOS: Record<PlanoChave, { nome: string; precoBrl: number }> = {
  BASICO: { nome: 'Básico', precoBrl: 750 },
  INTERMEDIARIO: { nome: 'Intermediário', precoBrl: 1500 },
};

export function limiteBasicoUsd(): number {
  const v = Number(process.env.LIMITE_BASICO_USD);
  return Number.isFinite(v) && v > 0 ? v : 11.07;
}

export function nomeDoPlano(plano: string): string {
  return (PLANOS as any)[plano]?.nome ?? plano;
}

export function precoDoPlano(plano: string): number | null {
  return (PLANOS as any)[plano]?.precoBrl ?? null;
}

// Início do mês corrente no fuso de São Paulo (UTC-3), como Date em UTC.
export function inicioDoMesSP(ref: Date = new Date()): Date {
  const sp = new Date(ref.getTime() - 3 * 60 * 60 * 1000);
  return new Date(Date.UTC(sp.getUTCFullYear(), sp.getUTCMonth(), 1, 3, 0, 0));
}
