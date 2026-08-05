import type { Dicts, Row } from "../../types/dashboard";
import { churned } from "./helpers";

export interface RankItem {
  nome: string;
  churned: number;
  precoce: number;
  pctPrecoce: number;
}

function ranking(
  rows: Row[],
  campo: "vnd" | "ori" | "seg",
  dict: string[],
  limite: number,
): RankItem[] {
  const ch = churned(rows);
  const m = new Map<number, { total: number; precoce: number }>();
  for (const r of ch) {
    const k = r[campo];
    if (k === null) continue;
    const o = m.get(k) ?? { total: 0, precoce: 0 };
    o.total += 1;
    if (r.es === 0) o.precoce += 1;
    m.set(k, o);
  }
  return [...m.entries()]
    .map(([idx, o]) => ({
      nome: dict[idx],
      churned: o.total,
      precoce: o.precoce,
      pctPrecoce: o.total ? (100 * o.precoce) / o.total : 0,
    }))
    .sort((a, b) => b.churned - a.churned)
    .slice(0, limite);
}

export const churnPorVendedor = (rows: Row[], d: Dicts, limite = 12) =>
  ranking(rows, "vnd", d.vnd, limite);

export const churnPorOrigem = (rows: Row[], d: Dicts, limite = 12) =>
  ranking(rows, "ori", d.ori, limite);

export const churnPorSegmento = (rows: Row[], d: Dicts, limite = 12) =>
  ranking(rows, "seg", d.seg, limite);
