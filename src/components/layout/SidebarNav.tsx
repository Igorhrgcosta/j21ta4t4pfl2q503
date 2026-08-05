import {
  Activity,
  BarChart3,
  CalendarRange,
  Clock,
  DollarSign,
  LayoutDashboard,
  MessageSquareWarning,
  Table,
  TrendingUp,
} from "lucide-react";
import { useFilters } from "../../state/filtersStore";
import type { ScreenId } from "../../types/dashboard";

const ITENS: { id: ScreenId; label: string; Icon: typeof LayoutDashboard }[] = [
  { id: "executiva", label: "Visão Executiva", Icon: LayoutDashboard },
  { id: "origem", label: "Origem do Churn", Icon: BarChart3 },
  { id: "financeiro", label: "Impacto Financeiro", Icon: DollarSign },
  { id: "motivos", label: "Motivos Reais", Icon: MessageSquareWarning },
  { id: "tempo-vida", label: "Churn por Tempo de Vida", Icon: Clock },
  { id: "ltv", label: "LTV e Evolução", Icon: TrendingUp },
  { id: "fluxo-mensal", label: "Fluxo Mensal", Icon: Activity },
  { id: "evolucao-temporal", label: "Evolução Temporal", Icon: CalendarRange },
  { id: "analitico", label: "Analítico", Icon: Table },
];

export function SidebarNav() {
  const tela = useFilters((s) => s.tela);
  const setTela = useFilters((s) => s.setTela);

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-neutral-200 bg-white">
      <div className="border-b border-neutral-100 px-6 py-5">
        <h1 className="font-title text-lg font-bold text-primary-900">
          Churn Analytics
        </h1>
        <p className="text-xs text-neutral-500">DigiSac · SaaS</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {ITENS.map(({ id, label, Icon }) => {
          const ativo = tela === id;
          return (
            <button
              key={id}
              onClick={() => setTela(id)}
              className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                ativo
                  ? "bg-primary-900 text-white"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
              aria-current={ativo ? "page" : undefined}
            >
              <Icon size={18} className="shrink-0" />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
      <div className="border-t border-neutral-100 px-6 py-4">
        <p className="text-xs text-neutral-400">
          Fonte comportamental: servers-list
        </p>
      </div>
    </aside>
  );
}
