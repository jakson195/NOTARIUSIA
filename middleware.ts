import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'dev-secret-troque-isso-em-producao'
);
const NOME_COOKIE_SESSAO = 'notariusia_session';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(NOME_COOKIE_SESSAO)?.value;
  const autenticado = token ? await tokenValido(token) : false;

  if (autenticado) {
    return NextResponse.next();
  }

  // Rotas de API devem responder com JSON 401 (quem chama é o fetch() do
  // frontend, não deve seguir um redirect). Páginas do painel redirecionam
  // para o login normalmente.
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const url = new URL('/login', req.url);
  return NextResponse.redirect(url);
}

async function tokenValido(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/agents/:path*',
    '/api/atendimentos/:path*',
    '/api/upload',
    '/api/export/word',
  ],
};
