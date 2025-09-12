/**
 * 应用发布模块 Store
 */
import { create } from 'zustand';
import http from '@/libs/http';

export interface AppRecord {
  id: number;
  name: string;
  key: string;
  desc?: string;
  sort: number;
  isLoaded?: boolean;
  deploys?: DeployRecord[];
}

export interface ServerAction {
  title?: string;
  data?: string;
}

export interface HostAction {
  title?: string;
  data?: string;
  type?: string;
  src?: string;
  src_mode?: string;
  dst?: string;
  mode?: string;
  rule?: string;
}

export interface DeployRecord {
  id?: number;
  app_id: number;
  env_id?: number;
  extend: string; // '1' or '2'
  host_ids: number[];
  is_audit: boolean;
  is_parallel?: boolean;
  git_repo?: string;
  git_type?: string;
  rst_notify?: {
    mode: string;
    value?: string;
  };
  filter_rule?: {
    type: string;
    data: string;
  };
  // 构建配置字段
  hook_pre_server?: string;   // 代码检出前执行
  hook_post_server?: string;  // 代码检出后执行
  // 发布配置字段
  dst_dir?: string;           // 部署路径
  dst_repo?: string;          // 存储路径
  versions?: string;          // 版本数量
  hook_pre_host?: string;     // 应用发布前执行
  hook_post_host?: string;    // 应用发布后执行
  // 自定义发布配置字段
  host_actions?: HostAction[];
  server_actions?: ServerAction[];
  [key: string]: any;
}

interface DeployAppState {
  // 数据状态
  records: Record<string, AppRecord>;
  record: Partial<AppRecord>;
  deploy: Partial<DeployRecord>;
  
  // UI状态
  page: number;
  loading: Record<string, boolean>;
  isReadOnly: boolean;
  isFetching: boolean;
  formVisible: boolean;
  addVisible: boolean;
  ext1Visible: boolean;
  ext2Visible: boolean;
  autoVisible: boolean;
  
  // 过滤状态
  f_name?: string;
  f_desc?: string;
  
  // 计算属性方法
  getDataSource: () => AppRecord[];
  getCurrentRecord: () => AppRecord | undefined;
  app_id?: number;
  
  // 操作方法
  fetchRecords: () => Promise<void>;
  loadDeploys: (app_id: number) => Promise<void>;
  showForm: (info?: Partial<AppRecord>) => void;
  showExtForm: (app_id: number, info?: Partial<DeployRecord>, isClone?: boolean, isReadOnly?: boolean) => void;
  showAutoDeploy: (deploy: Partial<DeployRecord>) => void;
  addHost: () => void;
  editHost: (index: number, v: number) => void;
  delHost: (index: number) => void;
  
  // 设置方法
  setFormVisible: (visible: boolean) => void;
  setRecord: (record: Partial<AppRecord>) => void;
  setDeploy: (deploy: Partial<DeployRecord>) => void;
  setPage: (page: number) => void;
  setFilter: (key: string, value: string) => void;
  setAddVisible: (visible: boolean) => void;
  setExt1Visible: (visible: boolean) => void;
  setExt2Visible: (visible: boolean) => void;
  setAutoVisible: (visible: boolean) => void;
}

export const useDeployAppStore = create<DeployAppState>((set, get) => ({
  // 初始状态
  records: {},
  record: {},
  deploy: {},
  page: 0,
  loading: {},
  isReadOnly: false,
  isFetching: false,
  formVisible: false,
  addVisible: false,
  ext1Visible: false,
  ext2Visible: false,
  autoVisible: false,
  f_name: '',
  f_desc: '',

  // 计算属性方法
  getDataSource: () => {
    const { records, f_name, f_desc } = get();
    let result = Object.values(records);
    if (f_name) {
      result = result.filter(x => x.name.toLowerCase().includes(f_name.toLowerCase()));
    }
    if (f_desc) {
      result = result.filter(x => x.desc && x.desc.toLowerCase().includes(f_desc.toLowerCase()));
    }
    return result;
  },

  getCurrentRecord: () => {
    const { records, app_id } = get();
    return app_id ? records[`a${app_id}`] : undefined;
  },

  // 操作方法
  fetchRecords: async () => {
    set({ isFetching: true });
    try {
      const res: any = await http.get('/api/app/');
      const tmp: Record<string, AppRecord> = {};
      const { records } = get();
      
      for (const item of res) {
        const existingRecord = records[`a${item.id}`];
        Object.assign(item, {
          isLoaded: existingRecord?.isLoaded || false,
          deploys: existingRecord?.deploys || []
        });
        tmp[`a${item.id}`] = item;
      }
      set({ records: tmp });
    } catch (error) {
      console.error('Failed to fetch app records:', error);
    } finally {
      set({ isFetching: false });
    }
  },

  loadDeploys: async (app_id: number) => {
    try {
      const { records } = get();
      if (records[`a${app_id}`]) {
        records[`a${app_id}`].isLoaded = true;
        const res: any = await http.get('/api/app/deploy/', { params: { app_id } });
        records[`a${app_id}`].deploys = res;
        set({ records: { ...records } });
      }
    } catch (error) {
      console.error('Failed to load deploys:', error);
    }
  },

  showForm: (info = {}) => {
    set({ 
      record: info, 
      formVisible: true 
    });
  },

  showExtForm: (app_id: number, info?: Partial<DeployRecord>, isClone = false, isReadOnly = false) => {
    const newState: Partial<DeployAppState> = {
      page: 0,
      app_id,
      isReadOnly,
      addVisible: false,
      ext1Visible: false,
      ext2Visible: false
    };
    if (info) {
      if (isClone) {
        delete info.id;
      }
      
      if (info.extend === '1') {
        newState.ext1Visible = true;
      } else {
        newState.ext2Visible = true;
      }
      newState.deploy = info;
    } else {
      newState.addVisible = true;
      newState.deploy = {};
    }

    set(newState);
  },

  showAutoDeploy: (deploy: Partial<DeployRecord>) => {
    set({ 
      deploy, 
      autoVisible: true 
    });
  },

  addHost: () => {
    const { deploy } = get();
    if (!deploy.host_ids) {
      deploy.host_ids = [];
    }
    deploy.host_ids.push(undefined as any);
    set({ deploy: { ...deploy } });
  },

  editHost: (index: number, v: number) => {
    const { deploy } = get();
    if (deploy.host_ids) {
      deploy.host_ids[index] = v;
      set({ deploy: { ...deploy } });
    }
  },

  delHost: (index: number) => {
    const { deploy } = get();
    if (deploy.host_ids) {
      deploy.host_ids.splice(index, 1);
      set({ deploy: { ...deploy } });
    }
  },

  // 设置方法
  setFormVisible: (visible: boolean) => {
    set({ formVisible: visible });
  },

  setRecord: (record: Partial<AppRecord>) => {
    set({ record });
  },

  setDeploy: (deploy: Partial<DeployRecord>) => {
    set({ deploy });
  },

  setPage: (page: number) => {
    set({ page });
  },

  setFilter: (key: string, value: string) => {
    set({ [key]: value } as any);
  },

  setAddVisible: (visible: boolean) => {
    set({ addVisible: visible });
  },

  setExt1Visible: (visible: boolean) => {
    set({ ext1Visible: visible });
  },

  setExt2Visible: (visible: boolean) => {
    set({ ext2Visible: visible });
  },

  setAutoVisible: (visible: boolean) => {
    set({ autoVisible: visible });
  },
}));

export default useDeployAppStore;
