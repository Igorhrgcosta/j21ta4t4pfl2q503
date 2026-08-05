// Contrato do dashboard.json (gerado por dashboard/export_dashboard_data.py)

export interface Row {
  st: 0 | 1; // 0 = ativo, 1 = churned
  sm: string | null; // mês de saída "YYYY-MM" (null se ativo)
  lt: number; // lifetime em dias
  es: number | null; // índice do estágio de churn (null se ativo)
  pb: 0 | 1; // 1 = payback atingido
  mr: number | null; // mrr (medio p/ churned, atual p/ ativo)
  seg: number | null; // índice segmento
  ori: number | null; // índice origem
  vnd: number | null; // índice vendedor
  mot: number | null; // índice motivo_categoria
  tip: number | null; // índice tipo
  // campos extras — presentes apenas em linhas churned (tabela analítica)
  u?: string; // url
  mraw?: string | null; // motivo_raw (texto)
  dc?: string | null; // data de criação "YYYY-MM-DD"
  ds?: string | null; // data de saída (cancelamento) "YYYY-MM-DD"
  pv?: 0 | 1; // churn provisório (saída < 30 dias, tolerância em aberto)
  con?: number | null; // índice concorrente (texto livre do CRM)
}

export interface Dicts {
  seg: string[];
  ori: string[];
  vnd: string[];
  tip: string[];
  est: string[];
  mot: string[];
  con: string[];
}

export interface ConcorrenteTop {
  nome: string;
  n: number;
}

// Bloco de fluxo/temporal (agregados globais — grão subdominio×mês; não
// respondem aos filtros de linha). Análises que a gold do churn_2 destrava.
export interface FluxoMensal {
  mes: string;
  base_inicio: number;
  entraram: number;
  sairam: number;
  base_fim: number;
  liquido: number;
  taxa_saida_pct: number;
}
export interface FluxoYtd {
  data: string;
  entrou_ytd: number;
  saiu_ytd: number;
  liquido_ytd: number;
  total: number;
}
export interface FluxoDetalhe {
  mes: string;
  subdominio: string;
  evento: "entrou" | "saiu";
  // dia exato do evento "YYYY-MM-DD": último dia visto (saiu) ou primeiro (entrou)
  data_evento: string | null;
  segmento: string;
  // índices dos mesmos dicts das rows (null = sem cadastro / fora do dict)
  seg: number | null;
  ori: number | null;
  vnd: number | null;
}
// dia_util: uma linha por ordinal de dia útil; colunas dinâmicas por mês ("YYYY-MM")
export type FluxoDiaUtil = { dia_util: number } & Record<string, number | null>;
// métrica selecionável na tabela "Fluxo por dia útil (MoM)"
export type MetricaDiaUtil = "base" | "entrou" | "saiu" | "saiu_pagante";
// um pivô DU×mês por métrica (servidores / entradas / saídas acumuladas no mês)
export type FluxoDiaUtilPorMetrica = Record<MetricaDiaUtil, FluxoDiaUtil[]>;

export interface CoorteRetencao {
  coorte: string; // "YYYY-MM" da coorte
  n: number; // tamanho da coorte (subdomínios pagantes)
  retencao: number[]; // % presente por offset (0 = 100%)
}

export type VisaoCoorte = "pagantes" | "entrantes";
export type CoortePorVisao = Record<VisaoCoorte, CoorteRetencao[]>;

// base de início do mês pré-agregada por (mês, seg, ori, vnd) com contagem —
// denominador filtrável da taxa de saída mensal
export interface BaseMensal {
  mes: string;
  seg: number | null;
  ori: number | null;
  vnd: number | null;
  n: number;
}

export interface Fluxo {
  mensal: FluxoMensal[];
  ytd: FluxoYtd[];
  dia_util: FluxoDiaUtilPorMetrica;
  coorte: CoortePorVisao;
  base_mensal: BaseMensal[];
  detalhe: FluxoDetalhe[];
}

export interface DashboardData {
  meta: {
    gerado_em: string;
    total_urls: number;
    dicts: Dicts;
  };
  rows: Row[];
  agg: {
    concorrentes_top: ConcorrenteTop[];
  };
  fluxo: Fluxo;
}

export type ScreenId =
  | "executiva"
  | "tempo-vida"
  | "origem"
  | "financeiro"
  | "motivos"
  | "ltv"
  | "analitico"
  | "fluxo-mensal"
  | "evolucao-temporal";

export interface FilterState {
  meses: number[]; // índices de meses de saída selecionados (multi)
  segmentos: number[];
  origens: number[];
  vendedores: number[];
  estagios: number[];
}
