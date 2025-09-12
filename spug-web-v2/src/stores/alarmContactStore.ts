/**
 * 报警联系人状态管理
 */
import { create } from 'zustand';
import http from '@/libs/http';
import { message } from 'antd';

export interface AlarmContactRecord {
  id?: number;
  name: string;
  phone?: string;
  email?: string;
  ding?: string;
  wx_token?: string;
  qy_wx?: string;
}

interface AlarmContactState {
  records: AlarmContactRecord[];
  record: Partial<AlarmContactRecord>;
  isFetching: boolean;
  formVisible: boolean;
  f_name?: string;

  fetchRecords: () => Promise<void>;
  showForm: (info?: Partial<AlarmContactRecord>) => void;
  setFormVisible: (visible: boolean) => void;
  setFName: (name: string) => void;
  deleteRecord: (id: number) => Promise<void>;
  submitForm: (values: any) => Promise<void>;
  getFilteredRecords: () => AlarmContactRecord[];
}

const useAlarmContactStore = create<AlarmContactState>((set, get) => ({
  records: [],
  record: {},
  isFetching: false,
  formVisible: false,
  f_name: '',

  fetchRecords: async () => {
    set({ isFetching: true });
    try {
      const res = await http.get('/api/alarm/contact/');
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
      await http.delete('/api/alarm/contact/', { params: { id } });
      message.success('删除成功');
      get().fetchRecords();
    } catch (error) {
      // Error handled by http interceptor
    }
  },

  submitForm: async (values: any) => {
    try {
      const formData = { ...values, id: get().record.id };
      await http.post('/api/alarm/contact/', formData);
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
}));

export default useAlarmContactStore;
