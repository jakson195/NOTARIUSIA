'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Erro ao entrar.');
      router.push('/dashboard');
      router.refresh();
    } catch (e: any) {
      setErro(e.message ?? 'Erro inesperado.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm border border-ink-200 bg-paper-soft rounded-sm p-8">
        <span className="text-brass-dark font-sans text-xs tracking-wide">NotariusIA</span>
        <h1 className="font-serif text-2xl text-ink-800 mt-1 mb-6">Entrar</h1>

        <form onSubmit={entrar} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail do tabelionato"
            className="border border-ink-200 rounded-sm p-2 text-sm"
            autoComplete="email"
            required
          />
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            className="border border-ink-200 rounded-sm p-2 text-sm"
            autoComplete="current-password"
            required
          />
          <button
            type="submit"
            disabled={carregando}
            className="mt-2 bg-ink-800 text-paper-soft px-4 py-2 rounded-sm text-sm hover:bg-ink-700 disabled:opacity-50"
          >
            {carregando ? 'Entrando…' : 'Entrar'}
          </button>
          {erro && <p className="text-sm text-wax">{erro}</p>}
        </form>

        <p className="mt-4 text-xs text-ink-400">
          Não tem acesso? Fale com o administrador do sistema.
        </p>
      </div>
    </main>
  );
}
