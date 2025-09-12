/**
 * 报警管理状态管理
 */
import { create } from 'zustand';
import http from '@/libs/http';

export interface AlarmRecord {
  id: number;
  name: string;
  type: string;
  target: string;
  status: string;
  duration: string;
  notify_mode: string;
  notify_grp: number[];
  created_at: string;
}

interface AlarmState {
  records: AlarmRecord[];
  isFetching: boolean;
  f_name?: string;
  f_status: string;

  fetchRecords: () => Promise<void>;
  setFName: (name: string) => void;
  setFStatus: (status: string) => void;
  getFilteredRecords: () => AlarmRecord[];
}

const useAlarmStore = create<AlarmState>((set, get) => ({
  records: [],
  isFetching: false,
  f_name: '',
  f_status: '',

  fetchRecords: async () => {
    set({ isFetching: true });
    try {
      const res = await http.get('/api/alarm/alarm/');
      set({ records: res.data || res, isFetching: false });
    } catch (error) {
      set({ isFetching: false });
    }
  },

  setFName: (name) => set({ f_name: name }),
  setFStatus: (status) => set({ f_status: status }),

  getFilteredRecords: () => {
    const { records, f_name, f_status } = get();
    let filteredRecords = records;
    
    if (f_name) {
      filteredRecords = filteredRecords.filter(x => 
        x.name.toLowerCase().includes(f_name.toLowerCase())
      );
    }
    
    if (f_status) {
      filteredRecords = filteredRecords.filter(x => x.status === f_status);
    }
    
    return filteredRecords;
  },
}));

export default useAlarmStore;
