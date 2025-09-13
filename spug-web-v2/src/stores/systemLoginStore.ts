/**
 * 系统登录日志状态管理
 */
import { create } from 'zustand';
import http from '@/libs/http';
import { includes } from '@/utils/functools';

export interface LoginRecord {
  id: number;
  created_at: string;
  username: string;
  type: string;
  is_success: boolean;
  ip: string;
  agent: string;
  message?: string;
}

interface SystemLoginState {
  records: LoginRecord[];
  isFetching: boolean;
  f_ip?: string;
  f_name?: string;
  f_status: string;

  fetchRecords: () => Promise<void>;
  setFIp: (ip: string) => void;
  setFName: (name: string) => void;
  setFStatus: (status: string) => void;
  getFilteredRecords: () => LoginRecord[];
}

const useSystemLoginStore = create<SystemLoginState>((set, get) => ({
  records: [],
  isFetching: false,
  f_ip: '',
  f_name: '',
  f_status: '',

  fetchRecords: async () => {
    set({ isFetching: true });
    try {
      const res = await http.get('/api/account/login/history/');
      set({ records: res.data || res, isFetching: false });
    } catch {
      set({ isFetching: false });
    }
  },

  setFIp: (ip) => set({ f_ip: ip }),
  setFName: (name) => set({ f_name: name }),
  setFStatus: (status) => set({ f_status: status }),

  getFilteredRecords: () => {
    const { records, f_ip, f_name, f_status } = get();
    let filteredRecords = records;
    
    if (f_ip) {
      filteredRecords = filteredRecords.filter(x => includes(x.ip, f_ip));
    }
    
    if (f_name) {
      filteredRecords = filteredRecords.filter(x => includes(x.username, f_name));
    }
    
    if (f_status) {
      filteredRecords = filteredRecords.filter(x => String(x.is_success) === f_status);
    }
    
    return filteredRecords;
  },
}));

export default useSystemLoginStore;
