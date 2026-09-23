'use client';

import { useState } from 'react';
import Link from 'next/link';
import { upload } from '@vercel/blob/client';
import { exportarWord } from '@/lib/exportarWord';
import { comprimirImagem } from '@/lib/comprimirImagem';

// Limite de segurança por arquivo (a Anthropic recusa a requisição inteira
// se passar de ~32MB somando tudo, então travamos bem antes disso).
const LIMITE_ARQUIVO_MB = 15;

type Anexo = { tipo: 'pdf' | 'imagem'; mediaType: string; url: string; nome: string };
type Mensagem = { papel: 'user' | 'assistant'; conteudo: string };

export default function QualiFlashPage() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState('');
  const [tituloManual, setTituloManual] = useState('');
  const [nomeProjeto, setNomeProjeto] = useState('');
  const [conferente, setConferente] = useState('');
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
      for (const fileOriginal of Array.from(files)) {
        // Fotos tiradas direto do celular costumam vir grandes — reduzimos
        // antes de enviar, o que evita a maioria dos erros de "arquivo
        // grande demais" na hora de extrair os dados.
        const file = await comprimirImagem(fileOriginal);

        if (file.size > LIMITE_ARQUIVO_MB * 1024 * 1024) {
          setErro(
            `O arquivo "${file.name}" tem ${(file.size / 1024 / 1024).toFixed(1)}MB — reduza a qualidade/tamanho (ou divida um PDF muito grande em partes) e tente novamente.`
          );
          continue;
        }

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
          anexos: anexosEnviados.map(({ tipo, mediaType, url, nome }) => ({ tipo, mediaType, url, nome })),
          atendimentoId: atendimentoId ?? undefined,
          tituloManual: tituloManual.trim() || undefined,
          nomeProjeto: nomeProjeto.trim() || undefined,
          conferente: conferente.trim() || undefined,
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

      <div className="grid sm:grid-cols-2 gap-3 mt-3">
        <input
          type="text"
          value={tituloManual}
          onChange={(e) => setTituloManual(e.target.value)}
          placeholder="Nome do atendimento (opcional) — deixe em branco para sugestão automática"
          className="w-full border border-ink-200 rounded-sm p-2 text-sm"
        />
        <input
          type="text"
          value={nomeProjeto}
          onChange={(e) => setNomeProjeto(e.target.value)}
          placeholder="Nome do projeto (opcional)"
          className="w-full border border-ink-200 rounded-sm p-2 text-sm"
        />
      </div>
      <input
        type="text"
        value={conferente}
        onChange={(e) => setConferente(e.target.value)}
        placeholder="Conferente do projeto (opcional)"
        className="w-full border border-ink-200 rounded-sm p-2 text-sm mt-3"
      />

      <section className="mt-6 flex-1 flex flex-col gap-3 min-h-[300px]">
        {mensagens.map((m, i) => (
          <div key={i} className={m.papel === 'user' ? 'self-end' : 'self-start'}>
            <div
              className={`max-w-[85%] rounded-sm p-3 text-sm whitespace-pre-wrap ${
                m.papel === 'user'
                  ? 'bg-ink-800 text-paper-soft'
                  : 'bg-paper-soft border border-ink-200 text-ink-800'
              }`}
            >
              {m.conteudo}
            </div>
            {m.papel === 'assistant' && (
              <button
                onClick={() => exportarWord('Qualificação pessoal', m.conteudo)}
                className="text-xs text-brass-dark hover:underline mt-1"
              >
                Exportar Word
              </button>
            )}
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
          onClick={() => { setMensagens([]); setAtendimentoId(null); setTituloManual(''); setNomeProjeto(''); setConferente(''); }}
          className="mt-4 text-xs text-ink-400 hover:text-wax self-start"
        >
          Encerrar e apagar esta conversa
        </button>
      )}
    </main>
  );
}
