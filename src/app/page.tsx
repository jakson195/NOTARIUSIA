import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden textura-papel">
      {/* Barra decorativa fina no topo */}
      <div className="h-[3px] w-full bg-gradient-to-r from-ink-800 via-brass to-ink-800" />

      {/* Selo decorativo de fundo — remete a um carimbo notarial */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full border border-brass/25"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 w-[300px] h-[300px] rounded-full border border-brass/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-24 right-40 w-2 h-2 rounded-full bg-brass/30"
      />

      <nav className="relative sticky top-0 z-10 flex items-center justify-between px-6 md:px-10 py-5 border-b border-ink-200/60 bg-paper/80 backdrop-blur-sm">
        <span className="text-brass-dark font-sans text-sm tracking-wide">NotariusIA</span>
        <Link
          href="/login"
          className="text-sm text-ink-600 border border-ink-200 rounded-sm px-4 py-2 hover:border-brass hover:text-brass-dark transition-colors"
        >
          Entrar
        </Link>
      </nav>

      {/* HERO */}
      <section className="relative px-6 pt-24 pb-28 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-6 h-px bg-brass" />
          <span className="w-1.5 h-1.5 rotate-45 bg-brass" />
          <span className="w-6 h-px bg-brass" />
        </div>
        <span className="text-brass-dark font-sans text-sm tracking-wide mb-4">
          Assistentes de IA para tabelionatos
        </span>
        <h1 className="font-serif text-4xl md:text-6xl text-ink-800 max-w-3xl leading-[1.15]">
          Leitura e qualificação de documentos, prontas em minutos.
        </h1>
        <p className="mt-6 text-ink-500 max-w-lg text-base md:text-lg leading-relaxed">
          Três assistentes especializados para o dia a dia do tabelionato: extração
          urbana, extração rural e qualificação pessoal — direto no navegador,
          sem instalar nada.
        </p>

        <Link
          href="/login"
          className="mt-10 inline-block bg-ink-800 text-paper-soft px-8 py-4 rounded-sm hover:bg-ink-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 text-base shadow-md"
        >
          Entrar no painel
        </Link>
      </section>

      {/* RECURSOS — os 3 agentes */}
      <section className="relative px-6 pb-28 max-w-5xl mx-auto">
        <h2 className="font-serif text-3xl text-ink-800 text-center mb-3">
          Um assistente para cada tipo de atendimento
        </h2>
        <p className="text-ink-500 text-center max-w-md mx-auto mb-14">
          Cada agente segue a ordem exata da sua minuta — nada de reorganizar dados
          manualmente.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <RecursoCard
            icone={<IconePredio />}
            titulo="NotariusIA-Urbano"
            descricao="Extrai dados de escrituras urbanas — imóveis, partes, certidões — e monta a lista pronta para o sistema, na ordem exata da minuta."
          />
          <RecursoCard
            icone={<IconePlantacao />}
            titulo="NotariusIA-Rural"
            descricao="Matrícula, CCIR, INCRA, CAR, certidões ambientais e fiscais, pessoas físicas e jurídicas — tudo na ordem da minuta rural."
          />
          <RecursoCard
            icone={<IconeCracha />}
            titulo="QualiFlash"
            descricao="Monta a qualificação pessoal completa a partir dos documentos, perguntando o que faltar antes de fechar o texto."
          />
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="relative px-6 pb-28 max-w-4xl mx-auto">
        <h2 className="font-serif text-3xl text-ink-800 text-center mb-16">Como funciona</h2>

        <div className="relative grid md:grid-cols-3 gap-10">
          {/* Linha conectando os passos, só em telas maiores */}
          <div
            aria-hidden
            className="hidden md:block absolute top-5 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-brass/10 via-brass/40 to-brass/10"
          />
          <PassoItem
            numero="1"
            titulo="Envie os documentos"
            descricao="PDF, imagem ou texto colado — pode mandar aos poucos, conforme o cliente traz cada documento."
          />
          <PassoItem
            numero="2"
            titulo="A IA extrai e organiza"
            descricao="Cada campo é posicionado na ordem exata da sua minuta, com pendências separadas para conferência."
          />
          <PassoItem
            numero="3"
            titulo="Copie ou exporte"
            descricao="Copie a lista pronta para o sistema do tabelionato, ou exporte em Word com um clique."
          />
        </div>
      </section>

      <footer className="relative px-6 py-10 border-t border-ink-200/60 text-center bg-paper-soft/50">
        <span className="text-brass-dark font-sans text-xs tracking-wide">NotariusIA</span>
        <p className="mt-2 text-xs text-ink-400">Acesso restrito aos tabelionatos parceiros.</p>
      </footer>
    </div>
  );
}

function RecursoCard({
  icone,
  titulo,
  descricao,
}: {
  icone: React.ReactNode;
  titulo: string;
  descricao: string;
}) {
  return (
    <div className="group border border-ink-200 bg-paper-soft rounded-sm p-7 text-left shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-brass/50 transition-all duration-200">
      <div className="w-11 h-11 rounded-sm bg-gradient-to-br from-brass/15 to-brass/5 flex items-center justify-center text-brass-dark group-hover:from-brass/25 group-hover:to-brass/10 transition-colors">
        {icone}
      </div>
      <h3 className="font-serif text-lg text-ink-800 mt-5">{titulo}</h3>
      <p className="text-sm text-ink-500 mt-2.5 leading-relaxed">{descricao}</p>
    </div>
  );
}

function PassoItem({
  numero,
  titulo,
  descricao,
}: {
  numero: string;
  titulo: string;
  descricao: string;
}) {
  return (
    <div className="relative text-center">
      <div className="relative z-10 w-10 h-10 rounded-full border border-brass bg-paper text-brass-dark font-serif text-base flex items-center justify-center mx-auto shadow-sm">
        {numero}
      </div>
      <h3 className="font-serif text-base text-ink-800 mt-4">{titulo}</h3>
      <p className="text-sm text-ink-500 mt-2 leading-relaxed">{descricao}</p>
    </div>
  );
}

function IconePredio() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1" />
      <path d="M10 21v-4h4v4" />
    </svg>
  );
}

function IconePlantacao() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 21V9" />
      <path d="M12 9c0-3.5-2.5-6-6-6 0 3.5 2.5 6 6 6Z" />
      <path d="M12 13c0-3.5 2.5-6 6-6 0 3.5-2.5 6-6 6Z" />
      <path d="M6 21h12" />
    </svg>
  );
}

function IconeCracha() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="5" y="4" width="14" height="17" rx="1.5" />
      <circle cx="12" cy="10" r="2.3" />
      <path d="M8 17c0-1.8 1.8-3 4-3s4 1.2 4 3" />
    </svg>
  );
}
