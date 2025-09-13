/**
 * 系统设置状态管理
 */
import { create } from 'zustand';
import http from '@/libs/http';

export interface SystemSettingState {
  settings: Record<string, any>;
  isFetching: boolean;
  loading: boolean;
  
  fetchSettings: () => void;
  updateSetting: (key: string, value: any) => void;
}

const useSystemSettingStore = create<SystemSettingState>((set, get) => ({
  settings: {},
  isFetching: false,
  loading: false,
  
  fetchSettings: () => {
    set({ isFetching: true });
    http.get('/api/setting/')
      .then(res => {
        set({ settings: res.data || res });
      })
      .finally(() => {
        set({ isFetching: false });
      });
  },
  
  updateSetting: (key: string, value: any) => {
    const { settings } = get();
    set({ 
      settings: { 
        ...settings, 
        [key]: value 
      } 
    });
  }
}));

export default useSystemSettingStore;
