import { create } from 'zustand'

type SettingsStore = {
  showPinyin: boolean,
  toggleShowPinyin: () => void,

  showTranslation: boolean,
  toggleShowTranslation: () => void,
}


export const useSettings = create<SettingsStore>((set) => ({
  showPinyin: false,
  toggleShowPinyin: () => set((state) => ({ showPinyin: !state.showPinyin })),

  showTranslation: false,
  toggleShowTranslation: () => set((state) => ({ showTranslation: !state.showTranslation })),

  // removeAllBears: () => set({ bears: 0 }),
  // updateBears: (newBears) => set({ bears: newBears }),
}))