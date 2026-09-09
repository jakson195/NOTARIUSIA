import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NotariusIA',
  description: 'Assistentes de IA para tabelionatos — extração e qualificação de documentos.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
