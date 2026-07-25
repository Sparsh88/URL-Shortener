import { create } from 'zustand';

interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const savedTheme = localStorage.getItem('linkforge-theme');
const initialDark = savedTheme ? savedTheme === 'dark' : true;

if (initialDark) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDarkMode: initialDark,
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.isDarkMode;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('linkforge-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('linkforge-theme', 'light');
      }
      return { isDarkMode: next };
    }),
}));
