import Link from 'next/link';
import Logo from '@/components/Logo';

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

export default function Dashboard() {
  return (
    <main className="min-h-screen px-6 py-12 md:py-16 max-w-4xl mx-auto">
      <header className="mb-10">
        <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo tamanho={26} />
          <span className="text-brass-dark font-sans text-sm tracking-wide">
            Agrimensura Descomplicada
          </span>
        </Link>
        <h1 className="font-serif text-3xl text-ink-800 mt-1">Escolha um assistente</h1>
      </header>

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
