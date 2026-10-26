'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ContatoLinha from '@/components/ContatoLinha';

export default function CadastroPage() {
  const router = useRouter();
  const [nomeTabelionato, setNomeTabelionato] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senha2, setSenha2] = useState('');
  const [website, setWebsite] = useState(''); // isca anti-robô
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (senha !== senha2) {
      setErro('As senhas não conferem.');
      return;
    }
    setCarregando(true);
    try {
      const resp = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeTabelionato, cidade, uf, nome, email, senha, website }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Erro ao criar a conta.');
      router.push('/dashboard');
      router.refresh();
    } catch (e: any) {
      setErro(e.message ?? 'Erro inesperado.');
    } finally {
      setCarregando(false);
    }
  }

  const campo = 'border border-ink-200 rounded-sm p-2 text-sm w-full';

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md border border-ink-200 bg-paper-soft rounded-sm p-8">
        <span className="font-serif text-lg text-ink-800 tracking-tight">NotariusIA</span>
        <h1 className="font-serif text-2xl text-ink-800 mt-1 mb-1">Criar conta</h1>
        <p className="text-sm text-ink-500 mb-5">
          <strong>7 dias grátis</strong>, sem cartão. Depois do teste, plano Básico (R$ 750/mês). Se o seu
          consumo mensal passar do limite do Básico, a conta passa automaticamente para o Intermediário
          (R$ 1.500/mês).
        </p>

        <form onSubmit={cadastrar} className="flex flex-col gap-3">
          <input className={campo} placeholder="Nome do tabelionato" value={nomeTabelionato}
            onChange={(e) => setNomeTabelionato(e.target.value)} required />
          <div className="flex gap-3">
            <input className={campo} placeholder="Cidade" value={cidade}
              onChange={(e) => setCidade(e.target.value)} />
            <input className={campo + ' max-w-[5rem]'} placeholder="UF" maxLength={2} value={uf}
              onChange={(e) => setUf(e.target.value)} />
          </div>
          <input className={campo} placeholder="Seu nome" value={nome}
            onChange={(e) => setNome(e.target.value)} autoComplete="name" required />
          <input className={campo} type="email" placeholder="E-mail" value={email}
            onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          <input className={campo} type="password" placeholder="Senha (mínimo 8 caracteres)" value={senha}
            onChange={(e) => setSenha(e.target.value)} autoComplete="new-password" minLength={8} required />
          <input className={campo} type="password" placeholder="Repita a senha" value={senha2}
            onChange={(e) => setSenha2(e.target.value)} autoComplete="new-password" minLength={8} required />

          {/* Campo isca: escondido de pessoas, robôs costumam preencher. */}
          <input
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
          />

          <button type="submit" disabled={carregando}
            className="mt-2 bg-ink-800 text-paper-soft px-4 py-2 rounded-sm text-sm hover:bg-ink-700 disabled:opacity-50">
            {carregando ? 'Criando conta…' : 'Criar conta'}
          </button>
          {erro && <p className="text-sm text-wax">{erro}</p>}
        </form>

        <p className="mt-4 text-xs text-ink-500">
          Já tem conta? <Link href="/login" className="underline">Entrar</Link>
        </p>
        <ContatoLinha className="mt-3 text-xs text-ink-500" />
      </div>
    </main>
  );
}
