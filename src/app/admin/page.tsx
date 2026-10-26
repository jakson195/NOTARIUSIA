'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const resp = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Erro ao entrar.');
      router.push('/admin/uso');
      router.refresh();
    } catch (e: any) {
      setErro(e.message ?? 'Erro inesperado.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-ink-900">
      <div className="w-full max-w-sm border border-ink-700 bg-ink-800 rounded-sm p-8">
        <p className="text-paper-soft/50 text-xs tracking-wide uppercase mb-1">Painel interno</p>
        <h1 className="font-serif text-2xl text-paper-soft mb-6">Admin</h1>
        <form onSubmit={entrar} className="flex flex-col gap-3">
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha de administrador"
            className="border border-ink-600 bg-ink-900 text-paper-soft rounded-sm p-2 text-sm placeholder:text-paper-soft/30"
            autoComplete="current-password"
            autoFocus
            required
          />
          <button
            type="submit"
            disabled={carregando}
            className="mt-2 bg-brass text-ink-900 px-4 py-2 rounded-sm text-sm font-medium hover:bg-brass-light disabled:opacity-50"
          >
            {carregando ? 'Entrando…' : 'Entrar'}
          </button>
          {erro && <p className="text-sm text-wax">{erro}</p>}
        </form>
      </div>
    </main>
  );
}
