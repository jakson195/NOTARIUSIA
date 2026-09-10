import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { criarTokenSessao, NOME_COOKIE_SESSAO } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json();

    if (!email || !senha) {
      return NextResponse.json({ error: 'Informe e-mail e senha.' }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });

    // Mensagem genérica de propósito — não revela se o e-mail existe ou não.
    if (!usuario) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    const token = await criarTokenSessao({
      usuarioId: usuario.id,
      tabelionatoId: usuario.tabelionatoId,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
    });

    const resposta = NextResponse.json({ ok: true });
    resposta.cookies.set(NOME_COOKIE_SESSAO, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });
    return resposta;
  } catch (err) {
    console.error('[Login] erro:', err);
    return NextResponse.json({ error: 'Erro ao entrar. Tente novamente.' }, { status: 500 });
  }
}
