import { NextResponse } from 'next/server';
import { limparSessaoAdmin } from '@/lib/adminAuth';

export async function POST() {
  await limparSessaoAdmin();
  return NextResponse.json({ ok: true });
}
