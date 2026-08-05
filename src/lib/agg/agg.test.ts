import { describe, expect, it } from "vitest";
import { allRows, dicts, fluxo } from "../../data/loadData";
import { tabelaAnalitica } from "./analitico";
import { cardsFluxo, filtrarDetalhe } from "./fluxo";
import { calcularKpis, gerarInsights } from "./kpis";
import { churnPorFaixaLifetime } from "./lifetime";

describe("KPIs sobre o universo completo (sem filtro)", () => {
  const kpi = calcularKpis(allRows);

  it("total bate com o universo de análise", () => {
    // faixa ampla: o universo cresce a cada atualização de dados
    expect(kpi.total).toBeGreaterThan(18000);
    expect(kpi.total).toBeLessThan(21000);
  });

  it("churn comportamental ~15%", () => {
    expect(kpi.nChurned).toBeGreaterThan(2500);
    expect(kpi.nChurned).toBeLessThan(4000);
    expect(kpi.churnRate).toBeGreaterThan(13);
    expect(kpi.churnRate).toBeLessThan(18);
  });

  it("% sem payback ~23%", () => {
    expect(kpi.pctSemPayback).toBeGreaterThan(21);
    expect(kpi.pctSemPayback).toBeLessThan(25);
  });

  it("MRR perdido ~R$1M", () => {
    expect(kpi.mrrPerdido).toBeGreaterThan(900000);
    expect(kpi.mrrPerdido).toBeLessThan(1200000);
  });

  it("ticket churn < ticket ativo", () => {
    expect(kpi.ticketChurn).toBeLessThan(kpi.ticketAtivo);
  });
});

describe("faixas de lifetime", () => {
  it("soma das faixas = total de churned e acumulado chega a 100%", () => {
    const nChurned = calcularKpis(allRows).nChurned;
    const f = churnPorFaixaLifetime(allRows);
    const soma = f.reduce((a, x) => a + x.qtd, 0);
    expect(soma).toBe(nChurned); // invariante: cada churned cai em 1 faixa
    expect(f[f.length - 1].pctAcumulado).toBeCloseTo(100, 5);
  });
});

describe("tabela analítica", () => {
  const t = tabelaAnalitica(allRows);

  it("traz uma linha por cancelado", () => {
    expect(t.length).toBe(calcularKpis(allRows).nChurned);
  });

  it("tem url, datas e valor preenchidos por linha", () => {
    const l = t[0];
    expect(l.url).toMatch(/\./); // parece uma url/dominio
    expect(l.dataCancelamento).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(l.dataCriacao).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(l).toHaveProperty("motivo");
    expect(l).toHaveProperty("vendedor");
  });

  it("ordena por data de cancelamento desc", () => {
    expect(t[0].dataCancelamento >= t[t.length - 1].dataCancelamento).toBe(true);
  });

  it("marca churns provisórios (saída < 30 dias)", () => {
    const prov = t.filter((l) => l.provisorio);
    expect(prov.length).toBeGreaterThan(0);
    // todo provisório tem data de cancelamento recente
    const maisAntigo = prov.reduce(
      (min, l) => (l.dataCancelamento < min ? l.dataCancelamento : min),
      "9999",
    );
    expect(maisAntigo >= "2026-05").toBe(true);
  });
});

describe("insights", () => {
  it("gera ao menos o insight de payback", () => {
    const ins = gerarInsights(allRows, dicts);
    expect(ins.length).toBeGreaterThanOrEqual(1);
    expect(ins[0].titulo).toMatch(/payback/i);
  });
});

describe("fluxo — cartões filtráveis", () => {
  const semFiltro = { segmentos: [], origens: [], vendedores: [] };

  it("sem filtro devolve o detalhe inteiro e bate o total do mensal", () => {
    const det = filtrarDetalhe(fluxo.detalhe, semFiltro);
    expect(det.length).toBe(fluxo.detalhe.length);

    const somaEntrou = fluxo.mensal.reduce((a, m) => a + m.entraram, 0);
    const somaSaiu = fluxo.mensal.reduce((a, m) => a + m.sairam, 0);
    const c = cardsFluxo(allRows, det);
    expect(c.entraram).toBe(somaEntrou);
    expect(c.sairam).toBe(somaSaiu);
    expect(c.saldo).toBe(somaEntrou - somaSaiu);
  });

  it("base = clientes ativos (rows filtradas)", () => {
    const ativos = allRows.filter((r) => r.st === 0).length;
    expect(cardsFluxo(allRows, []).base).toBe(ativos);
  });

  it("filtrar por segmento reduz o detalhe e recalcula os cartões", () => {
    // usa um segmento presente no detalhe
    const alvo = fluxo.detalhe.find((d) => d.seg !== null)!.seg!;
    const det = filtrarDetalhe(fluxo.detalhe, { ...semFiltro, segmentos: [alvo] });

    expect(det.length).toBeGreaterThan(0);
    expect(det.length).toBeLessThan(fluxo.detalhe.length);
    expect(det.every((d) => d.seg === alvo)).toBe(true);

    const rowsSeg = allRows.filter((r) => r.seg === alvo);
    const c = cardsFluxo(rowsSeg, det);
    expect(c.entraram + c.sairam).toBe(det.length);
    expect(c.saldo).toBe(c.entraram - c.sairam);
  });

  it("registro sem cadastro (índice null) não passa quando o filtro está ativo", () => {
    const semSeg = fluxo.detalhe.filter((d) => d.seg === null);
    if (semSeg.length === 0) return; // nada a testar se todos têm cadastro
    // qualquer filtro de segmento exclui os sem cadastro
    const det = filtrarDetalhe(fluxo.detalhe, { ...semFiltro, segmentos: [0] });
    expect(det.some((d) => d.seg === null)).toBe(false);
  });

  it("filtrar por mês restringe o detalhe ao mês do movimento", () => {
    const mesAlvo = fluxo.detalhe[0].mes; // um mês presente
    const det = filtrarDetalhe(fluxo.detalhe, { ...semFiltro, meses: [mesAlvo] });

    expect(det.length).toBeGreaterThan(0);
    expect(det.length).toBeLessThan(fluxo.detalhe.length);
    expect(det.every((d) => d.mes === mesAlvo)).toBe(true);

    // bate com o total do mês no bloco mensal
    const m = fluxo.mensal.find((x) => x.mes === mesAlvo)!;
    const c = cardsFluxo(allRows, det);
    expect(c.entraram).toBe(m.entraram);
    expect(c.sairam).toBe(m.sairam);
  });
});
