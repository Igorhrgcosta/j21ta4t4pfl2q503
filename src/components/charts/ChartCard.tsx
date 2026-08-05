import { Box, Heading, Paragraph } from "@ikatec/nebula-react";
import type { PropsWithChildren, ReactNode } from "react";

interface Props {
  titulo: string;
  descricao?: string;
  className?: string;
  /** conteúdo opcional alinhado à direita do título (ex.: filtro do gráfico). */
  acao?: ReactNode;
}

export function ChartCard({
  titulo,
  descricao,
  className = "",
  acao,
  children,
}: PropsWithChildren<Props>) {
  return (
    <Box
      border
      paddingSize="lg"
      shadow="sm"
      className={`rounded-md bg-white ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <Heading level="4" className="text-neutral-950">
            {titulo}
          </Heading>
          {descricao && (
            <Paragraph size="sm" className="mt-1 text-neutral-500">
              {descricao}
            </Paragraph>
          )}
        </div>
        {acao && <div className="shrink-0">{acao}</div>}
      </div>
      {children}
    </Box>
  );
}
