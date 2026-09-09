// ⚠️ STUB — isto é só um esqueleto visual, sem autenticação real por trás.
// Antes de aceitar tabelionatos/clientes de verdade, troque por um provedor
// de autenticação real (ex.: Clerk, NextAuth/Auth.js, ou Supabase Auth) que
// já cuide de hashing de senha, sessão, verificação de e-mail e 2FA.
// Ver README.md → seção "Autenticação".

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm border border-ink-200 bg-paper-soft rounded-sm p-8">
        <span className="text-brass-dark font-sans text-xs tracking-wide">NotariusIA</span>
        <h1 className="font-serif text-2xl text-ink-800 mt-1 mb-6">Entrar</h1>

        <form className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="E-mail do tabelionato"
            className="border border-ink-200 rounded-sm p-2 text-sm"
          />
          <input
            type="password"
            placeholder="Senha"
            className="border border-ink-200 rounded-sm p-2 text-sm"
          />
          <button
            type="submit"
            className="mt-2 bg-ink-800 text-paper-soft px-4 py-2 rounded-sm text-sm hover:bg-ink-700"
          >
            Entrar
          </button>
        </form>

        <p className="mt-4 text-xs text-ink-400">
          Autenticação ainda não conectada — ver README.md.
        </p>
      </div>
    </main>
  );
}
