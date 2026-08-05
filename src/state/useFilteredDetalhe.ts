import { useMemo } from "react";
import { fluxo, mesesSaida } from "../data/loadData";
import { filtrarDetalhe } from "../lib/agg/fluxo";
import type { FluxoDetalhe } from "../types/dashboard";
import { useFilters } from "./filtersStore";

/**
 * Detalhe do fluxo (entrou/saiu por subdomínio) após aplicar os filtros.
 * Usa os mesmos índices de dict das rows, então reage aos filtros de
 * segmento/origem/vendedor como o resto do dashboard. O filtro "Mês de saída"
 * aqui restringe pelo mês do MOVIMENTO no servers-list (d.mes) — é o que faz os
 * cartões da tela Fluxo Mensal reagirem ao mês selecionado.
 *
 * Estágio de churn não se aplica (o detalhe não é grão de URL/estágio). A lógica
 * pura vive em lib/agg/fluxo.ts (testável); este hook só lê os filtros do store.
 */
export function useFilteredDetalhe(): FluxoDetalhe[] {
  const { segmentos, origens, vendedores, meses } = useFilters();

  return useMemo(() => {
    // índices de mês -> strings "YYYY-MM" (mesma convenção do useFilteredRows)
    const mesesStr = meses.map((i) => mesesSaida[i]);
    return filtrarDetalhe(fluxo.detalhe, {
      segmentos,
      origens,
      vendedores,
      meses: mesesStr,
    });
  }, [segmentos, origens, vendedores, meses]);
}
