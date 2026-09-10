import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 md:px-10 py-6">
        <span className="text-brass-dark font-sans text-sm tracking-wide">NotariusIA</span>
        <Link
          href="/login"
          className="text-sm text-ink-600 border border-ink-200 rounded-sm px-4 py-2 hover:border-brass transition-colors"
        >
          Entrar
        </Link>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <span className="inline-block w-10 h-px bg-brass mb-6" />
        <span className="text-brass-dark font-sans text-sm tracking-wide mb-3">
          Assistentes de IA para tabelionatos
        </span>
        <h1 className="font-serif text-4xl md:text-5xl text-ink-800 max-w-2xl leading-tight">
          Leitura e qualificação de documentos, prontas em minutos.
        </h1>
        <p className="mt-4 text-ink-500 max-w-md">
          Três assistentes especializados para o dia a dia do tabelionato: extração
          urbana, extração rural e qualificação pessoal.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {['NotariusIA-Urbano', 'NotariusIA-Rural', 'QualiFlash'].map((nome) => (
            <span
              key={nome}
              className="text-xs text-ink-500 border border-ink-200 rounded-full px-3 py-1"
            >
              {nome}
            </span>
          ))}
        </div>

        <Link
          href="/login"
          className="mt-8 inline-block bg-ink-800 text-paper-soft px-6 py-3 rounded-sm hover:bg-ink-700 transition-colors"
        >
          Entrar no painel
        </Link>
      </main>

      <footer className="px-6 py-6 text-center text-xs text-ink-400">
        Acesso restrito aos tabelionatos parceiros.
      </footer>
    </div>
  );
}
