import { dicts } from "../../data/loadData";
import type { Row } from "../../types/dashboard";
import { churned } from "./helpers";

export interface LinhaAnalitica {
  url: string;
  motivo: string;
  vendedor: string;
  origem: string;
  segmento: string;
  valor: number | null;
  dataCriacao: string;
  dataCancelamento: string;
  provisorio: boolean;
}

const dictLabel = (arr: string[], idx: number | null | undefined) =>
  idx === null || idx === undefined ? "—" : (arr[idx] ?? "—");

/** Monta a tabela analítica (somente cancelados) a partir das linhas filtradas. */
export function tabelaAnalitica(rows: Row[]): LinhaAnalitica[] {
  return churned(rows)
    .map((r) => ({
      url: r.u ?? "—",
      motivo: r.mraw ?? "Não informado",
      vendedor: dictLabel(dicts.vnd, r.vnd),
      origem: dictLabel(dicts.ori, r.ori),
      segmento: dictLabel(dicts.seg, r.seg),
      valor: r.mr,
      dataCriacao: r.dc ?? "—",
      dataCancelamento: r.ds ?? "—",
      provisorio: r.pv === 1,
    }))
    .sort((a, b) => b.dataCancelamento.localeCompare(a.dataCancelamento));
}
