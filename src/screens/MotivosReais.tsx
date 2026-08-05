import { useMemo } from "react";
import { ChartCard } from "../components/charts/ChartCard";
import { BarrasH } from "../components/charts/Charts";
import { COR } from "../components/charts/palette";
import { dicts } from "../data/loadData";
import {
  concorrentesPorMencao,
  motivoPorSegmento,
  motivosPorCategoria,
} from "../lib/agg/motivos";
import { fmtBRL, fmtNum } from "../lib/format";
import { useFilteredRows } from "../state/useFilteredRows";
import { ScreenHeader } from "./ScreenHeader";

export function MotivosReais() {
  const rows = useFilteredRows();
  const categorias = useMemo(() => motivosPorCategoria(rows, dicts), [rows]);
  const porSegmento = useMemo(() => motivoPorSegmento(rows, dicts), [rows]);
  const concorrentes = useMemo(
    () => concorrentesPorMencao(rows, dicts),
    [rows],
  );

  return (
    <div>
      <ScreenHeader
        titulo="Motivos Reais"
        subtitulo="Separar percepção de realidade. Inadimplência muitas vezes é reflexo de falta de valor percebido."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          titulo="Motivos de cancelamento por categoria"
          descricao="Agrupamento dos motivos formais e de CRM"
        >
          <BarrasH
            data={categorias.map((c) => ({ motivo: c.motivo, qtd: c.qtd }))}
            yKey="motivo"
            barKey="qtd"
            fmt={fmtNum}
            altura={300}
          />
        </ChartCard>

        <ChartCard
          titulo="MRR perdido por categoria de motivo"
          descricao="Onde está a maior perda financeira por causa"
        >
          <BarrasH
            data={categorias.map((c) => ({
              motivo: c.motivo,
              mrr: Math.round(c.mrr),
            }))}
            yKey="motivo"
            barKey="mrr"
            cor={COR.danger}
            fmt={fmtBRL}
            altura={300}
          />
        </ChartCard>

        <ChartCard
          titulo="Motivo dominante por segmento"
          descricao="Top segmentos por volume de churn e sua causa principal"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-600">
                  <th className="py-2 pr-2 font-semibold">Segmento</th>
                  <th className="py-2 pr-2 font-semibold">Cancel.</th>
                  <th className="py-2 pr-2 font-semibold">Motivo principal</th>
                </tr>
              </thead>
              <tbody>
                {porSegmento.map((s, i) => (
                  <tr
                    key={s.segmento}
                    className={i % 2 ? "bg-neutral-50" : "bg-white"}
                  >
                    <td className="py-2 pr-2 text-neutral-950">{s.segmento}</td>
                    <td className="py-2 pr-2 text-neutral-700">
                      {fmtNum(s.total)}
                    </td>
                    <td className="py-2 pr-2 text-neutral-700">{s.motivoTop}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>

        <ChartCard
          titulo="Concorrentes mais citados"
          descricao="Para onde os clientes migram (CRM de retenção · responde aos filtros)"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-600">
                  <th className="py-2 pr-2 font-semibold">Concorrente</th>
                  <th className="py-2 pr-2 font-semibold">Menções</th>
                </tr>
              </thead>
              <tbody>
                {concorrentes.map((c, i) => (
                  <tr
                    key={c.nome}
                    className={i % 2 ? "bg-neutral-50" : "bg-white"}
                  >
                    <td className="py-2 pr-2 text-neutral-950">{c.nome}</td>
                    <td className="py-2 pr-2 text-neutral-700">{fmtNum(c.n)}</td>
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
