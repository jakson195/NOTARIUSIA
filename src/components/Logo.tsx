export default function Logo({ tamanho = 32 }: { tamanho?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.jpg"
      alt="Agrimensura Descomplicada"
      width={tamanho}
      height={tamanho}
      className="rounded-sm object-cover shrink-0"
      style={{ width: tamanho, height: tamanho }}
    />
  );
}
