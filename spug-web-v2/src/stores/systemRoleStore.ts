/**
 * 系统角色管理状态管理
 */
import { create } from 'zustand';
import http from '@/libs/http';
import { message } from 'antd';
import { cloneDeep, merge } from 'lodash';
import codes from '@/pages/system/role/codes';

export interface SystemRoleRecord {
  id?: number;
  name: string;
  desc?: string;
  page_perms?: any;
  deploy_perms?: any;
  group_perms?: number[];
}

interface SystemRoleState {
  allPerms: Record<string, string[]>;
  initPerms: Record<string, any>;
  records: SystemRoleRecord[];
  record: Partial<SystemRoleRecord>;
  permissions: Record<string, Record<string, string[]>>;
  deployRel: Record<string, any>;
  isFetching: boolean;
  formVisible: boolean;
  pagePermVisible: boolean;
  deployPermVisible: boolean;
  hostPermVisible: boolean;
  f_name?: string;

  initPermissions: () => void;
  fetchRecords: () => Promise<void>;
  showForm: (info?: Partial<SystemRoleRecord>) => void;
  showPagePerm: (info: SystemRoleRecord) => void;
  showDeployPerm: (info: SystemRoleRecord) => void;
  showHostPerm: (info: SystemRoleRecord) => void;
  setFormVisible: (visible: boolean) => void;
  setPagePermVisible: (visible: boolean) => void;
  setDeployPermVisible: (visible: boolean) => void;
  setHostPermVisible: (visible: boolean) => void;
  updateDeployRel: (key: 'envs' | 'apps', values: any[]) => void;
  setFName: (name: string) => void;
  getFilteredRecords: () => SystemRoleRecord[];
  getIdMap: () => Record<number, SystemRoleRecord>;
  deleteRecord: (id: number) => Promise<void>;
  submitForm: (values: any) => Promise<void>;
}

const useSystemRoleStore = create<SystemRoleState>((set, get) => {
  // 初始化权限数据
  const initPermissions = () => {
    const allPerms: Record<string, string[]> = {};
    const initPerms: Record<string, any> = {};
    
    for (const mod of codes) {
      initPerms[mod.key] = {};
      for (const page of mod.pages) {
        initPerms[mod.key][page.key] = [];
        allPerms[`${mod.key}.${page.key}`] = page.perms.map(x => x.key);
      }
    }
    
    set({ allPerms, initPerms });
  };

  return {
    allPerms: {},
    initPerms: {},
    records: [],
    record: {},
    permissions: cloneDeep(codes.reduce((acc, mod) => {
      acc[mod.key] = mod.pages.reduce((pageAcc, page) => {
        pageAcc[page.key] = [];
        return pageAcc;
      }, {} as any);
      return acc;
    }, {} as any)),
    deployRel: {},
    isFetching: false,
    formVisible: false,
    pagePermVisible: false,
    deployPermVisible: false,
    hostPermVisible: false,
    f_name: '',

    initPermissions,

    fetchRecords: async () => {
      set({ isFetching: true });
      try {
        const res = await http.get('/api/account/role/');
        set({ records: res.data || res, isFetching: false });
      } finally {
        set({ isFetching: false });
      }
    },

    showForm: (info = {}) => {
      set({ formVisible: true, record: info });
    },

    showPagePerm: (info) => {
      const { initPerms } = get();
      set({ 
        record: info, 
        pagePermVisible: true,
        permissions: merge({}, initPerms, info.page_perms || {})
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
  
  updateDeployRel: (key: 'envs' | 'apps', values: any[]) => {
    const { deployRel } = get();
    const newDeployRel = { ...deployRel, [key]: values };
    set({ deployRel: newDeployRel });
  },
  
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
      message.error('删除失败', error as any);
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
      message.error('操作失败', error as any);
      // Error handled by http interceptor
    }
  },
  };
});

// 初始化权限数据
useSystemRoleStore.getState().initPermissions();

export default useSystemRoleStore;
