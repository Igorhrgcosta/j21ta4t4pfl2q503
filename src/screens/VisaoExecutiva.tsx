import { useMemo } from "react";
import { ChartCard } from "../components/charts/ChartCard";
import { BarrasV } from "../components/charts/Charts";
import { COR } from "../components/charts/palette";
import { InsightCallout } from "../components/insights/InsightCallout";
import { KpiCard } from "../components/kpi/KpiCard";
import { dicts, fluxo } from "../data/loadData";
import { churnMensalMedioFiltrado } from "../lib/agg/fluxo";
import { calcularKpis, churnPorMes, gerarInsights } from "../lib/agg/kpis";
import { fmtBRL, fmtBRLCompact, fmtMes, fmtNum, fmtPct } from "../lib/format";
import { useFilters } from "../state/filtersStore";
import { useFilteredRows } from "../state/useFilteredRows";
import { ScreenHeader } from "./ScreenHeader";

export function VisaoExecutiva() {
  const rows = useFilteredRows();
  const { segmentos, origens, vendedores } = useFilters();
  const kpi = useMemo(() => calcularKpis(rows), [rows]);
  const churnMedio = useMemo(
    () =>
      churnMensalMedioFiltrado(fluxo.detalhe, fluxo.base_mensal, {
        segmentos,
        origens,
        vendedores,
      }),
    [segmentos, origens, vendedores],
  );
  const insights = useMemo(() => gerarInsights(rows, dicts), [rows]);
  const serie = useMemo(
    () => churnPorMes(rows).map((d) => ({ ...d, mes: fmtMes(d.mes) })),
    [rows],
  );

  return (
    <div>
      <ScreenHeader
        titulo="Visão Executiva"
        subtitulo="Mesmo com churn aparentemente controlado, há perda significativa de valor antes do retorno do investimento."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          label="Churn comportamental (mensal médio)"
          valor={fmtPct(churnMedio)}
          sub={`${fmtPct(kpi.churnRate)} acumulado · ${fmtNum(kpi.nChurned)} de ${fmtNum(kpi.total)} clientes`}
          tom="danger"
        />
        <KpiCard
          label="Churn precoce"
          valor={fmtPct(kpi.churnPrecocePct)}
          sub="dos cancelados saíram em ≤90 dias"
          tom="warning"
        />
        <KpiCard
          label="Saíram antes do payback"
          valor={fmtPct(kpi.pctSemPayback)}
          sub="cancelaram em menos de 120 dias"
          tom="danger"
        />
        <KpiCard
          label="MRR perdido"
          valor={fmtBRL(kpi.mrrPerdido)}
          sub="receita mensal recorrente cancelada"
          tom="danger"
        />
        <KpiCard
          label="Ticket médio do churn"
          valor={fmtBRL(kpi.ticketChurn)}
          sub={`base ativa: ${fmtBRL(kpi.ticketAtivo)}`}
        />
        <KpiCard
          label="LifeTime médio (cancelados)"
          valor={`${fmtNum(Math.round(kpi.lifetimeMedioChurn))} dias`}
          sub="tempo de vida até o cancelamento"
        />
      </div>

      {insights.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
          {insights.map((ins, i) => (
            <InsightCallout key={i} insight={ins} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          titulo="Cancelamentos por mês"
          descricao="Volume de churn definitivo por mês de saída"
        >
          <BarrasV data={serie} xKey="mes" barKey="churned" cor={COR.danger} />
        </ChartCard>
        <ChartCard
          titulo="MRR perdido por mês"
          descricao="Receita recorrente cancelada a cada mês"
        >
          <BarrasV
            data={serie}
            xKey="mes"
            barKey="mrrPerdido"
            cor={COR.primary}
            fmt={fmtBRLCompact}
          />
        </ChartCard>
      </div>
    </div>
  );
}
