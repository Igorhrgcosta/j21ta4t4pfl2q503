import { useMemo } from "react";
import { ChartCard } from "../components/charts/ChartCard";
import { ComboBarraLinha } from "../components/charts/Charts";
import { KpiCard } from "../components/kpi/KpiCard";
import { churnPorFaixaLifetime } from "../lib/agg/lifetime";
import { fmtNum, fmtPct } from "../lib/format";
import { useFilteredRows } from "../state/useFilteredRows";
import { ScreenHeader } from "./ScreenHeader";

export function ChurnTempoVida() {
  const rows = useFilteredRows();
  const faixas = useMemo(() => churnPorFaixaLifetime(rows), [rows]);

  const totalChurn = faixas.reduce((a, f) => a + f.qtd, 0);
  // % que sai até 120 dias (antes do payback)
  const ate120 = faixas
    .filter((f) => ["0-30", "31-60", "61-90", "91-120"].includes(f.faixa))
    .reduce((a, f) => a + f.qtd, 0);
  const pctAte120 = totalChurn ? (100 * ate120) / totalChurn : 0;

  return (
    <div>
      <ScreenHeader
        titulo="Churn por Tempo de Vida"
        subtitulo="Onde o churn se concentra no ciclo de vida do cliente. Grande parte ocorre antes do payback (120 dias)."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Cancelados (total)"
          valor={fmtNum(totalChurn)}
          sub="no recorte atual"
        />
        <KpiCard
          label="Churn até 120 dias"
          valor={fmtPct(pctAte120)}
          sub={`${fmtNum(ate120)} clientes antes do payback`}
          tom="danger"
        />
        <KpiCard
          label="Concentração tardia"
          valor={fmtPct(
            totalChurn
              ? (100 * (faixas.find((f) => f.faixa === "180+")?.qtd ?? 0)) /
                  totalChurn
              : 0,
          )}
          sub="clientes maduros (180+ dias)"
        />
      </div>

      <ChartCard
        titulo="Distribuição de cancelamentos por faixa de tempo de vida"
        descricao="Barras: nº de cancelamentos · Linha: % acumulado do churn"
      >
        <ComboBarraLinha
          data={faixas.map((f) => ({
            faixa: f.faixa,
            qtd: f.qtd,
            pctAcumulado: Number(f.pctAcumulado.toFixed(1)),
          }))}
          xKey="faixa"
          barKey="qtd"
          lineKey="pctAcumulado"
          altura={380}
        />
      </ChartCard>
    </div>
  );
}
