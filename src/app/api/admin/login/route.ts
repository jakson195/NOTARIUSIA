import { NextRequest, NextResponse } from 'next/server';
import { criarSessaoAdmin } from '@/lib/adminAuth';

// POST /api/admin/login — compara com ADMIN_PASSWORD (variável de ambiente).
export async function POST(req: NextRequest) {
  try {
    const senhaConfigurada = process.env.ADMIN_PASSWORD;
    if (!senhaConfigurada) {
      console.error('[Admin] ADMIN_PASSWORD não configurada nas variáveis de ambiente.');
      return NextResponse.json({ error: 'Painel admin não configurado no servidor.' }, { status: 500 });
    }
    const body = await req.json();
    if ((body.senha ?? '') !== senhaConfigurada) {
      return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 });
    }
    await criarSessaoAdmin();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Admin] erro no login:', err);
    return NextResponse.json({ error: 'Erro ao entrar.' }, { status: 500 });
  }
}
