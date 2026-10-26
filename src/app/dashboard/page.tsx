import Link from 'next/link';
import ContatoLinha from '@/components/ContatoLinha';
import { pegarSessao } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { situacaoDoTeste } from '@/lib/planos';

export const dynamic = 'force-dynamic';

const agentes = [
  {
    href: '/dashboard/urbano',
    nome: 'NotariusIA-Urbano',
    descricao:
      'Assistente de apoio ao tabelionato especializado em escritura pública envolvendo imóveis urbanos.',
    disponivel: true,
  },
  {
    href: '/dashboard/rural',
    nome: 'NotariusIA-Rural',
    descricao:
      'Assistente de apoio ao tabelionato especializado em escritura pública envolvendo imóveis rurais.',
    disponivel: true,
  },
  {
    href: '/dashboard/qualiflash',
    nome: 'QualiFlash',
    descricao:
      'Assistente responsável por montar qualificação pessoal.',
    disponivel: true,
  },
];

export default async function Dashboard() {
  const sessao = await pegarSessao();
  const tab = sessao
    ? await prisma.tabelionato.findUnique({ where: { id: sessao.tabelionatoId }, select: { testeAte: true } })
    : null;
  const teste = situacaoDoTeste(tab?.testeAte);

  return (
    <main className="min-h-screen px-6 py-12 md:py-16 max-w-4xl mx-auto">
      <header className="mb-10">
        <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="font-serif text-xl text-ink-800 tracking-tight">NotariusIA</span>
        </Link>
        <h1 className="font-serif text-3xl text-ink-800 mt-1">Escolha um assistente</h1>
      </header>

      {teste.emTeste && (
        <p className="mb-6 border border-brass/40 bg-brass/5 rounded-sm p-3 text-sm text-ink-700">
          Teste grátis: restam <strong>{teste.diasRestantes} dia(s)</strong>. Depois, fale com o administrador para ativar o plano.
          <ContatoLinha className="mt-1 text-xs text-ink-500" />
        </p>
      )}
      {teste.expirado && (
        <p className="mb-6 border border-wax/40 bg-wax/5 rounded-sm p-3 text-sm text-wax">
          O período de teste grátis terminou. Fale com o administrador para ativar o seu plano.
          <ContatoLinha className="mt-1 text-xs" />
        </p>
      )}

      <div className="grid gap-4">
        {agentes.map((agente) => (
          <AgenteCard key={agente.nome} {...agente} />
        ))}
      </div>
    </main>
  );
}

function AgenteCard({
  href,
  nome,
  descricao,
  disponivel,
}: {
  href: string;
  nome: string;
  descricao: string;
  disponivel: boolean;
}) {
  const conteudo = (
    <div
      className={`border border-ink-200 bg-paper-soft p-6 rounded-sm transition-colors ${
        disponivel ? 'hover:border-brass cursor-pointer' : 'opacity-60'
      }`}
    >
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-xl text-ink-800">{nome}</h2>
        {!disponivel && (
          <span className="text-xs text-ink-400 font-sans">em breve</span>
        )}
      </div>
      <p className="mt-2 text-sm text-ink-500 leading-relaxed">{descricao}</p>
    </div>
  );

  if (!disponivel) return conteudo;

  return <Link href={href}>{conteudo}</Link>;
}
