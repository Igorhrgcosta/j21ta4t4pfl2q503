import type { BaseMensal, FluxoDetalhe, Row } from "../../types/dashboard";

/** Filtros aplicáveis ao detalhe do fluxo. */
export interface FiltrosDimensao {
  segmentos: number[];
  origens: number[];
  vendedores: number[];
  /** meses do movimento "YYYY-MM" (o mês em que o subdomínio entrou/saiu). */
  meses?: string[];
}

/**
 * Filtra o detalhe do fluxo (entrou/saiu por subdomínio) pelas dimensões
 * comerciais e pelo mês do movimento. Registros sem cadastro (índice null) só
 * passam quando o filtro daquela dimensão está vazio. Função pura — o hook
 * useFilteredDetalhe é só um wrapper que lê os filtros do store.
 */
export function filtrarDetalhe(
  detalhe: FluxoDetalhe[],
  { segmentos, origens, vendedores, meses = [] }: FiltrosDimensao,
): FluxoDetalhe[] {
  if (!segmentos.length && !origens.length && !vendedores.length && !meses.length)
    return detalhe;

  const mesesSet = meses.length ? new Set(meses) : null;

  return detalhe.filter((d) => {
    if (mesesSet && !mesesSet.has(d.mes)) return false;
    if (segmentos.length && (d.seg === null || !segmentos.includes(d.seg)))
      return false;
    if (origens.length && (d.ori === null || !origens.includes(d.ori)))
      return false;
    if (vendedores.length && (d.vnd === null || !vendedores.includes(d.vnd)))
      return false;
    return true;
  });
}

export interface CardsFluxo {
  base: number; // clientes ativos (rows)
  entraram: number; // apareceram no servers-list (detalhe)
  sairam: number; // deixaram o servers-list (detalhe)
  saldo: number; // entraram − saíram
}

/** KPIs dos cartões de fluxo a partir de rows ativas + detalhe (já filtrados). */
export function cardsFluxo(rows: Row[], detalhe: FluxoDetalhe[]): CardsFluxo {
  const base = rows.reduce((a, r) => a + (r.st === 0 ? 1 : 0), 0);
  let entraram = 0;
  let sairam = 0;
  for (const d of detalhe) {
    if (d.evento === "entrou") entraram += 1;
    else sairam += 1;
  }
  return { base, entraram, sairam, saldo: entraram - sairam };
}

/**
 * Churn mensal médio FILTRÁVEL = média simples das taxas de saída mensais,
 * onde cada taxa = saídas do mês ÷ base de início do mês, ambas respeitando os
 * filtros de dimensão comercial. Sem filtro reproduz o número global (~3,1%);
 * com filtro recalcula sobre o subconjunto (mesma definição do card).
 *
 * saídas: eventos "saiu" do detalhe filtrado por mês.
 * base:   soma das contagens do base_mensal (pré-agregado) que casam o filtro.
 */
export function churnMensalMedioFiltrado(
  detalhe: FluxoDetalhe[],
  baseMensal: BaseMensal[],
  filtros: Pick<FiltrosDimensao, "segmentos" | "origens" | "vendedores">,
): number {
  const { segmentos, origens, vendedores } = filtros;
  const casa = (seg: number | null, ori: number | null, vnd: number | null) => {
    if (segmentos.length && (seg === null || !segmentos.includes(seg))) return false;
    if (origens.length && (ori === null || !origens.includes(ori))) return false;
    if (vendedores.length && (vnd === null || !vendedores.includes(vnd))) return false;
    return true;
  };

  // saídas por mês (detalhe já pode vir filtrado; refiltra por segurança)
  const saidasPorMes = new Map<string, number>();
  for (const d of detalhe) {
    if (d.evento !== "saiu") continue;
    if (!casa(d.seg, d.ori, d.vnd)) continue;
    saidasPorMes.set(d.mes, (saidasPorMes.get(d.mes) ?? 0) + 1);
  }

  // base de início por mês (soma das contagens que casam o filtro)
  const basePorMes = new Map<string, number>();
  for (const b of baseMensal) {
    if (!casa(b.seg, b.ori, b.vnd)) continue;
    basePorMes.set(b.mes, (basePorMes.get(b.mes) ?? 0) + b.n);
  }

  // taxa de cada mês com base > 0; média simples
  const taxas: number[] = [];
  for (const [mes, base] of basePorMes) {
    if (base <= 0) continue;
    const saidas = saidasPorMes.get(mes) ?? 0;
    taxas.push((100 * saidas) / base);
  }
  return taxas.length ? taxas.reduce((a, t) => a + t, 0) / taxas.length : 0;
}
