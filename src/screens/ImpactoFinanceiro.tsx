import { useMemo } from "react";
import { ChartCard } from "../components/charts/ChartCard";
import { BarrasV, BarrasVColorida } from "../components/charts/Charts";
import { COR } from "../components/charts/palette";
import { KpiCard } from "../components/kpi/KpiCard";
import {
  mrrGanhoVsPerdido,
  mrrPerdidoPorMes,
  mrrPorTipoChurn,
} from "../lib/agg/financeiro";
import { fmtBRL, fmtBRLCompact, fmtMes, fmtPct } from "../lib/format";
import { useFilteredRows } from "../state/useFilteredRows";
import { ScreenHeader } from "./ScreenHeader";

export function ImpactoFinanceiro() {
  const rows = useFilteredRows();
  const porMes = useMemo(
    () =>
      mrrPerdidoPorMes(rows).map((d) => ({ ...d, mes: fmtMes(d.mes) })),
    [rows],
  );
  const porTipo = useMemo(() => mrrPorTipoChurn(rows), [rows]);
  const ganhoPerdido = useMemo(() => mrrGanhoVsPerdido(rows), [rows]);

  const pctPerdido =
    ganhoPerdido.ativo + ganhoPerdido.perdido > 0
      ? (100 * ganhoPerdido.perdido) /
        (ganhoPerdido.ativo + ganhoPerdido.perdido)
      : 0;

  return (
    <div>
      <ScreenHeader
        titulo="Impacto Financeiro"
        subtitulo="O churn traduzido em dinheiro: quanto de MRR sai a cada mês e em que estágio a perda se concentra."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="MRR ativo (base)"
          valor={fmtBRL(ganhoPerdido.ativo)}
          sub="receita recorrente saudável"
          tom="success"
        />
        <KpiCard
          label="MRR perdido"
          valor={fmtBRL(ganhoPerdido.perdido)}
          sub="receita cancelada no recorte"
          tom="danger"
        />
        <KpiCard
          label="% da receita perdida"
          valor={fmtPct(pctPerdido)}
          sub="perdido ÷ (ativo + perdido)"
          tom="warning"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          titulo="MRR perdido por mês"
          descricao="Receita recorrente cancelada a cada mês de saída"
        >
          <BarrasV
            data={porMes}
            xKey="mes"
            barKey="mrr"
            cor={COR.danger}
            fmt={fmtBRLCompact}
          />
        </ChartCard>

        <ChartCard
          titulo="MRR perdido por estágio de churn"
          descricao="Precoce (≤90d) · Intermediário (91–180d) · Pós Payback (>180d)"
        >
          <BarrasVColorida
            data={porTipo}
            xKey="tipo"
            barKey="mrr"
            cores={[COR.danger, COR.warning, COR.neutral]}
            fmt={fmtBRLCompact}
          />
        </ChartCard>

        <ChartCard
          titulo="MRR ganho (ativo) vs perdido (churn)"
          descricao="Proporção da receita recorrente em risco"
        >
          <BarrasVColorida
            data={[
              { tipo: "Ativo", mrr: ganhoPerdido.ativo },
              { tipo: "Perdido", mrr: ganhoPerdido.perdido },
            ]}
            xKey="tipo"
            barKey="mrr"
            cores={[COR.success, COR.danger]}
            fmt={fmtBRLCompact}
          />
        </ChartCard>
      </div>
    </div>
  );
}
