import { useMemo } from "react";
import { allRows, mesesSaida } from "../data/loadData";
import type { Row } from "../types/dashboard";
import { useFilters } from "./filtersStore";

/**
 * Linhas após aplicar os filtros globais.
 *
 * Semântica importante: os filtros de dimensão (segmento, origem, vendedor)
 * aplicam-se a TODAS as linhas (ativas + churned). Já mês de saída e estágio
 * só fazem sentido para churned — quando ativos, esses filtros são ignorados
 * para a linha ativa (ela permanece na base, pois é necessária para calcular
 * taxas de churn corretas).
 */
export function useFilteredRows(): Row[] {
  const { meses, segmentos, origens, vendedores, estagios } = useFilters();

  return useMemo(() => {
    // converte índices de mês selecionados -> conjunto de strings "YYYY-MM"
    const mesesSel = new Set(meses.map((i) => mesesSaida[i]));

    return allRows.filter((r) => {
      if (segmentos.length && (r.seg === null || !segmentos.includes(r.seg)))
        return false;
      if (origens.length && (r.ori === null || !origens.includes(r.ori)))
        return false;
      if (vendedores.length && (r.vnd === null || !vendedores.includes(r.vnd)))
        return false;

      // mês de saída e estágio: só restringem churned; ativos passam sempre
      if (r.st === 1) {
        if (mesesSel.size && (!r.sm || !mesesSel.has(r.sm))) return false;
        if (estagios.length && (r.es === null || !estagios.includes(r.es)))
          return false;
      }
      return true;
    });
  }, [meses, segmentos, origens, vendedores, estagios]);
}
