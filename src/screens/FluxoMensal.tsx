import { useMemo, useState } from "react";
import { ChartCard } from "../components/charts/ChartCard";
import { BarrasAgrupadas, BarrasDivergentes } from "../components/charts/Charts";
import { COR } from "../components/charts/palette";
import { KpiCard } from "../components/kpi/KpiCard";
import { fluxo } from "../data/loadData";
import { cardsFluxo, filtrarDetalhe } from "../lib/agg/fluxo";
import { fmtData, fmtMes, fmtNum } from "../lib/format";
import { useFilters } from "../state/filtersStore";
import { useFilteredDetalhe } from "../state/useFilteredDetalhe";
import { useFilteredRows } from "../state/useFilteredRows";
import { ScreenHeader } from "./ScreenHeader";

export function FluxoMensal() {
  const [mesDetalhe, setMesDetalhe] = useState<string>("");
  const [evento, setEvento] = useState<"saiu" | "entrou">("saiu");

  const rows = useFilteredRows();
  const detalheFiltrado = useFilteredDetalhe();
  const { segmentos, origens, vendedores } = useFilters();
  const mensal = fluxo.mensal;
  const meses = mensal.map((m) => m.mes);

  // KPIs reativos aos filtros (lógica pura em lib/agg/fluxo.ts):
  //  - base   = clientes ativos (rows filtradas) — estado atual do universo
  //  - entraram/saíram = movimento de presença no servers-list (detalhe filtrado)
  //  - saldo  = entraram − saíram
  const kpi = useMemo(
    () => cardsFluxo(rows, detalheFiltrado),
    [rows, detalheFiltrado],
  );

  const barras = useMemo(
    () =>
      mensal.map((m) => ({
        mes: fmtMes(m.mes),
        entraram: m.entraram,
        sairam: m.sairam,
      })),
    [mensal],
  );
  const liquidoData = useMemo(
    () => mensal.map((m) => ({ mes: fmtMes(m.mes), liquido: m.liquido })),
    [mensal],
  );

  // tabela de detalhe: tem seu PRÓPRIO seletor de mês (dropdown), então ignora
  // o filtro global de "Mês de saída" — só herda as dimensões comerciais. O mês
  // e o evento vêm dos controles locais.
  const mesSel = mesDetalhe || meses[meses.length - 1];
  const detalhe = useMemo(() => {
    const porDimensao = filtrarDetalhe(fluxo.detalhe, {
      segmentos,
      origens,
      vendedores,
    });
    return porDimensao
      .filter((d) => d.mes === mesSel && d.evento === evento)
      .sort((a, b) => (b.data_evento ?? "").localeCompare(a.data_evento ?? ""));
  }, [segmentos, origens, vendedores, mesSel, evento]);

  return (
    <div>
      <ScreenHeader
        titulo="Fluxo Mensal de Subdomínios"
        subtitulo="Quem entrou e quem saiu do servers-list a cada mês. Cartões e detalhe reagem aos filtros de segmento/origem/vendedor; os gráficos mensais são o total global."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Base atual" valor={fmtNum(kpi.base)} sub="clientes pagantes ativos (filtrado)" />
        <KpiCard label="Entraram (total)" valor={fmtNum(kpi.entraram)} tom="success" sub="apareceram no período" />
        <KpiCard label="Saíram (total)" valor={fmtNum(kpi.sairam)} tom="danger" sub="deixaram o servers-list" />
        <KpiCard
          label="Saldo"
          valor={kpi.saldo >= 0 ? `+${fmtNum(kpi.saldo)}` : fmtNum(kpi.saldo)}
          tom={kpi.saldo >= 0 ? "success" : "danger"}
          sub="entraram − saíram"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard titulo="Entradas vs Saídas por mês" descricao="Movimento bruto de subdomínios">
          <BarrasAgrupadas
            data={barras}
            xKey="mes"
            series={[
              { key: "entraram", nome: "Entraram", cor: COR.success },
              { key: "sairam", nome: "Saíram", cor: COR.danger },
            ]}
            fmt={fmtNum}
          />
        </ChartCard>

        <ChartCard titulo="Saldo líquido por mês" descricao="Entraram − saíram · verde = ganho, vermelho = perda">
          <BarrasDivergentes
            data={liquidoData}
            xKey="mes"
            barKey="liquido"
            fmt={fmtNum}
          />
        </ChartCard>

        <ChartCard
          titulo="Detalhe: subdomínios por mês"
          descricao="Quem especificamente entrou ou saiu — para investigação"
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <select
              value={mesSel}
              onChange={(e) => setMesDetalhe(e.target.value)}
              className="rounded-sm border border-neutral-300 px-2 py-1 text-sm"
            >
              {meses.map((m) => (
                <option key={m} value={m}>
                  {fmtMes(m)}
                </option>
              ))}
            </select>
            <div className="flex overflow-hidden rounded-sm border border-neutral-300 text-sm">
              {(["saiu", "entrou"] as const).map((ev) => (
                <button
                  key={ev}
                  onClick={() => setEvento(ev)}
                  className={`px-3 py-1 ${
                    evento === ev ? "bg-primary-900 text-white" : "bg-white text-neutral-700"
                  }`}
                >
                  {ev === "saiu" ? "Saíram" : "Entraram"}
                </button>
              ))}
            </div>
            <span className="text-sm text-neutral-500">{fmtNum(detalhe.length)} subdomínios</span>
          </div>
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-neutral-200 text-left text-neutral-600">
                  <th className="py-2 pr-2 font-semibold">
                    {evento === "saiu" ? "Data de saída" : "Data de entrada"}
                  </th>
                  <th className="py-2 pr-2 font-semibold">Subdomínio</th>
                  <th className="py-2 pr-2 font-semibold">Segmento</th>
                </tr>
              </thead>
              <tbody>
                {detalhe.map((d, i) => (
                  <tr key={d.subdominio} className={i % 2 ? "bg-neutral-50" : "bg-white"}>
                    <td className="py-1.5 pr-2 tabular-nums text-neutral-700">
                      {fmtData(d.data_evento)}
                    </td>
                    <td className="py-1.5 pr-2 text-neutral-950">{d.subdominio}</td>
                    <td className="py-1.5 pr-2 text-neutral-700">{d.segmento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
