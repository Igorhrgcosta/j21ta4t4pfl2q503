import type { DashboardData } from "../types/dashboard";
import raw from "./dashboard.json";

export const data = raw as unknown as DashboardData;
export const dicts = data.meta.dicts;
export const allRows = data.rows;
export const fluxo = data.fluxo;

/** Dicionário estável de meses de saída ("YYYY-MM"), ordenado — usado no filtro. */
export const mesesSaida: string[] = (() => {
  const s = new Set<string>();
  for (const r of allRows) if (r.sm) s.add(r.sm);
  return [...s].sort();
})();
