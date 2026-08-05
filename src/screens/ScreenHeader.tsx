interface Props {
  titulo: string;
  subtitulo: string;
}

export function ScreenHeader({ titulo, subtitulo }: Props) {
  return (
    <div className="mb-6">
      <h2 className="font-title text-2xl font-bold text-neutral-950">
        {titulo}
      </h2>
      <p className="mt-1 text-sm text-neutral-500">{subtitulo}</p>
    </div>
  );
}
