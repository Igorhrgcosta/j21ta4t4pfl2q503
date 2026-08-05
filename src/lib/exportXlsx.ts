import type { LinhaAnalitica } from "./agg/analitico";
import { fmtData } from "./format";

const CABECALHOS = [
  "URL",
  "Motivo",
  "Vendedor",
  "Origem",
  "Segmento",
  "Valor (R$)",
  "Data de criação",
  "Data de cancelamento",
  "Status",
];

/** Exporta a tabela analítica para um arquivo .xlsx.
 *  A lib xlsx é carregada sob demanda (só ao clicar em exportar). */
export async function exportarXlsx(linhas: LinhaAnalitica[]): Promise<void> {
  const XLSX = await import("xlsx");
  const dados = linhas.map((l) => ({
    URL: l.url,
    Motivo: l.motivo,
    Vendedor: l.vendedor,
    Origem: l.origem,
    Segmento: l.segmento,
    "Valor (R$)": l.valor ?? "",
    "Data de criação": fmtData(l.dataCriacao),
    "Data de cancelamento": fmtData(l.dataCancelamento),
    Status: l.provisorio ? "Provisório (< 30 dias)" : "Confirmado",
  }));

  const ws = XLSX.utils.json_to_sheet(dados, { header: CABECALHOS });
  ws["!cols"] = [
    { wch: 36 }, // url
    { wch: 28 }, // motivo
    { wch: 22 }, // vendedor
    { wch: 22 }, // origem
    { wch: 20 }, // segmento
    { wch: 12 }, // valor
    { wch: 16 }, // criação
    { wch: 20 }, // cancelamento
    { wch: 22 }, // status
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Churn Analítico");

  const hoje = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `churn_analitico_${hoje}.xlsx`);
}
