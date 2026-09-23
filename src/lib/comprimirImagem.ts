// Reduz o tamanho de fotos antes do envio, para evitar o erro 413
// ("Request exceeds the maximum size") da API da Anthropic quando o
// escrivão anexa fotos tiradas direto do celular (que hoje em dia
// costumam vir com vários MB de resolução).
//
// Só mexe em imagens (PDF não é tocado aqui — PDF grande demais precisa
// ser reduzido/dividido pelo próprio usuário, avisamos na tela).
// Se o arquivo já é pequeno, ou se por algum motivo a compressão falhar
// ou não ajudar, devolve o arquivo original sem risco de quebrar o envio.
export async function comprimirImagem(
  file: File,
  maxDimensao = 2000,
  qualidade = 0.82
): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  // Abaixo de ~1.5MB não vale a pena comprimir — evita perda de
  // qualidade desnecessária em fotos que já são pequenas.
  const LIMITE_PARA_COMPRIMIR = 1.5 * 1024 * 1024;
  if (file.size < LIMITE_PARA_COMPRIMIR) return file;

  try {
    const bitmap = await createImageBitmap(file);
    let largura = bitmap.width;
    let altura = bitmap.height;

    if (largura > maxDimensao || altura > maxDimensao) {
      const escala = maxDimensao / Math.max(largura, altura);
      largura = Math.round(largura * escala);
      altura = Math.round(altura * escala);
    }

    const canvas = document.createElement('canvas');
    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, largura, altura);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', qualidade)
    );
    if (!blob) return file;

    // Se a compressão não ajudou (raro, mas pode acontecer com imagens
    // já bem otimizadas), mantém o original.
    if (blob.size >= file.size) return file;

    const nomeComprimido = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], nomeComprimido, { type: 'image/jpeg' });
  } catch {
    // Se algo der errado na compressão (navegador sem suporte, etc.),
    // segue com o arquivo original em vez de travar o envio.
    return file;
  }
}
