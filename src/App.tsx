import { FilterBar } from "./components/layout/FilterBar";
import { SidebarNav } from "./components/layout/SidebarNav";
import { useFilters } from "./state/filtersStore";
import { Analitico } from "./screens/Analitico";
import { ChurnTempoVida } from "./screens/ChurnTempoVida";
import { EvolucaoTemporal } from "./screens/EvolucaoTemporal";
import { FluxoMensal } from "./screens/FluxoMensal";
import { ImpactoFinanceiro } from "./screens/ImpactoFinanceiro";
import { LtvEvolucao } from "./screens/LtvEvolucao";
import { MotivosReais } from "./screens/MotivosReais";
import { OrigemChurn } from "./screens/OrigemChurn";
import { VisaoExecutiva } from "./screens/VisaoExecutiva";

export default function App() {
  const tela = useFilters((s) => s.tela);

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <FilterBar />
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-6">
          {tela === "executiva" && <VisaoExecutiva />}
          {tela === "tempo-vida" && <ChurnTempoVida />}
          {tela === "origem" && <OrigemChurn />}
          {tela === "financeiro" && <ImpactoFinanceiro />}
          {tela === "motivos" && <MotivosReais />}
          {tela === "ltv" && <LtvEvolucao />}
          {tela === "analitico" && <Analitico />}
          {tela === "fluxo-mensal" && <FluxoMensal />}
          {tela === "evolucao-temporal" && <EvolucaoTemporal />}
        </main>
      </div>
    </div>
  );
}
