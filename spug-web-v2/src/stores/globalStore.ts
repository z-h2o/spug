/**
 * 全局状态管理
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import http from '@/libs/http';

// SSH终端主题配置
const themes = {
  dark: {
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    cursor: '#d4d4d4',
    cursorAccent: '#1e1e1e',
    selection: '#264f78',
    black: '#000000',
    red: '#cd3131',
    green: '#0dbc79',
    yellow: '#e5e510',
    blue: '#2472c8',
    magenta: '#bc3fbc',
    cyan: '#11a8cd',
    white: '#e5e5e5',
    brightBlack: '#666666',
    brightRed: '#f14c4c',
    brightGreen: '#23d18b',
    brightYellow: '#f5f543',
    brightBlue: '#3b8eea',
    brightMagenta: '#d670d6',
    brightCyan: '#29b8db',
    brightWhite: '#ffffff'
  },
  light: {
    background: '#ffffff',
    foreground: '#333333',
    cursor: '#333333',
    cursorAccent: '#ffffff',
    selection: '#add6ff',
    black: '#000000',
    red: '#cd3131',
    green: '#00bc00',
    yellow: '#949800',
    blue: '#0451a5',
    magenta: '#bc05bc',
    cyan: '#0598bc',
    white: '#555555',
    brightBlack: '#666666',
    brightRed: '#cd3131',
    brightGreen: '#14ce14',
    brightYellow: '#b5ba00',
    brightBlue: '#0451a5',
    brightMagenta: '#bc05bc',
    brightCyan: '#0598bc',
    brightWhite: '#a5a5a5'
  }
};

interface TerminalConfig {
  fontSize: number;
  fontFamily: string;
  theme: string;
  styles: typeof themes.dark;
}

interface GlobalState {
  isReady: boolean;
  terminal: TerminalConfig;
  
  // 用户设置
  fetchUserSettings: () => Promise<void>;
  updateUserSettings: (key: string, value: any) => Promise<void>;
  
  // 终端设置
  updateTerminalConfig: (config: Partial<TerminalConfig>) => void;
}

export const useGlobalStore = create<GlobalState>()(
  devtools(
    (set, get) => ({
      isReady: false,
      terminal: {
        fontSize: 16,
        fontFamily: 'Courier',
        theme: 'dark',
        styles: themes.dark
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
        const state = get();
        const newConfig = { ...state.terminal, ...config };
        
        // 如果主题改变，更新样式
        if (config.theme && config.theme !== state.terminal.theme) {
          newConfig.styles = themes[config.theme as keyof typeof themes] || themes.dark;
        }
        
        set({ terminal: newConfig });
      }
    }),
    {
      name: 'global-store'
    }
  )
);
