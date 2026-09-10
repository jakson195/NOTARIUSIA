import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

// Gera um .docx a partir do resultado de um agente (lista de campos, ou
// qualificação em texto corrido). Cada linha "CAMPO: valor" vira um
// parágrafo com o rótulo em negrito, para ficar fácil de ler e editar no
// Word antes de colar no sistema do tabelionato.
export async function gerarDocxDeResultado(titulo: string, conteudo: string): Promise<Buffer> {
  const linhas = conteudo.split('\n');

  const paragrafos: Paragraph[] = [
    new Paragraph({
      text: titulo,
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({ text: '' }),
  ];

  for (const linha of linhas) {
    if (!linha.trim()) {
      paragrafos.push(new Paragraph({ text: '' }));
      continue;
    }

    // Título de seção (ex: "PENDÊNCIAS PARA CONFERÊNCIA", "IMÓVEL 1") —
    // linhas totalmente em maiúsculas e sem ":" — ganham destaque maior.
    const pareceTituloDeSecao = linha === linha.toUpperCase() && !linha.includes(':');
    if (pareceTituloDeSecao) {
      paragrafos.push(
        new Paragraph({
          children: [new TextRun({ text: linha.trim(), bold: true })],
          spacing: { before: 200, after: 100 },
        })
      );
      continue;
    }

    // Linha "CAMPO: valor" — negrito só no rótulo.
    const separador = linha.indexOf(':');
    if (separador > -1) {
      const campo = linha.slice(0, separador + 1);
      const valor = linha.slice(separador + 1);
      paragrafos.push(
        new Paragraph({
          children: [
            new TextRun({ text: campo, bold: true }),
            new TextRun({ text: valor }),
          ],
        })
      );
    } else {
      paragrafos.push(new Paragraph({ text: linha }));
    }
  }

  const doc = new Document({
    sections: [{ children: paragrafos }],
  });

  return Packer.toBuffer(doc);
}
