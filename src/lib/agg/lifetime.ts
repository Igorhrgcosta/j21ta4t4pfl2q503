import type { Row } from "../../types/dashboard";
import { FAIXAS_LIFETIME, churned, faixaDe } from "./helpers";

export interface FaixaLifetime {
  faixa: string;
  qtd: number;
  pctAcumulado: number; // % acumulado da contagem
}

/** Histograma de churn por faixa de lifetime + % acumulado (Tela 2). */
export function churnPorFaixaLifetime(rows: Row[]): FaixaLifetime[] {
  const ch = churned(rows);
  const cont = new Map<string, number>();
  for (const f of FAIXAS_LIFETIME) cont.set(f.label, 0);
  for (const r of ch) cont.set(faixaDe(r.lt), (cont.get(faixaDe(r.lt)) ?? 0) + 1);

  const total = ch.length || 1;
  let acc = 0;
  return FAIXAS_LIFETIME.map((f) => {
    const qtd = cont.get(f.label) ?? 0;
    acc += qtd;
    return { faixa: f.label, qtd, pctAcumulado: (100 * acc) / total };
  });
}
