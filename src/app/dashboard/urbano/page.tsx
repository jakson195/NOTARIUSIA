'use client';

import { useState } from 'react';
import Link from 'next/link';
import { upload } from '@vercel/blob/client';

type Anexo = { tipo: 'pdf' | 'imagem'; mediaType: string; url: string; nome: string };

export default function UrbanoPage() {
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [texto, setTexto] = useState('');
  const [tituloManual, setTituloManual] = useState('');
  const [enviandoArquivo, setEnviandoArquivo] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
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

  async function processar() {
    setCarregando(true);
    setErro(null);
    try {
      const resp = await fetch('/api/agents/urbano', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto,
          anexos: anexos.map(({ tipo, mediaType, url, nome }) => ({ tipo, mediaType, url, nome })),
          respostaAnterior: resultado ?? undefined,
          atendimentoId: atendimentoId ?? undefined,
          tituloManual: tituloManual.trim() || undefined,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Erro ao processar.');
      setResultado(data.resultado);
      setAtendimentoId(data.atendimentoId ?? atendimentoId);
      setAnexos([]);
      setTexto('');
    } catch (e: any) {
      setErro(e.message ?? 'Erro inesperado.');
    } finally {
      setCarregando(false);
    }
  }

  const { lista, pendencias } = separarPendencias(resultado);

  return (
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <Link href="/dashboard" className="text-sm text-ink-400 hover:text-ink-600">
        ← Painel
      </Link>
      <h1 className="font-serif text-3xl text-ink-800 mt-2">NotariusIA-Urbano</h1>
      <p className="text-ink-500 text-sm mt-1">
        Envie os documentos do atendimento. Pode mandar aos poucos — cada novo envio atualiza o
        resultado anterior.
      </p>

      <section className="mt-6 border border-ink-200 bg-paper-soft rounded-sm p-5">
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Nome do atendimento (opcional)
        </label>
        <input
          type="text"
          value={tituloManual}
          onChange={(e) => setTituloManual(e.target.value)}
          placeholder="Ex: Silva x Pereira — deixe em branco para sugestão automática"
          className="w-full border border-ink-200 rounded-sm p-2 text-sm mb-4"
        />

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

        <label className="block text-sm font-medium text-ink-700 mt-4 mb-2">
          Observações / texto colado (opcional)
        </label>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={4}
          className="w-full border border-ink-200 rounded-sm p-2 text-sm"
          placeholder="Cole aqui algum dado adicional, se necessário."
        />

        <button
          onClick={processar}
          disabled={carregando || enviandoArquivo || (anexos.length === 0 && !texto)}
          className="mt-4 bg-ink-800 text-paper-soft px-5 py-2 rounded-sm text-sm hover:bg-ink-700 disabled:opacity-50"
        >
          {carregando ? 'Processando…' : resultado ? 'Enviar novos documentos' : 'Extrair dados'}
        </button>

        {erro && <p className="mt-3 text-sm text-wax">{erro}</p>}
      </section>

      {resultado && (
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-ink-800">Resultado</h2>
            <button
              onClick={() => navigator.clipboard.writeText(lista)}
              className="text-sm text-brass-dark hover:underline"
            >
              Copiar lista
            </button>
          </div>
          <pre className="mt-2 whitespace-pre-wrap text-sm bg-paper-soft border border-ink-200 rounded-sm p-4 font-sans">
            {lista}
          </pre>

          {pendencias && (
            <div className="mt-4">
              <h3 className="font-serif text-lg text-wax">Pendências para conferência</h3>
              <pre className="mt-2 whitespace-pre-wrap text-sm bg-wax/5 border border-wax/30 rounded-sm p-4 font-sans">
                {pendencias}
              </pre>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

function separarPendencias(resultado: string | null): { lista: string; pendencias: string | null } {
  if (!resultado) return { lista: '', pendencias: null };
  const marcador = 'PENDÊNCIAS PARA CONFERÊNCIA';
  const idx = resultado.indexOf(marcador);
  if (idx === -1) return { lista: resultado, pendencias: null };
  return {
    lista: resultado.slice(0, idx).trim(),
    pendencias: resultado.slice(idx + marcador.length).trim(),
  };
}
