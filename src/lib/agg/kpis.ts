import type { Dicts, Row } from "../../types/dashboard";
import { ativos, churned, media, mesesDistintos, soma } from "./helpers";

export interface Kpis {
  total: number;
  nChurned: number;
  nAtivos: number;
  churnRate: number; // %
  churnPrecocePct: number; // % dos churned com estágio precoce (es==0)
  pctSemPayback: number; // % dos churned que não atingiram payback
  mrrPerdido: number;
  ticketChurn: number;
  ticketAtivo: number;
  lifetimeMedioChurn: number;
}

export function calcularKpis(rows: Row[]): Kpis {
  const ch = churned(rows);
  const at = ativos(rows);
  const total = rows.length;
  const nChurned = ch.length;

  const precoce = ch.filter((r) => r.es === 0).length;
  const semPayback = ch.filter((r) => r.pb === 0).length;

  return {
    total,
    nChurned,
    nAtivos: at.length,
    churnRate: total ? (100 * nChurned) / total : 0,
    churnPrecocePct: nChurned ? (100 * precoce) / nChurned : 0,
    pctSemPayback: nChurned ? (100 * semPayback) / nChurned : 0,
    mrrPerdido: soma(ch.map((r) => r.mr)),
    ticketChurn: media(ch.map((r) => r.mr)),
    ticketAtivo: media(at.map((r) => r.mr)),
    lifetimeMedioChurn: media(ch.map((r) => r.lt)),
  };
}

/** Série de churn por mês de saída (contagem + MRR perdido). */
export function churnPorMes(rows: Row[]) {
  const ch = churned(rows);
  const meses = mesesDistintos(ch);
  return meses.map((mes) => {
    const doMes = ch.filter((r) => r.sm === mes);
    return {
      mes,
      churned: doMes.length,
      mrrPerdido: soma(doMes.map((r) => r.mr)),
    };
  });
}

export interface Insight {
  tipo: "danger" | "warning" | "info";
  titulo: string;
  texto: string;
}

/**
 * Insights automáticos (Tela 1). Determinísticos: % antes do payback +
 * MRR perdido, áreas com mais churn precoce (lift vs média), top causas.
 */
export function gerarInsights(rows: Row[], dicts: Dicts): Insight[] {
  const ch = churned(rows);
  if (!ch.length) return [];
  const insights: Insight[] = [];

  // 1. % antes do payback + MRR perdido nesse grupo
  const semPb = ch.filter((r) => r.pb === 0);
  const pctSemPb = (100 * semPb.length) / ch.length;
  const mrrSemPb = soma(semPb.map((r) => r.mr));
  insights.push({
    tipo: "danger",
    titulo: `${pctSemPb.toFixed(1)}% saíram antes do payback`,
    texto: `${semPb.length} clientes cancelaram antes de se pagar (120 dias), representando MRR perdido de R$ ${mrrSemPb.toLocaleString(
      "pt-BR",
      { maximumFractionDigits: 0 },
    )} que nunca cobriu o custo de aquisição.`,
  });

  // 2. Origem com maior lift de churn precoce
  const precoceGlobal =
    ch.filter((r) => r.es === 0).length / ch.length || 0;
  const porOrigem = new Map<number, { total: number; precoce: number }>();
  for (const r of ch) {
    if (r.ori === null) continue;
    const o = porOrigem.get(r.ori) ?? { total: 0, precoce: 0 };
    o.total += 1;
    if (r.es === 0) o.precoce += 1;
    porOrigem.set(r.ori, o);
  }
  let melhorOri: { nome: string; lift: number; total: number } | null = null;
  for (const [idx, o] of porOrigem) {
    if (o.total < 10) continue; // evita ruído de amostra pequena
    const taxa = o.precoce / o.total;
    const lift = precoceGlobal ? taxa / precoceGlobal : 0;
    if (!melhorOri || lift > melhorOri.lift)
      melhorOri = { nome: dicts.ori[idx], lift, total: o.total };
  }
  if (melhorOri && melhorOri.lift > 1.2) {
    insights.push({
      tipo: "warning",
      titulo: `Origem "${melhorOri.nome}" concentra churn precoce`,
      texto: `Clientes vindos de "${melhorOri.nome}" têm ${melhorOri.lift.toFixed(
        1,
      )}× mais churn precoce que a média — sinal de desalinhamento na aquisição/venda.`,
    });
  }

  // 3. Top causa real
  const porMotivo = new Map<number, number>();
  for (const r of ch)
    if (r.mot !== null) porMotivo.set(r.mot, (porMotivo.get(r.mot) ?? 0) + 1);
  const top = [...porMotivo.entries()].sort((a, b) => b[1] - a[1])[0];
  if (top) {
    insights.push({
      tipo: "info",
      titulo: `Principal causa: ${dicts.mot[top[0]]}`,
      texto: `${dicts.mot[top[0]]} responde por ${(
        (100 * top[1]) /
        ch.length
      ).toFixed(0)}% dos cancelamentos (${top[1]} clientes).`,
    });
  }

  return insights;
}
