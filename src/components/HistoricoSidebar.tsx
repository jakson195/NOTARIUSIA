'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

type ItemHistorico = {
  id: string;
  titulo: string;
  agente: 'URBANO' | 'RURAL' | 'QUALIFLASH';
  status: string;
  createdAt: string;
};

const ROTULO_AGENTE: Record<ItemHistorico['agente'], string> = {
  URBANO: 'Urbano',
  RURAL: 'Rural',
  QUALIFLASH: 'QualiFlash',
};

export default function HistoricoSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [de, setDe] = useState('');
  const [ate, setAte] = useState('');
  const [itens, setItens] = useState<ItemHistorico[]>([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => buscar(), 300); // debounce da digitação
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, de, ate]);

  async function buscar() {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (de) params.set('de', de);
      if (ate) params.set('ate', ate);
      const resp = await fetch(`/api/atendimentos?${params.toString()}`);
      const data = await resp.json();
      setItens(data.atendimentos ?? []);
    } catch {
      // Falha silenciosa na barra lateral — não deve travar o uso dos agentes.
    } finally {
      setCarregando(false);
    }
  }

  async function sair() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  async function excluir(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();

    const senha = window.prompt('Digite a senha para excluir este atendimento:');
    if (senha === null) return; // cancelou

    if (senha !== '1234') {
      alert('Senha incorreta. Atendimento não excluído.');
      return;
    }

    const confirmar = window.confirm('Tem certeza que deseja excluir este atendimento? Esta ação não pode ser desfeita.');
    if (!confirmar) return;

    try {
      const resp = await fetch(`/api/atendimentos/${id}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error('Falha ao excluir.');

      setItens((atuais) => atuais.filter((item) => item.id !== id));

      if (pathname === `/dashboard/historico/${id}`) {
        router.push('/dashboard');
      }
    } catch {
      alert('Não foi possível excluir o atendimento. Tente novamente.');
    }
  }

  return (
    <aside className="w-72 shrink-0 border-r border-ink-200 bg-paper-soft min-h-screen px-4 py-6 hidden md:flex md:flex-col">
      <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <span className="font-serif text-lg text-ink-800 tracking-tight">NotariusIA</span>
      </Link>
      <h2 className="font-serif text-lg text-ink-800 mt-1 mb-4">Histórico</h2>

      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nome…"
        className="w-full border border-ink-200 rounded-sm px-2 py-1.5 text-sm bg-white"
      />

      <div className="flex gap-2 mt-2">
        <input
          type="date"
          value={de}
          onChange={(e) => setDe(e.target.value)}
          className="w-1/2 border border-ink-200 rounded-sm px-1.5 py-1 text-xs bg-white"
          title="De"
        />
        <input
          type="date"
          value={ate}
          onChange={(e) => setAte(e.target.value)}
          className="w-1/2 border border-ink-200 rounded-sm px-1.5 py-1 text-xs bg-white"
          title="Até"
        />
      </div>

      <div className="mt-4 flex-1 overflow-y-auto flex flex-col gap-1">
        {carregando && itens.length === 0 && (
          <p className="text-xs text-ink-400">Carregando…</p>
        )}
        {!carregando && itens.length === 0 && (
          <p className="text-xs text-ink-400">Nenhum atendimento encontrado.</p>
        )}
        {itens.map((item) => {
          const ativo = pathname === `/dashboard/historico/${item.id}`;
          return (
            <Link
              key={item.id}
              href={`/dashboard/historico/${item.id}`}
              className={`group block rounded-sm px-2 py-2 text-sm border ${
                ativo
                  ? 'border-brass bg-brass/10'
                  : 'border-transparent hover:border-ink-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-ink-800">{item.titulo}</span>
                <button
                  onClick={(e) => excluir(e, item.id)}
                  className="shrink-0 text-ink-300 hover:text-wax text-xs opacity-0 group-hover:opacity-100 transition-opacity px-1"
                  title="Excluir atendimento"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-brass-dark">{ROTULO_AGENTE[item.agente]}</span>
                <span className="text-[11px] text-ink-400">
                  {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <button
        onClick={sair}
        className="mt-4 text-sm text-ink-500 hover:text-wax hover:border-wax/40 border border-ink-200 rounded-sm px-3 py-2 text-left transition-colors"
      >
        Sair
      </button>
    </aside>
  );
}
