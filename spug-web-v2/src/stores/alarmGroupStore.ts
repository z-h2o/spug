/**
 * 报警组状态管理
 */
import { create } from 'zustand';
import http from '@/libs/http';
import { message } from 'antd';

export interface AlarmGroupRecord {
  id?: number;
  name: string;
  desc?: string;
  contacts: number[];
}

interface AlarmGroupState {
  records: AlarmGroupRecord[];
  record: Partial<AlarmGroupRecord>;
  isFetching: boolean;
  formVisible: boolean;
  f_name?: string;

  fetchRecords: () => Promise<void>;
  showForm: (info?: Partial<AlarmGroupRecord>) => void;
  setFormVisible: (visible: boolean) => void;
  setFName: (name: string) => void;
  deleteRecord: (id: number) => Promise<void>;
  submitForm: (values: any) => Promise<void>;
  getFilteredRecords: () => AlarmGroupRecord[];
  getGroupMap: () => Record<number, string>;
}

const useAlarmGroupStore = create<AlarmGroupState>((set, get) => ({
  records: [],
  record: {},
  isFetching: false,
  formVisible: false,
  f_name: '',

  fetchRecords: async () => {
    set({ isFetching: true });
    try {
      const res = await http.get('/api/alarm/group/');
      set({ records: res.data || res, isFetching: false });
    } catch (error) {
      set({ isFetching: false });
    }
  },

  showForm: (info = {}) => {
    set({ formVisible: true, record: info });
  },

  setFormVisible: (visible) => set({ formVisible: visible }),
  setFName: (name) => set({ f_name: name }),

  deleteRecord: async (id: number) => {
    try {
      await http.delete('/api/alarm/group/', { params: { id } });
      message.success('删除成功');
      get().fetchRecords();
    } catch (error) {
      // Error handled by http interceptor
    }
  },

  submitForm: async (values: any) => {
    try {
      const formData = { ...values, id: get().record.id };
      await http.post('/api/alarm/group/', formData);
      message.success('操作成功');
      set({ formVisible: false });
      get().fetchRecords();
    } catch (error) {
      // Error handled by http interceptor
    }
  },

  getFilteredRecords: () => {
    const { records, f_name } = get();
    if (!f_name) return records;
    return records.filter(item => 
      item.name.toLowerCase().includes(f_name.toLowerCase())
    );
  },

  getGroupMap: () => {
    const { records } = get();
    const map: Record<number, string> = {};
    records.forEach(item => {
      if (item.id) {
        map[item.id] = item.name;
      }
    });
    return map;
  },
}));

export default useAlarmGroupStore;
