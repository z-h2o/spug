/**
 * 配置服务状态管理
 */
import { create } from 'zustand';
import http from '@/libs/http';
import { message } from 'antd';

export interface ConfigServiceRecord {
  id?: number;
  name: string;
  key: string;
  desc?: string;
}

interface ConfigServiceState {
  records: ConfigServiceRecord[];
  record: Partial<ConfigServiceRecord>;
  isFetching: boolean;
  formVisible: boolean;
  f_name?: string;

  fetchRecords: () => Promise<void>;
  showForm: (info?: Partial<ConfigServiceRecord>) => void;
  setFormVisible: (visible: boolean) => void;
  setFName: (name: string) => void;
  deleteRecord: (id: number) => Promise<void>;
  submitForm: (values: any) => Promise<void>;
  getFilteredRecords: () => ConfigServiceRecord[];
}

const useConfigServiceStore = create<ConfigServiceState>((set, get) => ({
  records: [],
  record: {},
  isFetching: false,
  formVisible: false,
  f_name: '',

  fetchRecords: async () => {
    set({ isFetching: true });
    try {
      const res = await http.get('/api/config/service/');
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
      await http.delete('/api/config/service/', { params: { id } });
      message.success('删除成功');
      get().fetchRecords();
    } catch (error) {
      // Error handled by http interceptor
    }
  },

  submitForm: async (values: any) => {
    try {
      const formData = { ...values, id: get().record.id };
      await http.post('/api/config/service/', formData);
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

export default useConfigServiceStore;
