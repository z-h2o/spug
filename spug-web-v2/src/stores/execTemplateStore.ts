/**
 * 执行模板管理 Store
 */
import { create } from 'zustand';
import http from '@/libs/http';
import { includes } from '@/utils/common';

interface TemplateRecord {
  id: number;
  name: string;
  type: string;
  interpreter: string;
  body: string;
  host_ids: number[];
  parameters?: any[];
  desc?: string;
}

interface TemplateState {
  // 数据状态
  records: TemplateRecord[];
  record: Partial<TemplateRecord>;
  types: string[];
  
  // UI状态
  isFetching: boolean;
  formVisible: boolean;
  
  // 过滤状态
  f_name?: string;
  f_type?: string;
  
  // 计算属性方法
  getDataSource: () => TemplateRecord[];
  
  // 操作方法
  fetchRecords: () => Promise<void>;
  showForm: (info?: TemplateRecord) => void;
  
  // 设置方法
  setFormVisible: (visible: boolean) => void;
  setFilterName: (name?: string) => void;
  setFilterType: (type?: string) => void;
}

const useTemplateStore = create<TemplateState>((set, get) => ({
  // 初始状态
  records: [],
  record: {},
  types: [],
  isFetching: false,
  formVisible: false,
  f_name: undefined,
  f_type: undefined,

  // 计算属性方法
  getDataSource: () => {
    const { records, f_name, f_type } = get();
    let filteredRecords = records;
    
    if (f_name) {
      filteredRecords = filteredRecords.filter(x => includes(x.name, f_name));
    }
    
    if (f_type) {
      filteredRecords = filteredRecords.filter(x => x.type === f_type);
    }
    
    return filteredRecords;
  },

  // 操作方法
  fetchRecords: async () => {
    set({ isFetching: true });
    try {
      const { types, templates }: any = await http.get('/api/exec/template/');
      const typeSet = new Set<string>();
      types?.forEach((item: TemplateRecord) => {
        typeSet.add(item.type);
      });
      set({ 
        records: templates, 
        types: Array.from(typeSet) 
      });
    } finally {
      set({ isFetching: false });
    }
  },

  showForm: (info?: TemplateRecord) => {
    set({ 
      formVisible: true, 
      record: info || { interpreter: 'sh', type: '', parameters: [] } 
    });
  },

  // 设置方法
  setFormVisible: (visible) => set({ formVisible: visible }),
  setFilterName: (name) => set({ f_name: name }),
  setFilterType: (type) => set({ f_type: type }),
}));

export default useTemplateStore;
