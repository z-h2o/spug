/**
 * 配置中心-环境管理 Store
 */
import { create } from 'zustand';
import http from '@/libs/http';

export interface EnvRecord {
  id: number;
  name: string;
  key: string;
  desc?: string;
  sort: number;
}

interface ConfigEnvState {
  // 数据状态
  records: EnvRecord[];
  record: Partial<EnvRecord>;
  idMap: Record<number, EnvRecord>;
  
  // UI状态
  isFetching: boolean;
  formVisible: boolean;
  
  // 过滤状态
  f_name?: string;
  
  // 计算属性
  getDataSource: () => EnvRecord[];
  
  // 操作方法
  fetchRecords: () => Promise<void>;
  showForm: (info?: Partial<EnvRecord>) => void;
  
  // 设置方法
  setFormVisible: (visible: boolean) => void;
  setRecord: (record: Partial<EnvRecord>) => void;
  setFilter: (key: string, value: string) => void;
}

export const useConfigEnvStore = create<ConfigEnvState>((set, get) => ({
  // 初始状态
  records: [],
  record: {},
  idMap: {},
  isFetching: false,
  formVisible: false,
  f_name: '',

  // 计算属性
  getDataSource() {
    const { records, f_name } = get();
    let result = records;
    if (f_name) {
      result = result.filter(x => x.name.toLowerCase().includes(f_name.toLowerCase()));
    }
    return result;
  },

  // 操作方法
  fetchRecords: async () => {
    set({ isFetching: true });
    try {
      const res: any = await http.get('/api/config/environment/');
      const idMap: Record<number, EnvRecord> = {};
      for (const item of res) {
        idMap[item.id] = item;
      }
      set({ 
        records: res, 
        idMap 
      });
    } catch (error) {
      console.error('Failed to fetch env records:', error);
    } finally {
      set({ isFetching: false });
    }
  },

  showForm: (info = {}) => {
    set({ 
      formVisible: true,
      record: info 
    });
  },

  // 设置方法
  setFormVisible: (visible: boolean) => {
    set({ formVisible: visible });
  },

  setRecord: (record: Partial<EnvRecord>) => {
    set({ record });
  },

  setFilter: (key: string, value: string) => {
    set({ [key]: value } as any);
  },
}));

export default useConfigEnvStore;
