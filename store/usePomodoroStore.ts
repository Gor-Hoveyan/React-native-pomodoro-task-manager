import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import i18n from '../lib/i18n';

export type AppTheme = 'light' | 'dark';
export type AppLanguage = 'en' | 'hy' | 'ru';

interface AppState {
  // Persistence state
  isHydrated: boolean;
  
  // Timer Durations
  pomodoroDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  
  // Settings
  theme: AppTheme;
  language: AppLanguage;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  
  // Actions
  setHydrated: (state: boolean) => void;
  setPomodoroDuration: (duration: number) => void;
  setShortBreakDuration: (duration: number) => void;
  setLongBreakDuration: (duration: number) => void;
  toggleTheme: () => void;
  setTheme: (theme: AppTheme) => void;
  setLanguage: (lang: AppLanguage) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isHydrated: false,
      pomodoroDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      theme: 'light',
      language: (i18n.language as AppLanguage) || 'en',
      soundEnabled: true,
      hapticsEnabled: true,
      
      setHydrated: (state: boolean) => set({ isHydrated: state }),
      setPomodoroDuration: (duration: number) => set({ pomodoroDuration: duration }),
      setShortBreakDuration: (duration: number) => set({ shortBreakDuration: duration }),
      setLongBreakDuration: (duration: number) => set({ longBreakDuration: duration }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme: AppTheme) => set({ theme }),
      setLanguage: (lang: AppLanguage) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },
      setSoundEnabled: (enabled: boolean) => set({ soundEnabled: enabled }),
      setHapticsEnabled: (enabled: boolean) => set({ hapticsEnabled: enabled }),
      reset: () => set({
        pomodoroDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        theme: 'light',
        language: 'en',
        soundEnabled: true,
        hapticsEnabled: true,
      }),
    }),
    {
      name: 'app-storage-v2',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        if (state?.language) {
          i18n.changeLanguage(state.language);
        }
      },
    }
  )
);

// Backward compatibility
export const usePomodoroStore = useAppStore;
