import { useMemo, useState } from "react";
import { ChartCard } from "../components/charts/ChartCard";
import { BarrasV } from "../components/charts/Charts";
import { COR } from "../components/charts/palette";
import { KpiCard } from "../components/kpi/KpiCard";
import { fluxo } from "../data/loadData";
import { lifetimeMedioPorCoorte, metricasLtv } from "../lib/agg/ltv";
import { fmtMes, fmtNum, fmtPct } from "../lib/format";
import type { VisaoCoorte } from "../types/dashboard";
import { useFilteredRows } from "../state/useFilteredRows";
import { CoorteRetencaoHeatmap } from "./CoorteRetencaoHeatmap";
import { ScreenHeader } from "./ScreenHeader";

const VISOES_COORTE: { id: VisaoCoorte; label: string; descricao: string }[] = [
  {
    id: "pagantes",
    label: "Pagantes",
    descricao:
      "Cada linha parte de todos os clientes pagantes presentes naquele mês; a célula mostra o % dessa base que permanece presente N meses depois. As coortes se sobrepõem (base ativa).",
  },
  {
    id: "entrantes",
    label: "Entrantes",
    descricao:
      "Cada linha é a safra de clientes que apareceram pela 1ª vez naquele mês (grupos exclusivos); a célula mostra o % dessa safra que permanece N meses depois.",
  },
];

export function LtvEvolucao() {
  const rows = useFilteredRows();
  const [visaoCoorte, setVisaoCoorte] = useState<VisaoCoorte>("pagantes");
  const m = useMemo(() => metricasLtv(rows), [rows]);
  const coorte = useMemo(
    () =>
      lifetimeMedioPorCoorte(rows).map((d) => ({
        mes: fmtMes(d.mes),
        lifetimeMedio: Math.round(d.lifetimeMedio),
      })),
    [rows],
  );

  return (
    <div>
      <ScreenHeader
        titulo="LTV e Evolução"
        subtitulo="Crescimento real da base e maturidade. Quantos clientes chegam aos 6 meses, quando o ticket amadurece."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="LifeTime médio (base)"
          valor={`${fmtNum(Math.round(m.lifetimeMedioBase))} dias`}
          sub="ativos + cancelados"
        />
        <KpiCard
          label="LifeTime médio (cancelados)"
          valor={`${fmtNum(Math.round(m.lifetimeMedioChurn))} dias`}
          sub="tempo de vida até o churn"
        />
        <KpiCard
          label="Atingiram maturidade (6m)"
          valor={fmtPct(m.pctMaturidade)}
          sub={`${fmtNum(m.maduros)} clientes com 180+ dias`}
          tom="success"
        />
        <KpiCard
          label="Churn antes da maturidade"
          valor={fmtPct(m.pctChurnImaturo)}
          sub="dos cancelados saíram em <6 meses"
          tom="warning"
        />
      </div>

      <div className="mb-4">
        <ChartCard
          titulo="Retenção por coorte"
          descricao={`${VISOES_COORTE.find((v) => v.id === visaoCoorte)!.descricao} Desde jan/2026 (o servers-list começa em dez/2025).`}
          acao={
            <div className="flex gap-1 rounded-sm bg-neutral-100 p-1">
              {VISOES_COORTE.map((v) => {
                const ativo = visaoCoorte === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setVisaoCoorte(v.id)}
                    className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
                      ativo
                        ? "bg-primary-900 text-white shadow-sm"
                        : "text-neutral-600 hover:bg-neutral-200"
                    }`}
                    aria-pressed={ativo}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          }
        >
          <CoorteRetencaoHeatmap dados={fluxo.coorte[visaoCoorte]} />
        </ChartCard>
      </div>

      <ChartCard
        titulo="LifeTime médio dos cancelados por coorte de saída"
        descricao="Tempo médio de vida dos clientes que cancelaram em cada mês"
      >
        <BarrasV
          data={coorte}
          xKey="mes"
          barKey="lifetimeMedio"
          cor={COR.primary}
          fmt={(v) => `${fmtNum(v)}d`}
        />
      </ChartCard>
    </div>
  );
}
