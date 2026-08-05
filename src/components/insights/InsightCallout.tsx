import { AlertTriangle, Info, TrendingDown } from "lucide-react";
import type { Insight } from "../../lib/agg/kpis";

const ESTILO = {
  danger: {
    bg: "bg-danger-50",
    border: "border-danger-600",
    icon: "text-danger-700",
    Icon: TrendingDown,
  },
  warning: {
    bg: "bg-warning-50",
    border: "border-warning-200",
    icon: "text-warning-600",
    Icon: AlertTriangle,
  },
  info: {
    bg: "bg-primary-50",
    border: "border-primary-200",
    icon: "text-primary-700",
    Icon: Info,
  },
} as const;

export function InsightCallout({ insight }: { insight: Insight }) {
  const e = ESTILO[insight.tipo];
  const Icon = e.Icon;
  return (
    <div
      className={`flex gap-3 rounded-md border ${e.border} ${e.bg} p-4`}
      role="note"
    >
      <Icon className={`mt-0.5 shrink-0 ${e.icon}`} size={20} />
      <div>
        <p className="font-title text-sm font-semibold text-neutral-950">
          {insight.titulo}
        </p>
        <p className="mt-1 text-sm leading-normal text-neutral-700">
          {insight.texto}
        </p>
      </div>
    </div>
  );
}
