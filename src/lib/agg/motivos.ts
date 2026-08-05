import type { Dicts, Row } from "../../types/dashboard";
import { FAIXAS_LIFETIME, churned, faixaDe, soma } from "./helpers";

/** Contagem + MRR por categoria de motivo (barras horizontais, Tela 5). */
export function motivosPorCategoria(rows: Row[], dicts: Dicts) {
  const ch = churned(rows);
  const m = new Map<number, { qtd: number; mrr: number }>();
  for (const r of ch) {
    if (r.mot === null) continue;
    const o = m.get(r.mot) ?? { qtd: 0, mrr: 0 };
    o.qtd += 1;
    o.mrr += r.mr ?? 0;
    m.set(r.mot, o);
  }
  return [...m.entries()]
    .map(([idx, o]) => ({ motivo: dicts.mot[idx], qtd: o.qtd, mrr: o.mrr }))
    .sort((a, b) => b.qtd - a.qtd);
}

/** Matriz motivo × faixa de lifetime (empilhado). */
export function motivoPorFaixaLifetime(rows: Row[], dicts: Dicts) {
  const ch = churned(rows);
  return FAIXAS_LIFETIME.map((f) => {
    const linha: Record<string, number | string> = { faixa: f.label };
    for (const nome of dicts.mot) linha[nome] = 0;
    for (const r of ch.filter((r) => faixaDe(r.lt) === f.label)) {
      if (r.mot === null) continue;
      const nome = dicts.mot[r.mot];
      linha[nome] = (linha[nome] as number) + 1;
    }
    return linha;
  });
}

/** Concorrentes mais citados entre os churned filtrados (top N). */
export function concorrentesPorMencao(rows: Row[], dicts: Dicts, limite = 10) {
  const dic = dicts.con ?? []; // tolera dashboard.json antigo (sem dict de concorrente)
  const ch = churned(rows);
  const m = new Map<number, number>();
  for (const r of ch) {
    if (r.con === null || r.con === undefined) continue;
    m.set(r.con, (m.get(r.con) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([idx, n]) => ({ nome: dic[idx] ?? "—", n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, limite);
}

/** Motivo dominante por segmento (top N segmentos por volume de churn). */
export function motivoPorSegmento(rows: Row[], dicts: Dicts, limite = 8) {
  const ch = churned(rows);
  const porSeg = new Map<number, Row[]>();
  for (const r of ch) {
    if (r.seg === null) continue;
    let arr = porSeg.get(r.seg);
    if (!arr) {
      arr = [];
      porSeg.set(r.seg, arr);
    }
    arr.push(r);
  }
  return [...porSeg.entries()]
    .map(([idx, rs]) => {
      const mm = new Map<number, number>();
      for (const r of rs)
        if (r.mot !== null) mm.set(r.mot, (mm.get(r.mot) ?? 0) + 1);
      const top = [...mm.entries()].sort((a, b) => b[1] - a[1])[0];
      return {
        segmento: dicts.seg[idx],
        total: rs.length,
        motivoTop: top ? dicts.mot[top[0]] : "—",
        mrr: soma(rs.map((r) => r.mr)),
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, limite);
}
