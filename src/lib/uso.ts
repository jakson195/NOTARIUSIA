import { prisma } from '@/lib/prisma';
import { estimarCustoUsd } from '@/lib/custoApi';
import { inicioDoMesSP, limiteBasicoUsd } from '@/lib/planos';

type AgenteTipo = 'URBANO' | 'RURAL' | 'QUALIFLASH';

// Registra o consumo de uma chamada à Anthropic e, se o tabelionato está no
// plano Básico e já passou do limite do mês, sobe para o Intermediário.
// Nunca lança erro: falha aqui não pode derrubar o atendimento.
export async function registrarUso(params: {
  tabelionatoId: string;
  usuarioId: string;
  agente: AgenteTipo;
  usage: any;
  metricas?: { documentos: number; paginas: number };
}) {
  try {
    const uso = params.usage ?? {};
    await prisma.usoApi.create({
      data: {
        tabelionatoId: params.tabelionatoId,
        usuarioId: params.usuarioId,
        agente: params.agente,
        inputTokens: uso.input_tokens ?? 0,
        outputTokens: uso.output_tokens ?? 0,
        cacheCreationTokens: uso.cache_creation_input_tokens ?? 0,
        cacheReadTokens: uso.cache_read_input_tokens ?? 0,
        documentos: params.metricas?.documentos ?? 0,
        paginas: params.metricas?.paginas ?? 0,
        custoEstimadoUsd: estimarCustoUsd({
          input_tokens: uso.input_tokens ?? 0,
          output_tokens: uso.output_tokens ?? 0,
          cache_creation_input_tokens: uso.cache_creation_input_tokens ?? 0,
          cache_read_input_tokens: uso.cache_read_input_tokens ?? 0,
        }),
      },
    });

    const tab = await prisma.tabelionato.findUnique({
      where: { id: params.tabelionatoId },
      select: { plano: true },
    });
    if (tab?.plano === 'BASICO') {
      const soma = await prisma.usoApi.aggregate({
        where: { tabelionatoId: params.tabelionatoId, createdAt: { gte: inicioDoMesSP() } },
        _sum: { custoEstimadoUsd: true },
      });
      if ((soma._sum.custoEstimadoUsd ?? 0) > limiteBasicoUsd()) {
        await prisma.tabelionato.update({
          where: { id: params.tabelionatoId },
          data: { plano: 'INTERMEDIARIO', upgradeEm: new Date() },
        });
      }
    }
  } catch (err) {
    console.error('[Uso] erro ao registrar consumo (não bloqueia o atendimento):', err);
  }
}
