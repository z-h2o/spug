/**
 * 配置应用状态管理
 */
import { create } from 'zustand';
import http from '@/libs/http';

export interface ConfigAppRecord {
  id: number;
  name: string;
  key: string;
  desc: string;
  sort: number;
  extend: string;
}

interface ConfigAppState {
  records: ConfigAppRecord[];
  isFetching: boolean;
  fetchRecords: () => Promise<void>;
}

const useConfigAppStore = create<ConfigAppState>((set, get) => ({
  records: [],
  isFetching: false,

  fetchRecords: async () => {
    set({ isFetching: true });
    try {
      const res: ConfigAppRecord[] = await http.get('/api/app/');
      set({ records: res });
    } catch (error) {
      console.error('Failed to fetch config app records:', error);
    } finally {
      set({ isFetching: false });
    }
  },
}));

export default useConfigAppStore;
