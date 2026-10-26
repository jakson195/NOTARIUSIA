'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type LinhaUso = {
  tabelionatoId: string; tabelionatoNome: string; usuarioId: string; nome: string; mes: string;
  atendimentos: number; documentos: number; paginas: number;
  inputTokens: number; outputTokens: number; custoUsd: number;
};
type Tab = {
  id: string; nome: string; cidade: string | null; uf: string | null; plano: string;
  precoBrl: number | null; upgradeEm: string | null; criadoEm: string; usuarios: number; custoMesUsd: number;
  documentosMes: number; paginasMes: number; atendimentosMes: number;
};

const NOME_PLANO: Record<string, string> = { BASICO: 'Básico', INTERMEDIARIO: 'Intermediário' };

function rotuloMes(chave: string): string {
  const [ano, mes] = chave.split('-').map(Number);
  const nome = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}
const fmtTokens = (n: number) => n.toLocaleString('pt-BR');
const fmtUsd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const fmtBrl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtData = (s: string) => new Date(s).toLocaleDateString('pt-BR');

export default function AdminUsoPage() {
  const router = useRouter();
  const [linhas, setLinhas] = useState<LinhaUso[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [limite, setLimite] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const resp = await fetch('/api/admin/uso');
      if (resp.status === 401) { router.push('/admin'); return; }
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Erro ao carregar.');
      setLinhas(data.uso ?? []);
      setTabs(data.tabelionatos ?? []);
      setLimite(data.limiteBasicoUsd ?? 0);
    } catch (e: any) {
      setErro(e.message ?? 'Erro inesperado.');
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useEffect(() => { carregar(); }, [carregar]);

  async function sair() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
    router.refresh();
  }

  async function trocarPlano(tabelionatoId: string, plano: string) {
    if (!confirm(`Mudar o plano para ${NOME_PLANO[plano]}?`)) return;
    const resp = await fetch('/api/admin/plano', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tabelionatoId, plano }),
    });
    if (resp.ok) carregar(); else alert('Não foi possível trocar o plano.');
  }

  const meses = Array.from(new Set(linhas.map((l) => l.mes)));
  const totalUsd = linhas.reduce((s, l) => s + l.custoUsd, 0);
  const receitaMensal = tabs.reduce((s, t) => s + (t.precoBrl ?? 0), 0);

  return (
    <main className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-ink-400 text-xs uppercase tracking-wide">Painel interno</p>
          <h1 className="font-serif text-3xl text-ink-800 mt-1">Planos e consumo</h1>
        </div>
        <button onClick={sair} className="text-sm text-ink-500 hover:text-wax border border-ink-200 rounded-sm px-3 py-2">
          Sair
        </button>
      </div>
      <p className="text-ink-500 text-sm mt-2 max-w-2xl">
        Custo estimado em dólar com base na tabela de preços da Anthropic — pode variar um pouco da fatura real.
        Arquivos e páginas contam o que foi enviado a partir de agora. Limite do plano Básico por mês: <strong>{fmtUsd(limite)}</strong> de consumo (ajustável em LIMITE_BASICO_USD na Vercel).
      </p>

      {carregando && <p className="mt-6 text-sm text-ink-400">Carregando…</p>}
      {erro && <p className="mt-6 text-sm text-wax">{erro}</p>}

      {!carregando && !erro && (
        <>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="border border-brass/40 bg-brass/5 rounded-sm p-4">
              <p className="text-xs text-ink-500">Consumo total estimado</p>
              <p className="font-serif text-2xl text-ink-800">{fmtUsd(totalUsd)}</p>
            </div>
            <div className="border border-ink-200 bg-paper-soft rounded-sm p-4">
              <p className="text-xs text-ink-500">Mensalidades (planos atuais)</p>
              <p className="font-serif text-2xl text-ink-800">{fmtBrl(receitaMensal)}</p>
            </div>
            <div className="border border-ink-200 bg-paper-soft rounded-sm p-4">
              <p className="text-xs text-ink-500">Tabelionatos</p>
              <p className="font-serif text-2xl text-ink-800">{tabs.length}</p>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="font-serif text-xl text-ink-800">Tabelionatos e planos (mês atual)</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-ink-200 text-left text-ink-500">
                    <th className="py-2 pr-4 font-medium">Tabelionato</th>
                    <th className="py-2 pr-4 font-medium">Plano</th>
                    <th className="py-2 pr-4 font-medium text-right">Mensalidade</th>
                    <th className="py-2 pr-4 font-medium text-right">Atend.</th>
                    <th className="py-2 pr-4 font-medium text-right">Arquivos</th>
                    <th className="py-2 pr-4 font-medium text-right">Páginas</th>
                    <th className="py-2 pr-4 font-medium text-right">Consumo do mês</th>
                    <th className="py-2 pr-4 font-medium text-right">% do limite</th>
                    <th className="py-2 font-medium text-right">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {tabs.map((t) => {
                    const pct = limite > 0 ? (t.custoMesUsd / limite) * 100 : 0;
                    const subiu = t.plano === 'INTERMEDIARIO' && t.upgradeEm;
                    return (
                      <tr key={t.id} className={`border-b border-ink-100 ${subiu ? 'bg-brass/10' : ''}`}>
                        <td className="py-2 pr-4 text-ink-800">
                          {t.nome}
                          <span className="block text-xs text-ink-400">
                            {[t.cidade, t.uf].filter(Boolean).join('/')} · {t.usuarios} usuário(s) · desde {fmtData(t.criadoEm)}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-ink-700">
                          {NOME_PLANO[t.plano] ?? t.plano}
                          {subiu && (
                            <span className="block text-xs text-wax">subiu automaticamente em {fmtData(t.upgradeEm!)} — cobrar R$ 1.500</span>
                          )}
                        </td>
                        <td className="py-2 pr-4 text-right text-ink-700">{t.precoBrl ? fmtBrl(t.precoBrl) : '—'}</td>
                        <td className="py-2 pr-4 text-right text-ink-600">{t.atendimentosMes}</td>
                        <td className="py-2 pr-4 text-right text-ink-600">{t.documentosMes}</td>
                        <td className="py-2 pr-4 text-right text-ink-600">{t.paginasMes}</td>
                        <td className="py-2 pr-4 text-right text-ink-700">{fmtUsd(t.custoMesUsd)}</td>
                        <td className={`py-2 pr-4 text-right ${pct > 100 ? 'text-wax font-medium' : 'text-ink-600'}`}>{pct.toFixed(0)}%</td>
                        <td className="py-2 text-right">
                          {t.plano === 'BASICO' ? (
                            <button onClick={() => trocarPlano(t.id, 'INTERMEDIARIO')} className="text-xs underline text-ink-500">
                              Passar p/ Intermediário
                            </button>
                          ) : (
                            <button onClick={() => trocarPlano(t.id, 'BASICO')} className="text-xs underline text-ink-500">
                              Voltar p/ Básico
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {linhas.length === 0 && (
            <p className="mt-6 text-sm text-ink-400">
              Ainda não há consumo registrado. Ele aparece aqui a partir do próximo atendimento processado.
            </p>
          )}

          {meses.map((mes) => {
            const doMes = linhas.filter((l) => l.mes === mes);
            const totalMes = doMes.reduce((s, l) => s + l.custoUsd, 0);
            return (
              <section key={mes} className="mt-8">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-serif text-xl text-ink-800">{rotuloMes(mes)}</h2>
                  <span className="text-sm text-ink-500">{fmtUsd(totalMes)}</span>
                </div>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-ink-200 text-left text-ink-500">
                        <th className="py-2 pr-4 font-medium">Tabelionato</th>
                        <th className="py-2 pr-4 font-medium">Usuário</th>
                        <th className="py-2 pr-4 font-medium text-right">Atendimentos</th>
                        <th className="py-2 pr-4 font-medium text-right">Arquivos</th>
                        <th className="py-2 pr-4 font-medium text-right">Páginas</th>
                        <th className="py-2 pr-4 font-medium text-right">Tokens entrada</th>
                        <th className="py-2 pr-4 font-medium text-right">Tokens saída</th>
                        <th className="py-2 font-medium text-right">Custo estimado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doMes.map((l) => (
                        <tr key={`${l.tabelionatoId}-${l.usuarioId}`} className="border-b border-ink-100">
                          <td className="py-2 pr-4 text-ink-600">{l.tabelionatoNome}</td>
                          <td className="py-2 pr-4 text-ink-800">{l.nome}</td>
                          <td className="py-2 pr-4 text-right text-ink-600">{l.atendimentos}</td>
                          <td className="py-2 pr-4 text-right text-ink-600">{l.documentos}</td>
                          <td className="py-2 pr-4 text-right text-ink-600">{l.paginas}</td>
                          <td className="py-2 pr-4 text-right text-ink-600">{fmtTokens(l.inputTokens)}</td>
                          <td className="py-2 pr-4 text-right text-ink-600">{fmtTokens(l.outputTokens)}</td>
                          <td className="py-2 text-right text-ink-800 font-medium">{fmtUsd(l.custoUsd)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </>
      )}
    </main>
  );
}
