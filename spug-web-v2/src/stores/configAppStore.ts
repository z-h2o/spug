/**
 * 配置应用状态管理
 */
import { create } from 'zustand';
import http from '@/libs/http';
import { message } from 'antd';

export interface ConfigAppRecord {
  id?: number;
  name: string;
  key: string;
  desc?: string;
  rel_apps?: number[];
  rel_services?: number[];
}

interface ConfigAppState {
  records: ConfigAppRecord[];
  record: Partial<ConfigAppRecord>;
  confRel: {
    app: number[];
    service: number[];
  };
  isFetching: boolean;
  formVisible: boolean;
  relVisible: boolean;
  f_name?: string;

  fetchRecords: () => Promise<void>;
  showForm: (info?: Partial<ConfigAppRecord>) => void;
  showRel: (info: ConfigAppRecord) => void;
  setFormVisible: (visible: boolean) => void;
  setRelVisible: (visible: boolean) => void;
  setFName: (name: string) => void;
  deleteRecord: (id: number) => Promise<void>;
  submitForm: (values: any) => Promise<void>;
  submitRel: () => Promise<void>;
  getFilteredRecords: () => ConfigAppRecord[];
  updateConfRel: (key: 'app' | 'service', value: number[]) => void;
}

const useConfigAppStore = create<ConfigAppState>((set, get) => ({
  records: [],
  record: {},
  confRel: {
    app: [],
    service: []
  },
  isFetching: false,
  formVisible: false,
  relVisible: false,
  f_name: '',

  fetchRecords: async () => {
    set({ isFetching: true });
    try {
      const res = await http.get('/api/app/');
      set({ records: res.data || res, isFetching: false });
    } catch (error) {
      set({ isFetching: false });
    }
  },

  showForm: (info = {}) => {
    set({ formVisible: true, record: info });
  },

  showRel: (info) => {
    set({
      relVisible: true,
      record: info,
      confRel: {
        app: info.rel_apps || [],
        service: info.rel_services || []
      }
    });
  },

  setFormVisible: (visible) => set({ formVisible: visible }),
  setRelVisible: (visible) => set({ relVisible: visible }),
  setFName: (name) => set({ f_name: name }),

  deleteRecord: async (id: number) => {
    try {
      await http.delete('/api/app/', { params: { id } });
      message.success('删除成功');
      get().fetchRecords();
    } catch (error) {
      // Error handled by http interceptor
    }
  },

  submitForm: async (values: any) => {
    try {
      const formData = { ...values, id: get().record.id };
      await http.post('/api/app/', formData);
      message.success('操作成功');
      set({ formVisible: false });
      get().fetchRecords();
    } catch (error) {
      // Error handled by http interceptor
    }
  },

  submitRel: async () => {
    try {
      const { record, confRel } = get();
      await http.patch('/api/app/', {
        id: record.id,
        rel_apps: confRel.app,
        rel_services: confRel.service
      });
      message.success('操作成功');
      set({ relVisible: false });
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

  updateConfRel: (key: 'app' | 'service', value: number[]) => {
    set(state => ({
      confRel: {
        ...state.confRel,
        [key]: value
      }
    }));
  },
}));

export default useConfigAppStore;