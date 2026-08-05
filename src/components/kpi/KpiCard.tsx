import { Box } from "@ikatec/nebula-react";

type Tom = "neutral" | "danger" | "warning" | "success";

const TOM_COR: Record<Tom, string> = {
  neutral: "text-primary-900",
  danger: "text-danger-600",
  warning: "text-warning-600",
  success: "text-success-600",
};

interface Props {
  label: string;
  valor: string;
  sub?: string;
  tom?: Tom;
}

export function KpiCard({ label, valor, sub, tom = "neutral" }: Props) {
  return (
    <Box border paddingSize="lg" shadow="sm" className="rounded-md bg-white">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className={`mt-2 font-title text-3xl font-bold ${TOM_COR[tom]}`}>
        {valor}
      </p>
      {sub && <p className="mt-1 text-sm text-neutral-500">{sub}</p>}
    </Box>
  );
}
