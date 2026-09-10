import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Chave usada para assinar/verificar a sessão. Em produção, SEMPRE defina
// AUTH_SECRET no .env / nas variáveis de ambiente da Vercel — o valor
// abaixo é só um placeholder de desenvolvimento.
const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'dev-secret-troque-isso-em-producao'
);

export const NOME_COOKIE_SESSAO = 'notariusia_session';

export type SessaoPayload = {
  usuarioId: string;
  tabelionatoId: string;
  nome: string;
  email: string;
  papel: 'ADMIN' | 'ESCRIVAO';
};

export async function criarTokenSessao(payload: SessaoPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verificarTokenSessao(token: string): Promise<SessaoPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessaoPayload;
  } catch {
    return null;
  }
}

// Lê e valida a sessão a partir do cookie — usar dentro de rotas de API
// (Route Handlers), nunca no middleware (lá usamos jwtVerify direto).
export async function pegarSessao(): Promise<SessaoPayload | null> {
  const token = cookies().get(NOME_COOKIE_SESSAO)?.value;
  if (!token) return null;
  return verificarTokenSessao(token);
}
