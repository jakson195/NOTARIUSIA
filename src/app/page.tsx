import Link from 'next/link';
import Logo from '@/components/Logo';

const LINKS_NAV = [
  { href: '#inicio', label: 'Início' },
  { href: '#assistentes', label: 'Assistentes' },
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#beneficios', label: 'Benefícios' },
  { href: '#faq', label: 'FAQ' },
];

export default function Home() {
  return (
    <div className="min-h-screen relative textura-papel" id="inicio">
      <div className="h-[3px] w-full bg-gradient-to-r from-ink-800 via-brass to-ink-800" />

      {/* NAV */}
      <nav className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 md:px-10 py-4 border-b border-ink-200/60 bg-paper/85 backdrop-blur-sm">
        <Link href="#inicio" className="flex items-center gap-2.5">
          <Logo tamanho={34} />
          <span className="font-serif text-sm leading-tight">
            <span className="block font-semibold text-ink-800">Agrimensura</span>
            <span className="block text-brass-dark">Descomplicada</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {LINKS_NAV.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-ink-500 hover:text-ink-800 transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        <Link
          href="/login"
          className="text-sm bg-ink-800 text-paper-soft px-4 md:px-5 py-2.5 rounded-sm hover:bg-ink-700 transition-colors whitespace-nowrap"
        >
          Acessar os assistentes →
        </Link>
      </nav>

      {/* HERO */}
      <section className="relative px-6 md:px-10 pt-14 pb-20 grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-brass-dark font-sans text-xs tracking-wide font-medium">
              ASSISTENTES DE IA PARA TABELIONATOS
            </span>
            <span className="flex-1 h-px bg-brass/40 max-w-16" />
          </div>

          <h1 className="font-serif text-4xl md:text-5xl text-ink-800 leading-[1.15]">
            Leitura e qualificação de documentos, prontas em minutos.
          </h1>
          <p className="mt-5 text-ink-500 text-base leading-relaxed max-w-md">
            Três assistentes especializados para o dia a dia do tabelionato: extração
            urbana, extração rural e qualificação pessoal — direto no navegador, sem
            instalar nada.
          </p>

          <div className="flex flex-wrap items-center gap-5 mt-8">
            <Link
              href="/login"
              className="bg-ink-800 text-paper-soft px-6 py-3.5 rounded-sm hover:bg-ink-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 shadow-md"
            >
              Acessar os assistentes →
            </Link>
            <a href="#como-funciona" className="flex items-center gap-2 text-sm text-ink-600 hover:text-brass-dark transition-colors">
              <span className="w-8 h-8 rounded-full border border-ink-300 flex items-center justify-center">▶</span>
              Conheça em 1 minuto
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            <BeneficioMini icone={<IconeRelogio />} texto="Mais agilidade na rotina" />
            <BeneficioMini icone={<IconeEscudo />} texto="Mais segurança nas informações" />
            <BeneficioMini icone={<IconeCamadas />} texto="Menos retrabalho e mais tempo para o que importa" />
          </div>
        </div>

        {/* Foto real do hero, fornecida pelo cliente */}
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-10 -right-10 w-64 h-64 rounded-full border border-brass/20"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-notebook.jpg"
            alt="Notebook com o Agrimensura Descomplicada aberto sobre uma mesa, ao lado de documentos e material de escritório"
            className="relative w-full h-auto rounded-lg shadow-xl object-cover"
          />
        </div>
      </section>

      {/* NOSSOS ASSISTENTES */}
      <section id="assistentes" className="relative px-6 md:px-10 py-24 max-w-6xl mx-auto">
        <Eyebrow texto="NOSSOS ASSISTENTES" />
        <h2 className="font-serif text-3xl text-ink-800 mt-3">
          Um assistente para cada tipo de atendimento
        </h2>
        <p className="text-ink-500 mt-2 max-w-lg">
          Cada agente segue a ordem exata da sua minuta — nada de reorganizar dados
          manualmente.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <AgenteCard
            icone={<IconePredio />}
            titulo="NotariusIA-Urbano"
            descricao="Extrai dados de escrituras urbanas — imóveis, partes, certidões — e monta a lista pronta para o sistema, na ordem exata da minuta."
          />
          <AgenteCard
            icone={<IconePlantacao />}
            titulo="NotariusIA-Rural"
            descricao="Matrícula, CCIR, INCRA, CAR, certidões ambientais e fiscais, pessoas físicas e jurídicas — tudo na ordem da minuta rural."
          />
          <AgenteCard
            icone={<IconeCracha />}
            titulo="QualiFlash"
            descricao="Monta a qualificação pessoal completa a partir dos documentos, perguntando o que faltar antes de fechar o texto."
          />
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="relative px-6 md:px-10 py-24 bg-paper-soft/60 border-y border-ink-200/60">
        <div className="max-w-5xl mx-auto text-center">
          <Eyebrow texto="COMO FUNCIONA" centralizado />
          <h2 className="font-serif text-3xl text-ink-800 mt-3">
            Do documento ao resultado, em poucos passos
          </h2>
          <p className="text-ink-500 mt-2">Simples, rápido e seguro.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-x-2 gap-y-10 mt-14 items-start">
            <PassoItem icone={<IconeUpload />} numero="1" titulo="Envie os documentos" descricao="PDF, fotos ou imagens." />
            <SetaPasso />
            <PassoItem icone={<IconeLupa />} numero="2" titulo="A IA lê e confere" descricao="Extrai e organiza os dados conforme a rotina da serventia." />
            <SetaPasso />
            <PassoItem icone={<IconeLista />} numero="3" titulo="Dados organizados" descricao="Lista pronta, na ordem da minuta." />
            <SetaPasso />
            <PassoItem icone={<IconeCheck />} numero="4" titulo="Resultado em minutos" descricao="Mais agilidade e segurança no atendimento." />
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section id="beneficios" className="relative px-6 md:px-10 py-20 bg-ink-800 text-paper-soft overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full border border-brass/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-8 -left-8 w-48 h-48 rounded-full border border-brass/10"
        />
        <div className="relative max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-serif text-3xl leading-tight">
              Tradição no registro.
              <br />
              Inovação na prática.
            </h2>
            <p className="mt-4 text-paper-soft/70 max-w-md">
              O Agrimensura Descomplicada desenvolve soluções em IA para tornar o
              trabalho do tabelionato mais simples, rápido e seguro, respeitando a
              técnica e a rotina da serventia.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block bg-brass text-ink-800 px-6 py-3 rounded-sm hover:bg-brass-light transition-colors font-medium"
            >
              Acessar os assistentes →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <BeneficioGrande icone={<IconeAlvo />} texto="Precisão dos dados" />
            <BeneficioGrande icone={<IconeCadeado />} texto="Confidencialidade e segurança" />
            <BeneficioGrande icone={<IconeRelogio />} texto="Economia de tempo" />
            <BeneficioGrande icone={<IconePessoas />} texto="Mais produtividade para sua equipe" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative px-6 md:px-10 py-24 max-w-3xl mx-auto">
        <Eyebrow texto="PERGUNTAS FREQUENTES" centralizado />
        <h2 className="font-serif text-3xl text-ink-800 mt-3 text-center mb-10">
          Dúvidas comuns
        </h2>

        <div className="flex flex-col gap-3">
          <FaqItem
            pergunta="Preciso instalar algum programa?"
            resposta="Não. Os assistentes rodam direto no navegador — é só entrar com seu login e usar."
          />
          <FaqItem
            pergunta="Funciona para imóveis rurais também?"
            resposta="Sim. O NotariusIA-Rural cobre matrícula, CCIR, INCRA, CAR, certidões ambientais e fiscais, além de pessoas físicas e jurídicas."
          />
          <FaqItem
            pergunta="Consigo exportar o resultado?"
            resposta="Sim — dá para copiar a lista pronta ou exportar direto em Word, com um clique."
          />
          <FaqItem
            pergunta="Meus documentos ficam salvos?"
            resposta="O histórico de atendimentos fica salvo e pode ser buscado por nome ou data, sempre isolado por tabelionato."
          />
        </div>
      </section>

      <footer className="relative px-6 md:px-10 py-10 border-t border-ink-200/60 bg-paper-soft/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-2.5">
            <Logo tamanho={28} />
            <span className="font-serif text-sm text-ink-800 leading-tight">
              Agrimensura Descomplicada
            </span>
          </div>
          <p className="text-xs text-ink-400">Tecnologia a favor da regularização.</p>
          <p className="text-xs text-ink-400">Assistentes de IA para tabelionatos</p>
        </div>
      </footer>
    </div>
  );
}

function Eyebrow({ texto, centralizado }: { texto: string; centralizado?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${centralizado ? 'justify-center' : ''}`}>
      <span className="w-6 h-px bg-brass" />
      <span className="text-brass-dark font-sans text-xs tracking-wide font-medium">{texto}</span>
      <span className="w-6 h-px bg-brass" />
    </div>
  );
}

function BeneficioMini({ icone, texto }: { icone: React.ReactNode; texto: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-brass-dark mt-0.5">{icone}</span>
      <span className="text-xs text-ink-500 leading-snug">{texto}</span>
    </div>
  );
}

function BeneficioGrande({ icone, texto }: { icone: React.ReactNode; texto: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 border border-paper-soft/15 rounded-sm p-5">
      <span className="text-brass">{icone}</span>
      <span className="text-sm text-paper-soft/90">{texto}</span>
    </div>
  );
}

function AgenteCard({
  icone,
  titulo,
  descricao,
}: {
  icone: React.ReactNode;
  titulo: string;
  descricao: string;
}) {
  return (
    <div className="bg-ink-800 text-paper-soft rounded-sm p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <div className="w-11 h-11 rounded-sm bg-paper-soft flex items-center justify-center text-ink-800">
        {icone}
      </div>
      <h3 className="font-serif text-lg mt-5">{titulo}</h3>
      <p className="text-sm text-paper-soft/70 mt-2.5 leading-relaxed">{descricao}</p>
      <Link
        href="/login"
        className="inline-flex items-center gap-1 mt-5 text-sm bg-brass text-ink-800 px-4 py-2 rounded-sm hover:bg-brass-light transition-colors font-medium"
      >
        Acessar assistente →
      </Link>
    </div>
  );
}

function SetaPasso() {
  return (
    <div className="hidden lg:flex items-center justify-center pt-6 text-brass/50">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 12h15M13 6l6 6-6 6" />
      </svg>
    </div>
  );
}

function PassoItem({
  icone,
  numero,
  titulo,
  descricao,
}: {
  icone: React.ReactNode;
  numero: string;
  titulo: string;
  descricao: string;
}) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-full bg-paper border border-brass/30 text-brass-dark flex items-center justify-center mx-auto shadow-sm">
        {icone}
      </div>
      <h3 className="font-serif text-base text-ink-800 mt-4">
        {numero}. {titulo}
      </h3>
      <p className="text-sm text-ink-500 mt-1.5 leading-relaxed">{descricao}</p>
    </div>
  );
}

function FaqItem({ pergunta, resposta }: { pergunta: string; resposta: string }) {
  return (
    <details className="group border border-ink-200 bg-paper-soft rounded-sm px-5 py-4">
      <summary className="cursor-pointer list-none flex items-center justify-between text-ink-800 font-medium text-sm">
        {pergunta}
        <span className="text-brass-dark transition-transform group-open:rotate-45 text-lg leading-none">+</span>
      </summary>
      <p className="text-sm text-ink-500 mt-3 leading-relaxed">{resposta}</p>
    </details>
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
function IconeRelogio() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
function IconeEscudo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
    </svg>
  );
}
function IconeCamadas() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3l9 5-9 5-9-5 9-5Z" />
      <path d="M3 13l9 5 9-5" />
    </svg>
  );
}
function IconeUpload() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 16V4M8 8l4-4 4 4" />
      <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
    </svg>
  );
}
function IconeLupa() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="6" y="3" width="10" height="13" rx="1" />
      <circle cx="15" cy="15" r="4" />
      <path d="M18 18l3 3" />
    </svg>
  );
}
function IconeLista() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M8 6h11M8 12h11M8 18h11" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}
function IconeCheck() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  );
}
function IconeAlvo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.7" fill="currentColor" />
    </svg>
  );
}
function IconeCadeado() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </svg>
  );
}
function IconePessoas() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.3" />
      <path d="M15.5 14a5 5 0 015.5 5" />
    </svg>
  );
}
