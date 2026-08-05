import type { CoorteRetencao } from "../types/dashboard";
import { fmtMes, fmtNum } from "../lib/format";

/**
 * Heatmap triangular de retenção por coorte (modelo cohort-retention clássico).
 * Cada linha = coorte (mês da 1ª aparição); cada coluna = nº de meses desde então.
 * Cor sequencial de um hue só (azul primary): retenção é magnitude, não polaridade
 * — quanto mais escuro, maior a retenção. Texto claro em células escuras.
 */

// azul primary (#324b7d) em rgb, para modular a opacidade pela retenção
const AZUL = "50, 75, 125";

function corCelula(pct: number): { bg: string; fg: string } {
  // 0% -> quase branco; 100% -> azul cheio. piso de 0.08 p/ a célula não sumir.
  const alpha = 0.08 + 0.92 * (pct / 100);
  return {
    bg: `rgba(${AZUL}, ${alpha.toFixed(3)})`,
    fg: alpha > 0.55 ? "#ffffff" : "#1f2937",
  };
}

export function CoorteRetencaoHeatmap({ dados }: { dados: CoorteRetencao[] }) {
  if (!dados.length)
    return <p className="text-sm text-neutral-500">Sem dados de coorte.</p>;

  const maxOffset = Math.max(...dados.map((d) => d.retencao.length));
  const offsets = Array.from({ length: maxOffset }, (_, i) => i);

  return (
    <div className="overflow-x-auto">
      <table className="border-separate border-spacing-1 text-sm">
        <thead>
          <tr className="text-neutral-500">
            <th className="px-2 py-1 text-left font-semibold">Coorte</th>
            <th className="px-2 py-1 text-right font-semibold">Clientes</th>
            {offsets.map((o) => (
              <th key={o} className="px-2 py-1 text-center font-semibold">
                {o}
              </th>
            ))}
          </tr>
          <tr>
            <th />
            <th />
            <th
              colSpan={maxOffset}
              className="pb-1 text-center text-xs font-normal text-neutral-400"
            >
              meses depois
            </th>
          </tr>
        </thead>
        <tbody>
          {dados.map((linha) => (
            <tr key={linha.coorte}>
              <td className="whitespace-nowrap px-2 py-1 font-medium text-neutral-950">
                {fmtMes(linha.coorte)}
              </td>
              <td className="px-2 py-1 text-right tabular-nums text-neutral-600">
                {fmtNum(linha.n)}
              </td>
              {offsets.map((o) => {
                const pct = linha.retencao[o];
                if (pct == null)
                  return <td key={o} className="px-2 py-1" />;
                const { bg, fg } = corCelula(pct);
                return (
                  <td
                    key={o}
                    className="rounded-xs px-2 py-1 text-center tabular-nums"
                    style={{ backgroundColor: bg, color: fg }}
                    title={`${fmtMes(linha.coorte)} · mês ${o}: ${pct}% retido`}
                  >
                    {Math.round(pct)}%
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
