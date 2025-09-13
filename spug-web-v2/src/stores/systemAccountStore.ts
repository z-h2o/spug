/**
 * 系统账户管理状态管理
 */
import { create } from 'zustand';
import http from '@/libs/http';
import { message } from 'antd';

export interface SystemAccountRecord {
  id?: number;
  username: string;
  nickname: string;
  password?: string;
  role_ids: number[];
  is_active: boolean;
  is_supper?: boolean;
  type?: string;
  last_login?: string;
  wx_token?: number;
}

interface SystemAccountState {
  records: SystemAccountRecord[];
  record: Partial<SystemAccountRecord>;
  isFetching: boolean;
  formVisible: boolean;
  f_name?: string;
  f_status: string;

  fetchRecords: () => Promise<void>;
  showForm: (info?: Partial<SystemAccountRecord>) => void;
  setFormVisible: (visible: boolean) => void;
  setFName: (name: string) => void;
  setFStatus: (status: string) => void;
  deleteRecord: (id: number) => Promise<void>;
  toggleActive: (id: number, is_active: boolean) => Promise<void>;
  resetPassword: (id: number, password: string) => Promise<void>;
  submitForm: (values: any) => Promise<void>;
  getFilteredRecords: () => SystemAccountRecord[];
}

const useSystemAccountStore = create<SystemAccountState>((set, get) => ({
  records: [],
  record: {},
  isFetching: true,
  formVisible: false,
  f_name: '',
  f_status: '',

  fetchRecords: async () => {
    set({ isFetching: true });
    try {
      const res = await http.get('/api/account/user/');
      set({ records: res.data || res, isFetching: false });
    } catch {
      set({ isFetching: false });
    }
  },

  showForm: (info = {}) => {
    set({ formVisible: true, record: info });
  },

  setFormVisible: (visible) => set({ formVisible: visible }),
  setFName: (name) => set({ f_name: name }),
  setFStatus: (status) => set({ f_status: status }),

  deleteRecord: async (id: number) => {
    try {
      await http.delete('/api/account/user/', { params: { id } });
      message.success('删除成功');
      get().fetchRecords();
    } catch {
      // Error handled by http interceptor
    }
  },

  toggleActive: async (id: number, is_active: boolean) => {
    try {
      await http.patch('/api/account/user/', { id, is_active });
      message.success('操作成功');
      get().fetchRecords();
    } catch {
      // Error handled by http interceptor
    }
  },

  resetPassword: async (id: number, password: string) => {
    try {
      await http.patch('/api/account/user/', { id, password });
      message.success('重置成功');
    } catch {
      // Error handled by http interceptor
    }
  },

  submitForm: async (values: any) => {
    try {
      const formData = { ...values, id: get().record.id };
      await http.post('/api/account/user/', formData);
      message.success('操作成功');
      set({ formVisible: false });
      get().fetchRecords();
    } catch (error) {
      console.error('submitForm - 请求失败:', error);
      // Error handled by http interceptor
    }
  },

  getFilteredRecords: () => {
    const { records, f_name, f_status } = get();
    let filteredRecords = records;
    
    if (f_name) {
      filteredRecords = filteredRecords.filter(x => 
        x.username.toLowerCase().includes(f_name.toLowerCase())
      );
    }
    
    if (f_status) {
      filteredRecords = filteredRecords.filter(x => 
        String(x.is_active) === f_status
      );
    }
    
    return filteredRecords;
  },
}));

export default useSystemAccountStore;
