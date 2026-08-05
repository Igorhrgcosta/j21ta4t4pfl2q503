import type { Row } from "../../types/dashboard";
import { ativos, churned, media, mesesDistintos } from "./helpers";

const MATURIDADE_DIAS = 180; // 6 meses

/** Métricas de LTV e maturidade (Tela 6). */
export function metricasLtv(rows: Row[]) {
  const ch = churned(rows);
  const at = ativos(rows);

  const lifetimeMedioChurn = media(ch.map((r) => r.lt));
  const lifetimeMedioBase = media(rows.map((r) => r.lt));

  // % da base (ativos + churned) que atingiu 6 meses de vida
  const maduros = rows.filter((r) => r.lt >= MATURIDADE_DIAS).length;
  const pctMaturidade = rows.length ? (100 * maduros) / rows.length : 0;

  // % dos churned que nem chegou à maturidade
  const churnAntesMaturidade = ch.filter((r) => r.lt < MATURIDADE_DIAS).length;
  const pctChurnImaturo = ch.length
    ? (100 * churnAntesMaturidade) / ch.length
    : 0;

  return {
    lifetimeMedioChurn,
    lifetimeMedioBase,
    pctMaturidade,
    pctChurnImaturo,
    ativos: at.length,
    maduros,
  };
}

/** Lifetime médio dos cancelados por coorte (mês de saída). */
export function lifetimeMedioPorCoorte(rows: Row[]) {
  const ch = churned(rows);
  return mesesDistintos(ch).map((mes) => ({
    mes,
    lifetimeMedio: media(ch.filter((r) => r.sm === mes).map((r) => r.lt)),
  }));
}
