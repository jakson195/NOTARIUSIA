'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { upload } from '@vercel/blob/client';
import { exportarWord } from '@/lib/exportarWord';

type Mensagem = { id: string; papel: string; conteudo: string; createdAt: string };
type Atendimento = {
  id: string;
  titulo: string;
  agente: 'URBANO' | 'RURAL' | 'QUALIFLASH';
  createdAt: string;
  mensagens: Mensagem[];
};
type Anexo = { tipo: 'pdf' | 'imagem'; mediaType: string; url: string; nome: string };

const ROTULO_AGENTE: Record<Atendimento['agente'], string> = {
  URBANO: 'NotariusIA-Urbano',
  RURAL: 'NotariusIA-Rural',
  QUALIFLASH: 'QualiFlash',
};

const ENDPOINT_AGENTE: Record<Atendimento['agente'], string> = {
  URBANO: '/api/agents/urbano',
  RURAL: '/api/agents/rural',
  QUALIFLASH: '/api/agents/qualiflash',
};

export default function HistoricoDetalhePage() {
  const params = useParams();
  const id = params.id as string;

  const [atendimento, setAtendimento] = useState<Atendimento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [textoNovo, setTextoNovo] = useState('');
  const [enviandoArquivo, setEnviandoArquivo] = useState(false);
  const [atualizando, setAtualizando] = useState(false);

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      const resp = await fetch(`/api/atendimentos/${id}`);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Erro ao carregar.');
      setAtendimento(data.atendimento);
      setNovoTitulo(data.atendimento.titulo);
    } catch (e: any) {
      setErro(e.message ?? 'Erro inesperado.');
    } finally {
      setCarregando(false);
    }
  }

  async function salvarTitulo() {
    if (!novoTitulo.trim()) return;
    setSalvando(true);
    try {
      const resp = await fetch(`/api/atendimentos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: novoTitulo.trim() }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Erro ao renomear.');
      setAtendimento((atual) => (atual ? { ...atual, titulo: data.atendimento.titulo } : atual));
      setEditandoTitulo(false);
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao renomear.');
    } finally {
      setSalvando(false);
    }
  }

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

  async function continuarExtracao() {
    if (!atendimento) return;
    setAtualizando(true);
    setErro(null);
    try {
      const ultimoResultado = [...atendimento.mensagens]
        .reverse()
        .find((m) => m.papel === 'assistant')?.conteudo;

      const resp = await fetch(ENDPOINT_AGENTE[atendimento.agente], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto: textoNovo,
          anexos: anexos.map(({ tipo, mediaType, url }) => ({ tipo, mediaType, url })),
          respostaAnterior: ultimoResultado,
          atendimentoId: atendimento.id,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Erro ao processar.');
      setAnexos([]);
      setTextoNovo('');
      await carregar();
    } catch (e: any) {
      setErro(e.message ?? 'Erro inesperado.');
    } finally {
      setAtualizando(false);
    }
  }

  async function continuarChat() {
    if (!atendimento) return;
    if (!textoNovo && anexos.length === 0) return;
    setAtualizando(true);
    setErro(null);
    try {
      const historico = atendimento.mensagens.map((m) => ({
        papel: m.papel as 'user' | 'assistant',
        conteudo: m.conteudo,
      }));

      const resp = await fetch(ENDPOINT_AGENTE.QUALIFLASH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          historico,
          texto: textoNovo,
          anexos: anexos.map(({ tipo, mediaType, url }) => ({ tipo, mediaType, url })),
          atendimentoId: atendimento.id,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Erro ao processar.');
      setAnexos([]);
      setTextoNovo('');
      await carregar();
    } catch (e: any) {
      setErro(e.message ?? 'Erro inesperado.');
    } finally {
      setAtualizando(false);
    }
  }

  if (carregando) {
    return <main className="px-6 py-10 max-w-3xl mx-auto text-sm text-ink-400">Carregando…</main>;
  }

  if (erro && !atendimento) {
    return <main className="px-6 py-10 max-w-3xl mx-auto text-sm text-wax">{erro}</main>;
  }

  if (!atendimento) {
    return (
      <main className="px-6 py-10 max-w-3xl mx-auto text-sm text-wax">
        Atendimento não encontrado.
      </main>
    );
  }

  const ehQualiFlash = atendimento.agente === 'QUALIFLASH';

  return (
    <main className="px-6 py-10 max-w-3xl mx-auto">
      <Link href="/dashboard" className="text-sm text-ink-400 hover:text-ink-600">
        ← Painel
      </Link>
      <div className="mt-2">
        <span className="text-brass-dark font-sans text-xs tracking-wide">
          {ROTULO_AGENTE[atendimento.agente]}
        </span>
      </div>

      {editandoTitulo ? (
        <div className="flex items-center gap-2 mt-1">
          <input
            value={novoTitulo}
            onChange={(e) => setNovoTitulo(e.target.value)}
            className="font-serif text-2xl text-ink-800 border-b border-ink-300 outline-none flex-1 bg-transparent"
            autoFocus
          />
          <button
            onClick={salvarTitulo}
            disabled={salvando}
            className="text-sm bg-ink-800 text-paper-soft px-3 py-1 rounded-sm"
          >
            Salvar
          </button>
          <button
            onClick={() => {
              setEditandoTitulo(false);
              setNovoTitulo(atendimento.titulo);
            }}
            className="text-sm text-ink-400"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <h1
          className="font-serif text-2xl text-ink-800 mt-1 cursor-pointer hover:underline decoration-dashed"
          onClick={() => setEditandoTitulo(true)}
          title="Clique para renomear"
        >
          {atendimento.titulo}
        </h1>
      )}

      <p className="text-xs text-ink-400 mt-1">
        {new Date(atendimento.createdAt).toLocaleString('pt-BR')}
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {atendimento.mensagens.map((m) => (
          <div key={m.id}>
            <p className="text-xs font-medium text-ink-500 mb-1">
              {m.papel === 'user' ? 'Entrada' : 'Resultado'}
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-paper-soft border border-ink-200 rounded-sm p-4 font-sans">
              {m.conteudo}
            </pre>
            {m.papel === 'assistant' && (
              <button
                onClick={() => exportarWord(atendimento.titulo, m.conteudo)}
                className="text-xs text-brass-dark hover:underline mt-1"
              >
                Exportar Word
              </button>
            )}
          </div>
        ))}
      </div>

      <section className="mt-8 border border-ink-200 bg-paper-soft rounded-sm p-5">
        <h2 className="font-serif text-lg text-ink-800 mb-1">
          {ehQualiFlash ? 'Continuar a conversa' : 'Anexar novos documentos'}
        </h2>
        <p className="text-xs text-ink-500 mb-3">
          {ehQualiFlash
            ? 'Envie mais informações ou documentos para completar a qualificação.'
            : 'Quando o cliente voltar com o que faltava, anexe aqui — o resultado é atualizado neste mesmo atendimento, sem perder o que já foi extraído.'}
        </p>

        <label className="block text-sm font-medium text-ink-700 mb-2">
          Documentos (PDF ou imagem)
        </label>
        <input
          type="file"
          multiple
          accept="application/pdf,image/*"
          onChange={(e) => handleArquivos(e.target.files)}
          className="text-sm"
          disabled={enviandoArquivo}
        />
        {enviandoArquivo && <p className="mt-2 text-xs text-ink-400">Enviando arquivo…</p>}
        {anexos.length > 0 && (
          <ul className="mt-3 text-sm text-ink-500 list-disc list-inside">
            {anexos.map((a, i) => (
              <li key={i}>{a.nome}</li>
            ))}
          </ul>
        )}

        <textarea
          value={textoNovo}
          onChange={(e) => setTextoNovo(e.target.value)}
          rows={ehQualiFlash ? 2 : 3}
          className="w-full border border-ink-200 rounded-sm p-2 text-sm mt-3"
          placeholder={
            ehQualiFlash ? 'Escreva uma mensagem…' : 'Observações / texto colado (opcional)'
          }
        />

        <button
          onClick={ehQualiFlash ? continuarChat : continuarExtracao}
          disabled={
            atualizando || enviandoArquivo || (anexos.length === 0 && !textoNovo)
          }
          className="mt-3 bg-ink-800 text-paper-soft px-5 py-2 rounded-sm text-sm hover:bg-ink-700 disabled:opacity-50"
        >
          {atualizando ? 'Processando…' : ehQualiFlash ? 'Enviar' : 'Atualizar resultado'}
        </button>

        {erro && <p className="mt-3 text-sm text-wax">{erro}</p>}
      </section>
    </main>
  );
}