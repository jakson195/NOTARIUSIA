import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Grava um acesso (login ou cadastro). Nunca lança erro: falha aqui não
// pode impedir a pessoa de entrar.
export async function registrarLogin(
  req: NextRequest,
  usuario: { id: string; tabelionatoId: string },
  origem: 'LOGIN' | 'CADASTRO' = 'LOGIN'
) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      null;
    const userAgent = req.headers.get('user-agent')?.slice(0, 300) || null;
    await prisma.loginLog.create({
      data: { usuarioId: usuario.id, tabelionatoId: usuario.tabelionatoId, origem, ip, userAgent },
    });
  } catch (err) {
    console.error('[LoginLog] erro ao registrar acesso (não bloqueia o login):', err);
  }
}
