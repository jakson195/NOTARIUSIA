import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

// Gera o token para o navegador subir o arquivo DIRETO pro Vercel Blob,
// sem passar pelo corpo da nossa função serverless — isso contorna o
// limite de ~4.5MB por requisição das functions da Vercel, importante
// porque PDFs de matrícula/scans de cartório costumam passar disso.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            'application/pdf',
            'image/png',
            'image/jpeg',
            'image/webp',
            'image/gif',
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB — margem confortável para scans
        };
      },
      onUploadCompleted: async () => {
        // Nada a persistir aqui por enquanto. Quando a autenticação real
        // estiver pronta, este é o lugar para registrar o arquivo associado
        // ao tabelionato/atendimento no banco, se quisermos manter histórico.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
