import { useMemo, useState } from "react";
import { ChartCard } from "../components/charts/ChartCard";
import { LinhaMulti } from "../components/charts/Charts";
import { COR } from "../components/charts/palette";
import { KpiCard } from "../components/kpi/KpiCard";
import { fluxo } from "../data/loadData";
import { fmtData, fmtMes, fmtNum, fmtPct } from "../lib/format";
import type { MetricaDiaUtil } from "../types/dashboard";
import { ScreenHeader } from "./ScreenHeader";

const METRICAS: { id: MetricaDiaUtil; label: string; descricao: string }[] = [
  {
    id: "base",
    label: "Servidores",
    descricao: "Total de subdomínios ativos naquele dia útil",
  },
  {
    id: "entrou",
    label: "Entradas",
    descricao: "Entradas acumuladas desde o 1º dia útil do mês",
  },
  {
    id: "saiu",
    label: "Saídas",
    descricao: "Saídas acumuladas desde o 1º dia útil do mês",
  },
  {
    id: "saiu_pagante",
    label: "Saídas pagantes",
    descricao: "Saídas acumuladas de clientes com ≥1 pagamento (exclui não-pagantes)",
  },
];

export function EvolucaoTemporal() {
  const ytd = fluxo.ytd;
  const [metrica, setMetrica] = useState<MetricaDiaUtil>("base");
  const [mesBase, setMesBase] = useState<string>(""); // "" = todo o período
  const diaUtil = fluxo.dia_util[metrica];
  const descMetrica = METRICAS.find((m) => m.id === metrica)!.descricao;

  // meses presentes no dia_util (colunas != dia_util)
  const mesesDU = useMemo(
    () => Object.keys(diaUtil[0] ?? {}).filter((k) => k !== "dia_util").sort(),
    [diaUtil],
  );

  // meses/ano disponíveis no ytd (para o filtro próprio do gráfico de base)
  const mesesBase = useMemo(
    () => [...new Set(ytd.map((d) => d.data.slice(0, 7)))].sort(),
    [ytd],
  );

  // série da base: filtra por mês/ano se selecionado; rótulo = dd/mm/yyyy (BR)
  const baseData = useMemo(() => {
    const src = mesBase
      ? ytd.filter((d) => d.data.slice(0, 7) === mesBase)
      : ytd;
    return src.map((d) => ({ data: fmtData(d.data), total: d.total }));
  }, [ytd, mesBase]);
  const ytdData = useMemo(
    () =>
      ytd.map((d) => ({
        data: fmtData(d.data),
        entrou: d.entrou_ytd,
        saiu: d.saiu_ytd,
      })),
    [ytd],
  );

  const ultimo = ytd[ytd.length - 1];
  const taxaSaidaYtd = (100 * ultimo.saiu_ytd) / (ultimo.total - ultimo.liquido_ytd);

  return (
    <div>
      <ScreenHeader
        titulo="Evolução Temporal"
        subtitulo="Evolução da base, acumulado do ano (YTD) e comparação por dia útil. Só possível porque a gold preserva o grão diário."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Base atual" valor={fmtNum(ultimo.total)} sub={fmtData(ultimo.data)} />
        <KpiCard label="Entraram (YTD)" valor={fmtNum(ultimo.entrou_ytd)} tom="success" />
        <KpiCard label="Saíram (YTD)" valor={fmtNum(ultimo.saiu_ytd)} tom="danger" />
        <KpiCard
          label="Líquido (YTD)"
          valor={ultimo.liquido_ytd >= 0 ? `+${fmtNum(ultimo.liquido_ytd)}` : fmtNum(ultimo.liquido_ytd)}
          tom={ultimo.liquido_ytd >= 0 ? "success" : "danger"}
          sub={`saída YTD ${fmtPct(taxaSaidaYtd)}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          titulo="Evolução da base de subdomínios"
          descricao={mesBase ? `Total ativo por snapshot — ${fmtMes(mesBase)}` : "Total ativo em cada snapshot"}
          acao={
            <select
              value={mesBase}
              onChange={(e) => setMesBase(e.target.value)}
              className="rounded-sm border border-neutral-300 px-2 py-1.5 text-sm text-neutral-700"
            >
              <option value="">Todo o período</option>
              {mesesBase.map((m) => (
                <option key={m} value={m}>
                  {fmtMes(m)}
                </option>
              ))}
            </select>
          }
        >
          <LinhaMulti
            data={baseData}
            xKey="data"
            series={[{ key: "total", nome: "Base", cor: COR.primary }]}
            fmt={fmtNum}
            soExtremos
          />
        </ChartCard>

        <ChartCard titulo="Acumulado do ano (YTD)" descricao="Entradas e saídas acumuladas vs. base de 01/01">
          <LinhaMulti
            data={ytdData}
            xKey="data"
            series={[
              { key: "entrou", nome: "Entraram YTD", cor: COR.success },
              { key: "saiu", nome: "Saíram YTD", cor: COR.danger },
            ]}
            fmt={fmtNum}
            soExtremos
          />
        </ChartCard>

        <ChartCard
          titulo="Fluxo por dia útil (MoM)"
          descricao={`${descMetrica} — mesmo dia útil comparado entre meses`}
          className="lg:col-span-2"
          acao={
            <div className="flex gap-1 rounded-sm bg-neutral-100 p-1">
              {METRICAS.map((m) => {
                const ativo = metrica === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMetrica(m.id)}
                    className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
                      ativo
                        ? "bg-primary-900 text-white shadow-sm"
                        : "text-neutral-600 hover:bg-neutral-200"
                    }`}
                    aria-pressed={ativo}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          }
        >
          <div className="max-h-80 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-neutral-200 text-left text-neutral-600">
                  <th className="py-2 pr-3 font-semibold">Dia útil</th>
                  {mesesDU.map((m) => (
                    <th key={m} className="py-2 pr-3 text-right font-semibold">
                      {fmtMes(m)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {diaUtil.map((linha, i) => (
                  <tr key={linha.dia_util} className={i % 2 ? "bg-neutral-50" : "bg-white"}>
                    <td className="py-1.5 pr-3 font-medium text-neutral-950">
                      {linha.dia_util}º
                    </td>
                    {mesesDU.map((m) => (
                      <td key={m} className="py-1.5 pr-3 text-right text-neutral-700">
                        {linha[m] != null ? fmtNum(Number(linha[m])) : "—"}
                      </td>
                    ))}
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
