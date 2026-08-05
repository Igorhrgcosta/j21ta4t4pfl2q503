import type { Row } from "../../types/dashboard";
import { ativos, churned, mesesDistintos, soma } from "./helpers";

/** MRR perdido por mês de saída (Tela 4). */
export function mrrPerdidoPorMes(rows: Row[]) {
  const ch = churned(rows);
  return mesesDistintos(ch).map((mes) => ({
    mes,
    mrr: soma(ch.filter((r) => r.sm === mes).map((r) => r.mr)),
  }));
}

/** MRR perdido por tipo de churn: precoce (es==0) vs tardio (es 1|2). */
export function mrrPorTipoChurn(rows: Row[]) {
  const ch = churned(rows);
  const precoce = soma(ch.filter((r) => r.es === 0).map((r) => r.mr));
  const intermediario = soma(ch.filter((r) => r.es === 1).map((r) => r.mr));
  const tardio = soma(ch.filter((r) => r.es === 2).map((r) => r.mr));
  return [
    { tipo: "Precoce", mrr: precoce },
    { tipo: "Intermediário", mrr: intermediario },
    { tipo: "Pós Payback", mrr: tardio },
  ];
}

/** MRR ativo (base saudável) vs MRR perdido (churned). */
export function mrrGanhoVsPerdido(rows: Row[]) {
  return {
    ativo: soma(ativos(rows).map((r) => r.mr)),
    perdido: soma(churned(rows).map((r) => r.mr)),
  };
}
