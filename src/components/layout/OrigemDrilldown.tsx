import { Check, ChevronDown, ChevronRight, Minus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  label: string;
  opcoes: string[]; // labels indexadas (índice = valor)
  selecionados: number[];
  onSetMulti: (valores: number[]) => void; // seta o array inteiro (grupos)
}

/**
 * Grupos de drill-down da Origem: origens que casam a mesma regra são
 * colapsadas numa opção única (marca/desmarca todas de uma vez), expansível
 * para escolher membros específicos. A ordem importa — a 1ª regra que casa
 * "captura" a origem (evita uma origem cair em 2 grupos).
 */
const GRUPOS: { rotulo: string; casa: (nome: string) => boolean }[] = [
  // BP vem primeiro: captura "BP - Indicação" etc. antes dos grupos abaixo.
  { rotulo: "BP", casa: (n) => /^bp\b|^bp-/i.test(n.trim()) },
  { rotulo: "Formulário DigiSac", casa: (n) => /^form(ul[áa]rio)?\b/i.test(n.trim()) },
  { rotulo: "Fila DigiSac", casa: (n) => /^fila\b/i.test(n.trim()) },
  { rotulo: "Indicação", casa: (n) => /^indica[çc][ãa]o\b/i.test(n.trim()) },
  { rotulo: "Redes Sociais", casa: (n) => /^(facebook|instagram)$/i.test(n.trim()) },
  // grupos por prefixo de slug (o prefixo manda; marketing-*-whatsapp fica em Marketing)
  { rotulo: "Marketing", casa: (n) => /^marketing-/i.test(n.trim()) },
  { rotulo: "DigiSac", casa: (n) => /^digisac-/i.test(n.trim()) },
  { rotulo: "WhatsApp", casa: (n) => /^whatsapp-|^[a-z]{2}-whatsapp-/i.test(n.trim()) },
];

/**
 * Filtro de Origem com drill-down: origens de famílias conhecidas (BP,
 * Formulário, Fila) viram um item de grupo que marca todos de uma vez e pode
 * ser expandido para escolher membros específicos. As demais ficam individuais.
 * Opera sobre o mesmo array de índices — o filtro subjacente não muda.
 */
export function OrigemDrilldown({ label, opcoes, selecionados, onSetMulti }: Props) {
  const [aberto, setAberto] = useState(false);
  const [expandido, setExpandido] = useState<Record<string, boolean>>({});
  const [busca, setBusca] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function fora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, []);

  // classifica cada origem no 1º grupo que casar; o resto fica individual
  const { grupos, avulsas } = useMemo(() => {
    const porGrupo = new Map<string, number[]>(GRUPOS.map((g) => [g.rotulo, []]));
    const avulsas: { nome: string; idx: number }[] = [];
    opcoes.forEach((nome, idx) => {
      const g = GRUPOS.find((gr) => gr.casa(nome));
      if (g) porGrupo.get(g.rotulo)!.push(idx);
      else avulsas.push({ nome, idx });
    });
    const grupos = GRUPOS.map((g) => ({
      rotulo: g.rotulo,
      idxs: porGrupo.get(g.rotulo)!,
    })).filter((g) => g.idxs.length > 0);
    return { grupos, avulsas };
  }, [opcoes]);

  const sel = useMemo(() => new Set(selecionados), [selecionados]);

  const toggleUm = (idx: number) => {
    const novo = new Set(sel);
    novo.has(idx) ? novo.delete(idx) : novo.add(idx);
    onSetMulti([...novo]);
  };
  const toggleGrupo = (idxs: number[], todos: boolean) => {
    const novo = new Set(sel);
    if (todos) idxs.forEach((i) => novo.delete(i));
    else idxs.forEach((i) => novo.add(i));
    onSetMulti([...novo]);
  };

  const q = busca.toLowerCase();
  const avulsasFiltradas = avulsas
    .filter((o) => o.nome.toLowerCase().includes(q))
    .slice(0, 80);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAberto((v) => !v)}
        className="flex min-w-[150px] items-center justify-between gap-2 rounded-sm border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 hover:border-neutral-400"
      >
        <span className="truncate">
          {label}
          {selecionados.length > 0 && (
            <span className="ml-1 rounded-full bg-primary-900 px-1.5 py-0.5 text-xs text-white">
              {selecionados.length}
            </span>
          )}
        </span>
        <ChevronDown size={16} className="shrink-0 text-neutral-400" />
      </button>

      {aberto && (
        <div className="absolute z-50 mt-1 max-h-80 w-72 overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-neutral-100 p-2">
            <input
              autoFocus
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar..."
              className="w-full rounded-sm border border-neutral-200 px-2 py-1 text-sm focus:border-primary-700 focus:outline-none"
            />
            {selecionados.length > 0 && (
              <button
                onClick={() => onSetMulti([])}
                className="shrink-0 rounded-sm p-1 text-neutral-400 hover:bg-neutral-100 hover:text-danger-600"
                title="Limpar"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <ul className="max-h-64 overflow-y-auto py-1">
            {/* grupos (nível 1) */}
            {grupos.map(({ rotulo, idxs }) => {
              const marcados = idxs.filter((i) => sel.has(i)).length;
              const todos = marcados === idxs.length;
              const alguns = marcados > 0 && !todos;
              const membrosFiltrados = idxs
                .map((idx) => ({ nome: opcoes[idx], idx }))
                .filter((o) => o.nome.toLowerCase().includes(q))
                .slice(0, 200);
              // com busca, expande o grupo se houver match dentro dele
              const aberta = expandido[rotulo] || (q !== "" && membrosFiltrados.length > 0);
              // se buscando e o grupo não tem match nem no rótulo, some
              const rotuloCasa = rotulo.toLowerCase().includes(q);
              if (q !== "" && !rotuloCasa && membrosFiltrados.length === 0) return null;

              return (
                <li key={rotulo}>
                  <div className="flex w-full items-center">
                    <button
                      onClick={() => toggleGrupo(idxs, todos)}
                      className="flex flex-1 items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-neutral-50"
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-xs border ${
                          todos || alguns
                            ? "border-primary-800 bg-primary-800 text-white"
                            : "border-neutral-300"
                        }`}
                      >
                        {todos && <Check size={12} />}
                        {alguns && <Minus size={12} />}
                      </span>
                      <span className="font-medium">
                        {rotulo}{" "}
                        <span className="text-neutral-400">
                          ({marcados > 0 ? `${marcados}/` : ""}
                          {idxs.length})
                        </span>
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        setExpandido((e) => ({ ...e, [rotulo]: !aberta }))
                      }
                      className="shrink-0 p-1.5 text-neutral-400 hover:text-neutral-700"
                      title={aberta ? "Recolher" : "Expandir"}
                    >
                      {aberta ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  </div>

                  {aberta && (
                    <ul className="border-l border-neutral-100 pl-3">
                      {membrosFiltrados.map(({ nome, idx }) => {
                        const marcado = sel.has(idx);
                        return (
                          <li key={idx}>
                            <button
                              onClick={() => toggleUm(idx)}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-neutral-50"
                            >
                              <span
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-xs border ${
                                  marcado
                                    ? "border-primary-800 bg-primary-800 text-white"
                                    : "border-neutral-300"
                                }`}
                              >
                                {marcado && <Check size={12} />}
                              </span>
                              <span className="truncate text-neutral-600">{nome}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}

            {/* origens avulsas (nível 1) */}
            {avulsasFiltradas.map(({ nome, idx }) => {
              const marcado = sel.has(idx);
              return (
                <li key={idx}>
                  <button
                    onClick={() => toggleUm(idx)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-neutral-50"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-xs border ${
                        marcado
                          ? "border-primary-800 bg-primary-800 text-white"
                          : "border-neutral-300"
                      }`}
                    >
                      {marcado && <Check size={12} />}
                    </span>
                    <span className="truncate">{nome}</span>
                  </button>
                </li>
              );
            })}

            {avulsasFiltradas.length === 0 && grupos.length === 0 && (
              <li className="px-3 py-2 text-sm text-neutral-400">Nenhum resultado</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
