import { CONTATO_EMAIL, CONTATO_TELEFONE, CONTATO_WHATSAPP_URL } from '@/lib/contato';

export default function ContatoLinha({ className = '' }: { className?: string }) {
  return (
    <p className={className}>
      Contato:{' '}
      <a href={`mailto:${CONTATO_EMAIL}`} className="underline">{CONTATO_EMAIL}</a>
      {' · '}
      <a href={CONTATO_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="underline">
        {CONTATO_TELEFONE} (WhatsApp)
      </a>
    </p>
  );
}
