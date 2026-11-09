'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Resumo = {
  usuarioId: string; nome: string; email: string; tabelionato: string;
  ultimoAcesso: string | null; acessos30dias: number;
};
type Acesso = {
  id: string; createdAt: string; origem: string; ip: string | null; userAgent: string | null;
  nome: string; email: string; tabelionato: string;
};

const fmtDataHora = (s: string) =>
  new Date(s).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' });

// Resumo curto do navegador/aparelho a partir do user-agent.
function aparelho(ua: string | null): string {
  if (!ua) return '—';
  const so = /Windows/i.test(ua) ? 'Windows' : /Android/i.test(ua) ? 'Android'
    : /iPhone|iPad/i.test(ua) ? 'iOS' : /Mac OS/i.test(ua) ? 'Mac' : /Linux/i.test(ua) ? 'Linux' : 'Outro';
  const nav = /Edg\//i.test(ua) ? 'Edge' : /Chrome\//i.test(ua) ? 'Chrome'
    : /Firefox\//i.test(ua) ? 'Firefox' : /Safari\//i.test(ua) ? 'Safari' : 'Navegador';
  return `${nav} / ${so}`;
}

export default function AdminLoginsPage() {
  const router = useRouter();
  const [resumo, setResumo] = useState<Resumo[]>([]);
  const [recentes, setRecentes] = useState<Acesso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch('/api/admin/logins');
        if (resp.status === 401) { router.push('/admin'); return; }
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || 'Erro ao carregar.');
        setResumo(data.resumo ?? []);
        setRecentes(data.recentes ?? []);
      } catch (e: any) {
        setErro(e.message ?? 'Erro inesperado.');
      } finally {
        setCarregando(false);
      }
    })();
  }, [router]);

  return (
    <main className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-ink-400 text-xs uppercase tracking-wide">Painel interno</p>
          <h1 className="font-serif text-3xl text-ink-800 mt-1">Quem acessou o sistema</h1>
        </div>
        <Link href="/admin/uso" className="text-sm text-ink-500 hover:text-ink-800 border border-ink-200 rounded-sm px-3 py-2">
          ← Planos e consumo
        </Link>
      </div>

      {carregando && <p className="mt-6 text-sm text-ink-400">Carregando…</p>}
      {erro && <p className="mt-6 text-sm text-wax">{erro}</p>}

      {!carregando && !erro && (
        <>
          <section className="mt-8">
            <h2 className="font-serif text-xl text-ink-800">Usuários (último acesso)</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-ink-200 text-left text-ink-500">
                    <th className="py-2 pr-4 font-medium">Usuário</th>
                    <th className="py-2 pr-4 font-medium">Tabelionato</th>
                    <th className="py-2 pr-4 font-medium">Último acesso</th>
                    <th className="py-2 font-medium text-right">Acessos (30 dias)</th>
                  </tr>
                </thead>
                <tbody>
                  {resumo.map((u) => (
                    <tr key={u.usuarioId} className="border-b border-ink-100">
                      <td className="py-2 pr-4 text-ink-800">
                        {u.nome}
                        <span className="block text-xs text-ink-400">{u.email}</span>
                      </td>
                      <td className="py-2 pr-4 text-ink-600">{u.tabelionato}</td>
                      <td className="py-2 pr-4 text-ink-700">
                        {u.ultimoAcesso ? fmtDataHora(u.ultimoAcesso) : <span className="text-ink-400">sem registro</span>}
                      </td>
                      <td className="py-2 text-right text-ink-700">{u.acessos30dias}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-ink-400">
              Os acessos só começam a ser registrados a partir da publicação desta função.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-serif text-xl text-ink-800">Últimos acessos</h2>
            {recentes.length === 0 ? (
              <p className="mt-3 text-sm text-ink-400">Nenhum acesso registrado ainda.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-ink-200 text-left text-ink-500">
                      <th className="py-2 pr-4 font-medium">Data e hora</th>
                      <th className="py-2 pr-4 font-medium">Usuário</th>
                      <th className="py-2 pr-4 font-medium">Tabelionato</th>
                      <th className="py-2 pr-4 font-medium">Aparelho</th>
                      <th className="py-2 font-medium">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentes.map((a) => (
                      <tr key={a.id} className="border-b border-ink-100">
                        <td className="py-2 pr-4 text-ink-700 whitespace-nowrap">
                          {fmtDataHora(a.createdAt)}
                          {a.origem === 'CADASTRO' && <span className="ml-2 text-xs text-brass">novo cadastro</span>}
                        </td>
                        <td className="py-2 pr-4 text-ink-800">{a.nome}<span className="block text-xs text-ink-400">{a.email}</span></td>
                        <td className="py-2 pr-4 text-ink-600">{a.tabelionato}</td>
                        <td className="py-2 pr-4 text-ink-600">{aparelho(a.userAgent)}</td>
                        <td className="py-2 text-ink-500">{a.ip ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
