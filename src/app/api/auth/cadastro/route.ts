import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { criarTokenSessao, NOME_COOKIE_SESSAO } from '@/lib/auth';
import { fimDoTeste } from '@/lib/planos';

// POST /api/auth/cadastro — autocadastro de um novo tabelionato.
// Cria o tabelionato (plano Básico) + o primeiro usuário (ADMIN) e já
// deixa a pessoa logada. Rota pública (fora do matcher do middleware).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Campo isca: pessoas não veem este campo, robôs preenchem.
    if (body.website) {
      return NextResponse.json({ ok: true });
    }

    const nomeTabelionato = String(body.nomeTabelionato ?? '').trim();
    const nome = String(body.nome ?? '').trim();
    const email = String(body.email ?? '').toLowerCase().trim();
    const senha = String(body.senha ?? '');
    const cidade = String(body.cidade ?? '').trim() || null;
    const uf = String(body.uf ?? '').trim().toUpperCase().slice(0, 2) || null;

    if (!nomeTabelionato || !nome || !email || !senha) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
    }
    if (senha.length < 8) {
      return NextResponse.json({ error: 'A senha precisa ter ao menos 8 caracteres.' }, { status: 400 });
    }

    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) {
      return NextResponse.json(
        { error: 'Este e-mail já está cadastrado. Use "Entrar".' },
        { status: 409 }
      );
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        papel: 'ADMIN',
        tabelionato: {
          create: { nome: nomeTabelionato, cidade, uf, plano: 'BASICO', testeAte: fimDoTeste() },
        },
      },
    });

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
      maxAge: 60 * 60 * 24 * 7,
    });
    return resposta;
  } catch (err) {
    console.error('[Cadastro] erro:', err);
    return NextResponse.json({ error: 'Erro ao criar a conta. Tente novamente.' }, { status: 500 });
  }
}
