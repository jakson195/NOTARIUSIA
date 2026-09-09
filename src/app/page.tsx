import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <span className="text-brass-dark font-sans text-sm tracking-wide mb-3">NotariusIA</span>
      <h1 className="font-serif text-4xl md:text-5xl text-ink-800 max-w-2xl leading-tight">
        Leitura e qualificação de documentos, prontas em minutos.
      </h1>
      <p className="mt-4 text-ink-500 max-w-md">
        Três assistentes especializados para o dia a dia do tabelionato: extração
        urbana, extração rural e qualificação pessoal.
      </p>
      <Link
        href="/dashboard"
        className="mt-8 inline-block bg-ink-800 text-paper-soft px-6 py-3 rounded-sm hover:bg-ink-700 transition-colors"
      >
        Entrar no painel
      </Link>
    </main>
  );
}
