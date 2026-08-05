import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { ChartCard } from "../components/charts/ChartCard";
import { tabelaAnalitica } from "../lib/agg/analitico";
import { exportarXlsx } from "../lib/exportXlsx";
import { fmtBRL, fmtData, fmtNum } from "../lib/format";
import { useFilteredRows } from "../state/useFilteredRows";
import { ScreenHeader } from "./ScreenHeader";

const POR_PAGINA = 15;

export function Analitico() {
  const rows = useFilteredRows();
  const linhas = useMemo(() => tabelaAnalitica(rows), [rows]);
  const [pagina, setPagina] = useState(0);

  const totalPaginas = Math.max(1, Math.ceil(linhas.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas - 1);
  const visiveis = linhas.slice(
    paginaAtual * POR_PAGINA,
    (paginaAtual + 1) * POR_PAGINA,
  );

  return (
    <div>
      <ScreenHeader
        titulo="Analítico"
        subtitulo="Detalhamento dos clientes cancelados conforme os filtros aplicados. Exporte para Excel para análise externa."
      />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-neutral-600">
          <span className="font-semibold text-neutral-950">
            {fmtNum(linhas.length)}
          </span>{" "}
          clientes cancelados no recorte atual
        </p>
        <button
          onClick={() => exportarXlsx(linhas)}
          disabled={linhas.length === 0}
          className="flex items-center gap-2 rounded-round bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-800 disabled:opacity-50"
        >
          <Download size={16} />
          Exportar Excel
        </button>
      </div>

      <ChartCard titulo="Clientes cancelados">
        <div className="max-h-[calc(100vh-360px)] overflow-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-neutral-200 text-left text-neutral-600">
                <th className="whitespace-nowrap py-2 pr-3 font-semibold">URL</th>
                <th className="whitespace-nowrap py-2 pr-3 font-semibold">Motivo</th>
                <th className="whitespace-nowrap py-2 pr-3 font-semibold">Vendedor</th>
                <th className="whitespace-nowrap py-2 pr-3 font-semibold">Origem</th>
                <th className="whitespace-nowrap py-2 pr-3 font-semibold">Segmento</th>
                <th className="whitespace-nowrap py-2 pr-3 text-right font-semibold">Valor</th>
                <th className="whitespace-nowrap py-2 pr-3 font-semibold">Criação</th>
                <th className="whitespace-nowrap py-2 pr-3 font-semibold">Cancelamento</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((l, i) => (
                <tr
                  key={`${l.url}-${i}`}
                  className={i % 2 ? "bg-neutral-50" : "bg-white"}
                >
                  <td className="whitespace-nowrap py-2 pr-3 text-neutral-950">
                    {l.url}
                  </td>
                  <td className="whitespace-nowrap py-2 pr-3 text-neutral-700">
                    {l.motivo}
                  </td>
                  <td className="whitespace-nowrap py-2 pr-3 text-neutral-700">
                    {l.vendedor}
                  </td>
                  <td className="whitespace-nowrap py-2 pr-3 text-neutral-700">
                    {l.origem}
                  </td>
                  <td className="whitespace-nowrap py-2 pr-3 text-neutral-700">
                    {l.segmento}
                  </td>
                  <td className="whitespace-nowrap py-2 pr-3 text-right text-neutral-700">
                    {l.valor !== null ? fmtBRL(l.valor) : "—"}
                  </td>
                  <td className="whitespace-nowrap py-2 pr-3 text-neutral-700">
                    {fmtData(l.dataCriacao)}
                  </td>
                  <td className="whitespace-nowrap py-2 pr-3 text-neutral-700">
                    <span className="inline-flex items-center gap-1.5">
                      {fmtData(l.dataCancelamento)}
                      {l.provisorio && (
                        <span
                          className="rounded-round bg-warning-50 px-2 py-0.5 text-xs font-medium text-warning-700"
                          title="Saída há menos de 30 dias — a janela de tolerância de retorno ainda não fechou; pode ser reativação."
                        >
                          provisório
                        </span>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
              {visiveis.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-400">
                    Nenhum cliente cancelado no recorte atual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPaginas > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-neutral-500">
              {fmtNum(paginaAtual * POR_PAGINA + 1)}–
              {fmtNum(Math.min((paginaAtual + 1) * POR_PAGINA, linhas.length))} de{" "}
              {fmtNum(linhas.length)} · página {paginaAtual + 1}/{totalPaginas}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPagina((p) => Math.max(0, p - 1))}
                disabled={paginaAtual === 0}
                className="rounded-sm border border-neutral-300 px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                onClick={() =>
                  setPagina((p) => Math.min(totalPaginas - 1, p + 1))
                }
                disabled={paginaAtual >= totalPaginas - 1}
                className="rounded-sm border border-neutral-300 px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </ChartCard>
    </div>
  );
}
