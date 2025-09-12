/**
 * 全局状态管理
 */
import { create } from 'zustand';
import http from '@/libs/http';
import themes from '@/pages/ssh/themes';

interface TerminalConfig {
  fontSize: number;
  fontFamily: string;
  theme: string;
  styles: any; // Styles object for xterm
}

interface GlobalState {
  isReady: boolean;
  terminal: TerminalConfig;
  fetchUserSettings: () => Promise<void>;
  updateUserSettings: (key: string, value: any) => Promise<void>;
  updateTerminalConfig: (config: Partial<TerminalConfig>) => void;
}

export const useGlobalStore = create<GlobalState>((set, get) => ({
  isReady: false,
  terminal: {
    fontSize: 16,
    fontFamily: 'Courier',
    theme: 'dark',
    styles: themes.dark,
  },

  fetchUserSettings: async () => {
    if (get().isReady) return;

    try {
      const res: any = await http.get('/api/setting/user/');
      const state = get();

      if (res.terminal) {
        const terminal = JSON.parse(res.terminal);
        const styles = themes[terminal.theme as keyof typeof themes] || themes.dark;
        terminal.styles = styles;

        set({
          isReady: true,
          terminal: { ...state.terminal, ...terminal }
        });
      } else {
        set({ isReady: true });
      }
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
      set({ isReady: true });
    }
  },

  updateUserSettings: async (key: string, value: any) => {
    try {
      const res: any = await http.post('/api/setting/user/', { key, value });
      const state = get();

      if (res.terminal) {
        const terminal = JSON.parse(res.terminal);
        const styles = themes[terminal.theme as keyof typeof themes] || themes.dark;
        terminal.styles = styles;

        set({
          isReady: true,
          terminal: { ...state.terminal, ...terminal }
        });
      }
    } catch (error) {
      console.error('Failed to update user settings:', error);
    }
  },

  updateTerminalConfig: (config: Partial<TerminalConfig>) => {
    set((state) => ({
      terminal: { ...state.terminal, ...config }
    }));
  },
}));

export default useGlobalStore;