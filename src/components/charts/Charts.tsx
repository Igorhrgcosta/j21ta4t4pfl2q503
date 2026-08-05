import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Customized,
  LabelList,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { COR } from "./palette";

const eixoStyle = { fontSize: 12, fill: COR.neutralDark, fontFamily: "Figtree" };
const grid = "#edeef1";
const rotuloStyle = { fontSize: 10, fill: COR.neutralDark, fontFamily: "Figtree" };

interface Datum {
  [k: string]: number | string;
}

/** Formata o valor de um rótulo de dado; oculta zero/nulo para não poluir. */
const rotuloFmt = (fmt?: (v: number) => string) => (v: unknown) => {
  const n = Number(v);
  if (!Number.isFinite(n) || n === 0) return "";
  return fmt ? fmt(n) : String(n);
};

/** Barras verticais simples. */
export function BarrasV({
  data,
  xKey,
  barKey,
  cor = COR.primary,
  fmt,
  altura = 300,
}: {
  data: Datum[];
  xKey: string;
  barKey: string;
  cor?: string;
  fmt?: (v: number) => string;
  altura?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={data} margin={{ top: 22, right: 8, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={eixoStyle}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis
          tick={eixoStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={fmt ? (v) => fmt(Number(v)) : undefined}
        />
        <Tooltip
          formatter={(v) => (fmt ? fmt(Number(v)) : v)}
          contentStyle={{ fontFamily: "Figtree", fontSize: 13, borderRadius: 8 }}
        />
        <Bar dataKey={barKey} fill={cor} radius={[4, 4, 0, 0]}>
          <LabelList
            dataKey={barKey}
            position="top"
            style={rotuloStyle}
            formatter={rotuloFmt(fmt)}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Trunca rótulos longos do eixo, preservando início (o tooltip mostra o nome completo). */
const truncarLabel = (v: unknown, max = 22) => {
  const s = String(v);
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
};

/** Barras horizontais (ranking). */
export function BarrasH({
  data,
  yKey,
  barKey,
  cor = COR.primary,
  fmt,
  altura = 360,
  larguraLabel = 190,
}: {
  data: Datum[];
  yKey: string;
  barKey: string;
  cor?: string;
  fmt?: (v: number) => string;
  altura?: number;
  larguraLabel?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 24, bottom: 4, left: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={grid} horizontal={false} />
        <XAxis
          type="number"
          tick={eixoStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={fmt ? (v) => fmt(Number(v)) : undefined}
        />
        <YAxis
          type="category"
          dataKey={yKey}
          tick={eixoStyle}
          axisLine={false}
          tickLine={false}
          width={larguraLabel}
          tickFormatter={(v) => truncarLabel(v)}
        />
        <Tooltip
          formatter={(v) => (fmt ? fmt(Number(v)) : v)}
          contentStyle={{ fontFamily: "Figtree", fontSize: 13, borderRadius: 8 }}
        />
        <Bar dataKey={barKey} fill={cor} radius={[0, 4, 4, 0]}>
          <LabelList
            dataKey={barKey}
            position="right"
            style={rotuloStyle}
            formatter={rotuloFmt(fmt)}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Combo: barras (qtd) + linha (% acumulado) — Tela 2. */
export function ComboBarraLinha({
  data,
  xKey,
  barKey,
  lineKey,
  barCor = COR.primary,
  lineCor = COR.danger,
  altura = 320,
}: {
  data: Datum[];
  xKey: string;
  barKey: string;
  lineKey: string;
  barCor?: string;
  lineCor?: string;
  altura?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <ComposedChart data={data} margin={{ top: 22, right: 8, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={eixoStyle}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis
          yAxisId="left"
          tick={eixoStyle}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={eixoStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{ fontFamily: "Figtree", fontSize: 13, borderRadius: 8 }}
        />
        <Legend wrapperStyle={{ fontFamily: "Figtree", fontSize: 12 }} />
        <Bar
          yAxisId="left"
          dataKey={barKey}
          name="Cancelamentos"
          fill={barCor}
          radius={[4, 4, 0, 0]}
        >
          <LabelList
            dataKey={barKey}
            position="top"
            style={rotuloStyle}
            formatter={rotuloFmt()}
          />
        </Bar>
        <Line
          yAxisId="right"
          type="monotone"
          dataKey={lineKey}
          name="% acumulado"
          stroke={lineCor}
          strokeWidth={2}
          dot={{ r: 3 }}
        >
          <LabelList
            dataKey={lineKey}
            position="top"
            style={{ ...rotuloStyle, fill: lineCor }}
            formatter={(v: unknown) => `${Math.round(Number(v))}%`}
          />
        </Line>
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/** Barras agrupadas — 2 séries lado a lado, uma escala (ex.: entrou vs saiu). */
export function BarrasAgrupadas({
  data,
  xKey,
  series,
  altura = 320,
  fmt,
}: {
  data: Datum[];
  xKey: string;
  series: { key: string; nome: string; cor: string }[];
  altura?: number;
  fmt?: (v: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={data} margin={{ top: 22, right: 8, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={eixoStyle}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis
          tick={eixoStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={fmt ? (v) => fmt(Number(v)) : undefined}
        />
        <Tooltip
          formatter={(v) => (fmt ? fmt(Number(v)) : v)}
          contentStyle={{ fontFamily: "Figtree", fontSize: 13, borderRadius: 8 }}
        />
        <Legend wrapperStyle={{ fontFamily: "Figtree", fontSize: 12 }} />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.nome} fill={s.cor} radius={[4, 4, 0, 0]}>
            <LabelList
              dataKey={s.key}
              position="top"
              style={rotuloStyle}
              formatter={rotuloFmt(fmt)}
            />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Linha(s) temporal(is) — uma escala; legenda quando há 2+ séries. */
export function LinhaMulti({
  data,
  xKey,
  series,
  altura = 320,
  fmt,
  soExtremos = false,
}: {
  data: Datum[];
  xKey: string;
  series: { key: string; nome: string; cor: string }[];
  altura?: number;
  fmt?: (v: number) => string;
  /** mostra apenas o primeiro e o último rótulo no eixo X (séries longas). */
  soExtremos?: boolean;
}) {
  // quando soExtremos, fixa os ticks nas pontas (evita poluição de datas)
  const ticks =
    soExtremos && data.length
      ? [data[0][xKey], data[data.length - 1][xKey]]
      : undefined;
  // rótulos em cada ponto só fazem sentido em séries curtas; em séries longas
  // (diárias, soExtremos) poluiriam — nesses casos o tooltip cobre a leitura.
  const mostrarRotulos = !soExtremos && data.length <= 14;
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <ComposedChart data={data} margin={{ top: 22, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={eixoStyle}
          axisLine={false}
          tickLine={false}
          ticks={ticks}
          interval={soExtremos ? "preserveStartEnd" : undefined}
        />
        <YAxis
          tick={eixoStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={fmt ? (v) => fmt(Number(v)) : undefined}
        />
        <Tooltip
          formatter={(v) => (fmt ? fmt(Number(v)) : v)}
          contentStyle={{ fontFamily: "Figtree", fontSize: 13, borderRadius: 8 }}
        />
        {series.length > 1 && (
          <Legend wrapperStyle={{ fontFamily: "Figtree", fontSize: 12 }} />
        )}
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.nome}
            stroke={s.cor}
            strokeWidth={2}
            dot={mostrarRotulos ? { r: 3 } : false}
          >
            {mostrarRotulos && (
              <LabelList
                dataKey={s.key}
                position="top"
                style={{ ...rotuloStyle, fill: s.cor }}
                formatter={rotuloFmt(fmt)}
              />
            )}
          </Line>
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/** Camada de rótulos das barras divergentes, desenhada via <Customized>.
 * Lê a geometria já calculada de cada barra (formattedGraphicalItems[0].props.points):
 * cada ponto tem x, y, width, height, value. Posiciona o texto acima do topo
 * (positivo) ou abaixo da base (negativo). É o caminho confiável no Recharts 2.13,
 * onde o content/position do LabelList erra as barras negativas. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RotulosDivergentes({ cprops, fmt }: { cprops: any; fmt?: (v: number) => string }) {
  const itens = cprops?.formattedGraphicalItems;
  const pontos = itens?.[0]?.props?.data;
  if (!Array.isArray(pontos)) return null;
  return (
    <g>
      {pontos.map((p: any, i: number) => {
        const v = Number(p.value);
        if (!Number.isFinite(v) || v === 0) return null;
        const cx = p.x + p.width / 2;
        // Recharts dá height NEGATIVO para barras que descem. O topo visível é
        // min(y, y+height) e a base é max(y, y+height). Positivo: acima do topo.
        // Negativo: abaixo da base.
        const yTopo = Math.min(p.y, p.y + p.height);
        const yBase = Math.max(p.y, p.y + p.height);
        const ty = v > 0 ? yTopo - 6 : yBase + 14;
        return (
          <text
            key={i}
            x={cx}
            y={ty}
            textAnchor="middle"
            fontSize={10}
            fontFamily="Figtree"
            fill={COR.neutralDark}
          >
            {fmt ? fmt(v) : String(v)}
          </text>
        );
      })}
    </g>
  );
}

/**
 * Colunas divergentes (ganhos/perdas): eixo com zero no meio, colunas verdes
 * acima e vermelhas abaixo. Uma série só — a polaridade (cor + posição vs zero)
 * carrega o significado, então dispensa legenda. Linha de referência em zero.
 */
export function BarrasDivergentes({
  data,
  xKey,
  barKey,
  corPos = COR.success,
  corNeg = COR.danger,
  fmt,
  altura = 320,
}: {
  data: Datum[];
  xKey: string;
  barKey: string;
  corPos?: string;
  corNeg?: string;
  fmt?: (v: number) => string;
  altura?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={data} margin={{ top: 22, right: 8, bottom: 30, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={eixoStyle}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis
          tick={eixoStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={fmt ? (v) => fmt(Number(v)) : undefined}
          // folga de ~18% nas pontas para o rótulo (que fica FORA da barra) não
          // colar no eixo X (barra negativa mais longa) nem no topo do card.
          domain={[
            (min: number) => (min < 0 ? Math.floor(min * 1.18) : 0),
            (max: number) => Math.ceil(max * 1.12),
          ]}
        />
        <Tooltip
          formatter={(v) => (fmt ? fmt(Number(v)) : v)}
          contentStyle={{ fontFamily: "Figtree", fontSize: 13, borderRadius: 8 }}
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
        />
        <ReferenceLine y={0} stroke={COR.neutralDark} strokeWidth={1} />
        <Bar dataKey={barKey}>
          {data.map((d, i) => {
            const v = Number(d[barKey]);
            const positivo = v >= 0;
            return (
              <Cell
                key={i}
                fill={positivo ? corPos : corNeg}
                // arredonda o topo (positivo) ou a base (negativo)
                radius={
                  positivo
                    ? ([4, 4, 0, 0] as unknown as number)
                    : ([0, 0, 4, 4] as unknown as number)
                }
              />
            );
          })}
        </Bar>
        {/* Rótulos desenhados numa camada própria a partir da geometria REAL de
            cada barra (formattedGraphicalItems do Customized). No Recharts 2.13 o
            LabelList/content não posiciona barras negativas de forma confiável;
            aqui calculamos: positivo -> acima do topo, negativo -> abaixo da base. */}
        <Customized
          component={(props: unknown) => (
            <RotulosDivergentes cprops={props} fmt={fmt} />
          )}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Barras verticais com cor por item (destaque precoce vs tardio). */
export function BarrasVColorida({
  data,
  xKey,
  barKey,
  cores,
  fmt,
  altura = 300,
}: {
  data: Datum[];
  xKey: string;
  barKey: string;
  cores: string[];
  fmt?: (v: number) => string;
  altura?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={data} margin={{ top: 22, right: 8, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={eixoStyle}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis
          tick={eixoStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={fmt ? (v) => fmt(Number(v)) : undefined}
        />
        <Tooltip
          formatter={(v) => (fmt ? fmt(Number(v)) : v)}
          contentStyle={{ fontFamily: "Figtree", fontSize: 13, borderRadius: 8 }}
        />
        <Bar dataKey={barKey} radius={[4, 4, 0, 0]}>
          <LabelList
            dataKey={barKey}
            position="top"
            style={rotuloStyle}
            formatter={rotuloFmt(fmt)}
          />
          {data.map((_, i) => (
            <Cell key={i} fill={cores[i % cores.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
