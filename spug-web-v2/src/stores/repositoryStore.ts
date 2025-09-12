/**
 * 构建仓库状态管理
 */
import { create } from 'zustand';
import http from '@/libs/http';

export interface RepositoryRecord {
  id: number;
  app_id: number;
  app_name: string;
  env_id: number;
  env_name: string;
  version: string;
  status: string;
  status_alias: string;
  created_at: string;
  created_by_user: string;
  remarks?: string;
  child?: RepositoryRecord[];
}

export interface DeployConfig {
  id: number;
  app_id: number;
  env_id: number;
  extend: string;
  host_ids: number[];
  require_upload?: boolean;
}

interface RepositoryState {
  // 数据状态
  records: RepositoryRecord[];
  record: Partial<RepositoryRecord>;
  deploy: Partial<DeployConfig>;
  
  // UI状态
  isFetching: boolean;
  formVisible: boolean;
  addVisible: boolean;
  logVisible: boolean;
  detailVisible: boolean;
  
  // 筛选状态
  f_app_id?: number;
  f_env_id?: number;
  
  // 计算属性
  getDataSource: () => RepositoryRecord[];
  
  // 异步方法
  fetchRecords: () => Promise<void>;
  
  // UI方法
  showForm: () => void;
  confirmAdd: (deploy: DeployConfig) => void;
  showConsole: (info: RepositoryRecord) => void;
  showDetail: (info: RepositoryRecord) => void;
  setFormVisible: (visible: boolean) => void;
  setAddVisible: (visible: boolean) => void;
  setLogVisible: (visible: boolean) => void;
  setDetailVisible: (visible: boolean) => void;
  setRecord: (record: Partial<RepositoryRecord>) => void;
  setAppId: (f_app_id?: number) => void;
  setEnvId: (f_env_id?: number) => void;
}

const useRepositoryStore = create<RepositoryState>((set, get) => ({
  // 数据状态
  records: [],
  record: {},
  deploy: {},
  
  // UI状态
  isFetching: false,
  formVisible: false,
  addVisible: false,
  logVisible: false,
  detailVisible: false,
  
  // 筛选状态
  f_app_id: undefined,
  f_env_id: undefined,
  
  // 计算属性
  getDataSource: () => {
    const { records, f_app_id, f_env_id } = get();
    let filtered = records;
    
    if (f_app_id) {
      filtered = filtered.filter(x => x.app_id === f_app_id);
    }
    if (f_env_id) {
      filtered = filtered.filter(x => x.env_id === f_env_id);
    }
    
    return filtered;
  },
  
  // 异步方法
  fetchRecords: async () => {
    set({ isFetching: true });
    try {
      const res: RepositoryRecord[] = await http.get('/api/repository/');
      set({ records: res });
    } catch (error) {
      console.error('Failed to fetch repository records:', error);
    } finally {
      set({ isFetching: false });
    }
  },
  
  // UI方法
  showForm: () => {
    set({ 
      record: {}, 
      addVisible: true 
    });
  },
  
  confirmAdd: (deploy: DeployConfig) => {
    set({ 
      deploy, 
      formVisible: true,
      addVisible: false 
    });
  },
  
  showConsole: (info: RepositoryRecord) => {
    set({ 
      record: info, 
      logVisible: true 
    });
  },
  
  showDetail: (info: RepositoryRecord) => {
    set({ 
      record: info, 
      detailVisible: true 
    });
  },
  
  setFormVisible: (visible: boolean) => {
    set({ formVisible: visible });
  },
  
  setAddVisible: (visible: boolean) => {
    set({ addVisible: visible });
  },
  
  setLogVisible: (visible: boolean) => {
    set({ logVisible: visible });
  },
  
  setDetailVisible: (visible: boolean) => {
    set({ detailVisible: visible });
  },
  
  setRecord: (record: Partial<RepositoryRecord>) => {
    set({ record });
  },
  
  setAppId: (f_app_id?: number) => {
    set({ f_app_id });
  },
  
  setEnvId: (f_env_id?: number) => {
    set({ f_env_id });
  },
}));

export default useRepositoryStore;
