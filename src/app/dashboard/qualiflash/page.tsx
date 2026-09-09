'use client';

import { useState } from 'react';
import Link from 'next/link';
import { upload } from '@vercel/blob/client';

type Anexo = { tipo: 'pdf' | 'imagem'; mediaType: string; url: string; nome: string };
type Mensagem = { papel: 'user' | 'assistant'; conteudo: string };

export default function QualiFlashPage() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState('');
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [enviandoArquivo, setEnviandoArquivo] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [atendimentoId, setAtendimentoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function handleArquivos(files: FileList | null) {
    if (!files) return;
    setEnviandoArquivo(true);
    setErro(null);
    try {
      const novos: Anexo[] = [];
      for (const file of Array.from(files)) {
        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        });
        novos.push({
          tipo: file.type === 'application/pdf' ? 'pdf' : 'imagem',
          mediaType: file.type,
          url: blob.url,
          nome: file.name,
        });
      }
      setAnexos((atuais) => [...atuais, ...novos]);
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao enviar arquivo.');
    } finally {
      setEnviandoArquivo(false);
    }
  }

  async function enviar() {
    if (!texto && anexos.length === 0) return;
    setErro(null);
    setCarregando(true);

    const mensagemUsuario: Mensagem = {
      papel: 'user',
      conteudo: texto || `[${anexos.length} documento(s) anexado(s)]`,
    };
    const historicoAtual = [...mensagens, mensagemUsuario];
    setMensagens(historicoAtual);
    const textoEnviado = texto;
    const anexosEnviados = anexos;
    setTexto('');
    setAnexos([]);

    try {
      const resp = await fetch('/api/agents/qualiflash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          historico: mensagens,
          texto: textoEnviado,
          anexos: anexosEnviados.map(({ tipo, mediaType, url }) => ({ tipo, mediaType, url })),
          atendimentoId: atendimentoId ?? undefined,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Erro ao processar.');
      setMensagens([...historicoAtual, { papel: 'assistant', conteudo: data.resposta }]);
      setAtendimentoId(data.atendimentoId ?? atendimentoId);
    } catch (e: any) {
      setErro(e.message ?? 'Erro inesperado.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto flex flex-col">
      <Link href="/dashboard" className="text-sm text-ink-400 hover:text-ink-600">
        ← Painel
      </Link>
      <h1 className="font-serif text-3xl text-ink-800 mt-2">QualiFlash</h1>
      <p className="text-ink-500 text-sm mt-1">
        Envie os documentos da pessoa. Se faltar algum dado, o assistente pergunta antes de fechar
        a qualificação.
      </p>
      <p className="mt-2 text-xs text-wax">
        ⚠️ Este agente lida com dados pessoais. Ao terminar, use "Encerrar e apagar" para remover o
        histórico da conversa.
      </p>

      <section className="mt-6 flex-1 flex flex-col gap-3 min-h-[300px]">
        {mensagens.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-sm p-3 text-sm whitespace-pre-wrap ${
              m.papel === 'user'
                ? 'self-end bg-ink-800 text-paper-soft'
                : 'self-start bg-paper-soft border border-ink-200 text-ink-800'
            }`}
          >
            {m.conteudo}
          </div>
        ))}
        {carregando && <p className="text-sm text-ink-400">Analisando…</p>}
      </section>

      {enviandoArquivo && <p className="text-xs text-ink-400 mb-1">Enviando arquivo…</p>}
      {anexos.length > 0 && (
        <ul className="text-xs text-ink-500 list-disc list-inside mb-2">
          {anexos.map((a, i) => (
            <li key={i}>{a.nome}</li>
          ))}
        </ul>
      )}

      <div className="border border-ink-200 bg-paper-soft rounded-sm p-3 flex flex-col gap-2">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={2}
          placeholder="Escreva uma mensagem ou anexe documentos abaixo…"
          className="w-full text-sm border-none outline-none resize-none bg-transparent"
        />
        <div className="flex items-center justify-between">
          <input
            type="file"
            multiple
            accept="application/pdf,image/*"
            onChange={(e) => handleArquivos(e.target.files)}
            className="text-xs"
            disabled={enviandoArquivo}
          />
          <button
            onClick={enviar}
            disabled={carregando || enviandoArquivo || (!texto && anexos.length === 0)}
            className="bg-ink-800 text-paper-soft px-4 py-1.5 rounded-sm text-sm hover:bg-ink-700 disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </div>

      {erro && <p className="mt-3 text-sm text-wax">{erro}</p>}

      {mensagens.length > 0 && (
        <button
          onClick={() => { setMensagens([]); setAtendimentoId(null); }}
          className="mt-4 text-xs text-ink-400 hover:text-wax self-start"
        >
          Encerrar e apagar esta conversa
        </button>
      )}
    </main>
  );
}
