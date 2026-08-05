import { RotateCcw } from "lucide-react";
import { useMemo } from "react";
import { dicts, mesesSaida } from "../../data/loadData";
import { fmtMes } from "../../lib/format";
import { useFilters } from "../../state/filtersStore";
import { MultiSelect } from "./MultiSelect";
import { OrigemDrilldown } from "./OrigemDrilldown";

export function FilterBar() {
  const f = useFilters();

  // rótulos dos meses (índice -> "mar/26"), na ordem de mesesSaida
  const opcoesMeses = useMemo(() => mesesSaida.map((m) => fmtMes(m)), []);

  const algumFiltro =
    f.segmentos.length ||
    f.origens.length ||
    f.vendedores.length ||
    f.estagios.length ||
    f.meses.length;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 bg-white px-6 py-3">
      <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
        Filtros
      </span>

      <MultiSelect
        label="Mês de saída"
        opcoes={opcoesMeses}
        selecionados={f.meses}
        onToggle={(i) => f.toggle("meses", i)}
        onLimpar={() => f.setMulti("meses", [])}
      />

      <MultiSelect
        label="Segmento"
        opcoes={dicts.seg}
        selecionados={f.segmentos}
        onToggle={(i) => f.toggle("segmentos", i)}
        onLimpar={() => f.setMulti("segmentos", [])}
      />
      <OrigemDrilldown
        label="Origem"
        opcoes={dicts.ori}
        selecionados={f.origens}
        onSetMulti={(vals) => f.setMulti("origens", vals)}
      />
      <MultiSelect
        label="Vendedor"
        opcoes={dicts.vnd}
        selecionados={f.vendedores}
        onToggle={(i) => f.toggle("vendedores", i)}
        onLimpar={() => f.setMulti("vendedores", [])}
      />
      <MultiSelect
        label="Estágio"
        opcoes={dicts.est}
        selecionados={f.estagios}
        onToggle={(i) => f.toggle("estagios", i)}
        onLimpar={() => f.setMulti("estagios", [])}
      />

      <button
        onClick={f.reset}
        disabled={!algumFiltro}
        className="ml-auto flex items-center gap-1.5 rounded-round border border-neutral-300 px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <RotateCcw size={14} />
        Limpar filtros
      </button>
    </div>
  );
}
