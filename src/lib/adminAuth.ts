import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Sessão do painel admin (super-admin, fora do login dos tabelionatos).
// Cookie separado, protegido por uma senha única em ADMIN_PASSWORD.
const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'dev-secret-troque-isso-em-producao'
);
const COOKIE_NOME = 'notariusia_admin_session';
const DURACAO_SEGUNDOS = 60 * 60 * 12; // 12 horas

export async function criarSessaoAdmin() {
  const token = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_SEGUNDOS}s`)
    .sign(SECRET);

  cookies().set(COOKIE_NOME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: DURACAO_SEGUNDOS,
  });
}

export async function pegarSessaoAdmin(): Promise<boolean> {
  const token = cookies().get(COOKIE_NOME)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.admin === true;
  } catch {
    return false;
  }
}

export async function limparSessaoAdmin() {
  cookies().set(COOKIE_NOME, '', { path: '/', maxAge: 0 });
}
