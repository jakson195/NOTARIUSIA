// Chama a rota de exportação e dispara o download do .docx no navegador.
export async function exportarWord(titulo: string, conteudo: string) {
  const resp = await fetch('/api/export/word', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo, conteudo }),
  });

  if (!resp.ok) {
    throw new Error('Erro ao gerar o Word.');
  }

  const blob = await resp.blob();
  const url = URL.createObjectURL(blob);
  const nomeArquivo = `${titulo.replace(/[^\p{L}\p{N} ]/gu, '').trim() || 'atendimento'}.docx`;

  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
