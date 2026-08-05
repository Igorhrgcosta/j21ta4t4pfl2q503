import { useMemo } from "react";
import { ChartCard } from "../components/charts/ChartCard";
import { BarrasH } from "../components/charts/Charts";
import { COR } from "../components/charts/palette";
import { dicts } from "../data/loadData";
import {
  churnPorOrigem,
  churnPorSegmento,
  churnPorVendedor,
} from "../lib/agg/origem";
import { fmtNum, fmtPct } from "../lib/format";
import { useFilteredRows } from "../state/useFilteredRows";
import { ScreenHeader } from "./ScreenHeader";

export function OrigemChurn() {
  const rows = useFilteredRows();
  const porVendedor = useMemo(() => churnPorVendedor(rows, dicts), [rows]);
  const porOrigem = useMemo(() => churnPorOrigem(rows, dicts), [rows]);
  const porSegmento = useMemo(() => churnPorSegmento(rows, dicts), [rows]);

  // Origem com maior % de churn precoce (mín. 10 cancelamentos)
  const precocePorOrigem = useMemo(
    () =>
      [...porOrigem]
        .filter((o) => o.churned >= 10)
        .sort((a, b) => b.pctPrecoce - a.pctPrecoce)
        .slice(0, 12),
    [porOrigem],
  );

  return (
    <div>
      <ScreenHeader
        titulo="Origem do Churn"
        subtitulo="Onde o churn nasce — por vendedor, canal de aquisição e segmento. Identifica desalinhamentos na entrada."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          titulo="Cancelamentos por vendedor"
          descricao="Top 12 por volume de churn"
        >
          <BarrasH
            data={porVendedor.map((v) => ({ nome: v.nome, churned: v.churned }))}
            yKey="nome"
            barKey="churned"
            fmt={fmtNum}
          />
        </ChartCard>

        <ChartCard
          titulo="Cancelamentos por canal (origem)"
          descricao="Top 12 canais de aquisição"
        >
          <BarrasH
            data={porOrigem.map((o) => ({ nome: o.nome, churned: o.churned }))}
            yKey="nome"
            barKey="churned"
            fmt={fmtNum}
          />
        </ChartCard>

        <ChartCard
          titulo="Churn precoce por canal"
          descricao="% de cancelados em ≤90 dias (canais com ≥10 cancelamentos)"
        >
          <BarrasH
            data={precocePorOrigem.map((o) => ({
              nome: o.nome,
              pctPrecoce: Number(o.pctPrecoce.toFixed(1)),
            }))}
            yKey="nome"
            barKey="pctPrecoce"
            cor={COR.warning}
            fmt={(v) => fmtPct(v, 0)}
          />
        </ChartCard>

        <ChartCard
          titulo="Cancelamentos por segmento"
          descricao="Top 12 segmentos"
        >
          <BarrasH
            data={porSegmento.map((s) => ({ nome: s.nome, churned: s.churned }))}
            yKey="nome"
            barKey="churned"
            cor={COR.neutralDark}
            fmt={fmtNum}
          />
        </ChartCard>
      </div>
    </div>
  );
}
