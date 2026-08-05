import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  label: string;
  opcoes: string[]; // labels indexadas (índice = valor)
  selecionados: number[];
  onToggle: (idx: number) => void;
  onLimpar: () => void;
}

export function MultiSelect({
  label,
  opcoes,
  selecionados,
  onToggle,
  onLimpar,
}: Props) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function fora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setAberto(false);
    }
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, []);

  const filtradas = opcoes
    .map((nome, idx) => ({ nome, idx }))
    .filter((o) => o.nome.toLowerCase().includes(busca.toLowerCase()))
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
                onClick={onLimpar}
                className="shrink-0 rounded-sm p-1 text-neutral-400 hover:bg-neutral-100 hover:text-danger-600"
                title="Limpar"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {filtradas.map(({ nome, idx }) => {
              const marcado = selecionados.includes(idx);
              return (
                <li key={idx}>
                  <button
                    onClick={() => onToggle(idx)}
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
            {filtradas.length === 0 && (
              <li className="px-3 py-2 text-sm text-neutral-400">
                Nenhum resultado
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
