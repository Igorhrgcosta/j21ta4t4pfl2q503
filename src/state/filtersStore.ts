import { create } from "zustand";
import type { FilterState, ScreenId } from "../types/dashboard";

interface Store extends FilterState {
  tela: ScreenId;
  setTela: (t: ScreenId) => void;
  toggle: (campo: keyof FilterState, valor: number) => void;
  setMulti: (campo: keyof FilterState, valores: number[]) => void;
  reset: () => void;
}

const ESTADO_INICIAL: FilterState = {
  meses: [],
  segmentos: [],
  origens: [],
  vendedores: [],
  estagios: [],
};

export const useFilters = create<Store>((set) => ({
  ...ESTADO_INICIAL,
  tela: "executiva",
  setTela: (t) => set({ tela: t }),
  toggle: (campo, valor) =>
    set((s) => {
      const atual = s[campo] as number[];
      const novo = atual.includes(valor)
        ? atual.filter((v) => v !== valor)
        : [...atual, valor];
      return { [campo]: novo } as Partial<Store>;
    }),
  setMulti: (campo, valores) => set({ [campo]: valores } as Partial<Store>),
  reset: () => set({ ...ESTADO_INICIAL }),
}));
