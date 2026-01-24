import { darkColors, lightColors } from '../lib/theme';
import { useAppStore } from '../store/usePomodoroStore';

export function useAppTheme() {
  const { theme, toggleTheme, setTheme } = useAppStore();
  const themeColors = theme === 'dark' ? darkColors : lightColors;
  const isDark = theme === 'dark';

  return {
    theme,
    toggleTheme,
    setTheme,
    colors: themeColors,
    isDark,
  };
}
