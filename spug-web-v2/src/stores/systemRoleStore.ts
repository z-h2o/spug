/**
 * 系统角色管理状态管理
 */
import { create } from 'zustand';
import http from '@/libs/http';
import { message } from 'antd';
import { cloneDeep } from 'lodash';

export interface SystemRoleRecord {
  id?: number;
  name: string;
  desc?: string;
  page_perms?: any;
  deploy_perms?: any;
}

interface SystemRoleState {
  allPerms: Record<string, string[]>;
  initPerms: Record<string, any>;
  records: SystemRoleRecord[];
  record: Partial<SystemRoleRecord>;
  permissions: any[];
  deployRel: Record<string, any>;
  isFetching: boolean;
  formVisible: boolean;
  pagePermVisible: boolean;
  deployPermVisible: boolean;
  hostPermVisible: boolean;
  f_name?: string;

  fetchRecords: () => Promise<void>;
  showForm: (info?: Partial<SystemRoleRecord>) => void;
  showPagePerm: (info: SystemRoleRecord) => void;
  showDeployPerm: (info: SystemRoleRecord) => void;
  showHostPerm: (info: SystemRoleRecord) => void;
  setFormVisible: (visible: boolean) => void;
  setPagePermVisible: (visible: boolean) => void;
  setDeployPermVisible: (visible: boolean) => void;
  setHostPermVisible: (visible: boolean) => void;
  setFName: (name: string) => void;
  getFilteredRecords: () => SystemRoleRecord[];
  getIdMap: () => Record<number, SystemRoleRecord>;
  deleteRecord: (id: number) => Promise<void>;
  submitForm: (values: any) => Promise<void>;
}

const useSystemRoleStore = create<SystemRoleState>((set, get) => ({
  allPerms: {},
  initPerms: {},
  records: [],
  record: {},
  permissions: [],
  deployRel: {},
  isFetching: false,
  formVisible: false,
  pagePermVisible: false,
  deployPermVisible: false,
  hostPermVisible: false,
  f_name: '',

  fetchRecords: async () => {
    set({ isFetching: true });
    try {
      const res = await http.get('/api/account/role/');
      set({ records: res.data || res, isFetching: false });
    } catch (error) {
      set({ isFetching: false });
    }
  },

  showForm: (info = {}) => {
    set({ formVisible: true, record: info });
  },

  showPagePerm: (info) => {
    // This would need the actual permission codes structure
    set({ 
      record: info, 
      pagePermVisible: true,
      // permissions: merge({}, get().initPerms, info.page_perms)
    });
  },

  showDeployPerm: (info) => {
    set({
      record: info,
      deployPermVisible: true,
      deployRel: info.deploy_perms || {}
    });
  },

  showHostPerm: (info) => {
    set({
      record: info,
      hostPermVisible: true
    });
  },

  setFormVisible: (visible) => set({ formVisible: visible }),
  setPagePermVisible: (visible) => set({ pagePermVisible: visible }),
  setDeployPermVisible: (visible) => set({ deployPermVisible: visible }),
  setHostPermVisible: (visible) => set({ hostPermVisible: visible }),
  setFName: (name) => set({ f_name: name }),

  getFilteredRecords: () => {
    const { records, f_name } = get();
    if (!f_name) return records;
    return records.filter(x => 
      x.name.toLowerCase().includes(f_name.toLowerCase())
    );
  },

  getIdMap: () => {
    const { records } = get();
    const tmp: Record<number, SystemRoleRecord> = {};
    records.forEach(item => {
      if (item.id) {
        tmp[item.id] = item;
      }
    });
    return tmp;
  },

  deleteRecord: async (id: number) => {
    try {
      await http.delete('/api/account/role/', { params: { id } });
      message.success('删除成功');
      get().fetchRecords();
    } catch (error) {
      // Error handled by http interceptor
    }
  },

  submitForm: async (values: any) => {
    try {
      const formData = { ...values, id: get().record.id };
      await http.post('/api/account/role/', formData);
      message.success('操作成功');
      set({ formVisible: false });
      get().fetchRecords();
    } catch (error) {
      // Error handled by http interceptor
    }
  },
}));

export default useSystemRoleStore;
