import type { Row } from "../../types/dashboard";

export const churned = (rows: Row[]) => rows.filter((r) => r.st === 1);
export const ativos = (rows: Row[]) => rows.filter((r) => r.st === 0);

export const soma = (vals: (number | null)[]) =>
  vals.reduce<number>((a, v) => a + (v ?? 0), 0);

export const media = (vals: (number | null)[]) => {
  const n = vals.filter((v) => v !== null);
  return n.length ? soma(n) / n.length : 0;
};

/** Conta ocorrências por chave categórica (índice do dict). */
export function contarPorIndice(
  rows: Row[],
  campo: keyof Row,
): Map<number, number> {
  const m = new Map<number, number>();
  for (const r of rows) {
    const k = r[campo] as number | null;
    if (k === null || k === undefined) continue;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

/** Faixas de lifetime usadas na Tela 2. */
export const FAIXAS_LIFETIME = [
  { label: "0-30", min: 0, max: 30 },
  { label: "31-60", min: 31, max: 60 },
  { label: "61-90", min: 61, max: 90 },
  { label: "91-120", min: 91, max: 120 },
  { label: "121-180", min: 121, max: 180 },
  { label: "180+", min: 181, max: Infinity },
];

export const faixaDe = (lt: number) =>
  FAIXAS_LIFETIME.find((f) => lt >= f.min && lt <= f.max)?.label ?? "180+";

/** Meses distintos de saída presentes (ordenados). */
export function mesesDistintos(rows: Row[]): string[] {
  const s = new Set<string>();
  for (const r of rows) if (r.sm) s.add(r.sm);
  return [...s].sort();
}
