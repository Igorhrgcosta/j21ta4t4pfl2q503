const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const num = new Intl.NumberFormat("pt-BR");

export const fmtBRL = (v: number) => brl.format(v);

/** R$ compacto e CURTO — usa "k"/"mi" em vez de "mil"/"milhões" para caber como
 * rótulo sobre barras estreitas (ex.: "R$ 243k" em vez de "R$ 242,9 mil").
 * Uma casa decimal só abaixo de 100k (onde ela ainda cabe). */
export const fmtBRLCompact = (v: number) => {
  const abs = Math.abs(v);
  const br1 = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  if (abs >= 1_000_000) return `R$ ${br1(v / 1_000_000)}mi`;
  if (abs >= 100_000) return `R$ ${Math.round(v / 1000)}k`;
  if (abs >= 1_000) return `R$ ${br1(v / 1000)}k`;
  return brl.format(v);
};
export const fmtNum = (v: number) => num.format(v);
export const fmtPct = (v: number, casas = 1) =>
  `${v.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })}%`;

const MESES = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

/** "2026-03" -> "mar/26" */
export const fmtMes = (ym: string) => {
  const [ano, mes] = ym.split("-");
  return `${MESES[Number(mes) - 1]}/${ano.slice(2)}`;
};

/** "2026-06-15" -> "15/06/2026" (null/valor não-ISO -> "—") */
export const fmtData = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return "—"; // não é ISO (ex.: já veio "—")
  const [, ano, mes, dia] = m;
  return `${dia}/${mes}/${ano}`;
};
