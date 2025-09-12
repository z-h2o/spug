/**
 * 监控中心 Store
 */
import { create } from 'zustand';
import http from '@/libs/http';
import { includes } from '@/utils/common';
import { cloneDeep } from '@/utils/helper';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface MonitorRecord {
  id: number;
  name: string;
  type: string;
  type_alias: string;
  group: string;
  rate: number;
  is_active: boolean;
  latest_run_time?: string;
  latest_run_time_alias?: string;
  desc?: string;
  targets?: any[];
}

interface OverviewRecord {
  id: number;
  name: string;
  type: string;
  group: string;
  target: string;
  status: string;
  latest_run_time?: string;
  desc?: string;
}

interface MonitorState {
  // 数据状态
  records: MonitorRecord[];
  overviews: OverviewRecord[];
  types: string[];
  groups: string[];
  record: Partial<MonitorRecord>;
  page: number;
  
  // UI状态
  isFetching: boolean;
  ovFetching: boolean;
  formVisible: boolean;
  autoReload: boolean | null;
  
  // 过滤状态
  f_name?: string;
  f_type?: string;
  f_active: string;
  f_group?: string;
  
  // 计算属性方法
  getDataSource: () => MonitorRecord[];
  getOvDataSource: () => OverviewRecord[];
  
  // 操作方法
  fetchRecords: () => Promise<void>;
  fetchOverviews: () => Promise<void>;
  showForm: (info?: MonitorRecord) => void;
  
  // 设置方法
  setFormVisible: (visible: boolean) => void;
  setPage: (page: number) => void;
  setAutoReload: (autoReload: boolean | null) => void;
  setFilterName: (name?: string) => void;
  setFilterType: (type?: string) => void;
  setFilterActive: (active: string) => void;
  setFilterGroup: (group?: string) => void;
}

const useMonitorStore = create<MonitorState>((set, get) => ({
  // 初始状态
  records: [],
  overviews: [],
  types: [],
  groups: [],
  record: {},
  page: 0,
  isFetching: false,
  ovFetching: false,
  formVisible: false,
  autoReload: null,
  f_name: undefined,
  f_type: undefined,
  f_active: '',
  f_group: undefined,

  // 计算属性方法
  getDataSource: () => {
    const { records, f_active, f_name, f_type, f_group } = get();
    let filteredRecords = records;
    
    if (f_active) {
      filteredRecords = filteredRecords.filter(x => x.is_active === (f_active === '1'));
    }
    if (f_name) {
      filteredRecords = filteredRecords.filter(x => includes(x.name, f_name));
    }
    if (f_type) {
      filteredRecords = filteredRecords.filter(x => x.type_alias === f_type);
    }
    if (f_group) {
      filteredRecords = filteredRecords.filter(x => x.group === f_group);
    }
    
    return filteredRecords;
  },

  getOvDataSource: () => {
    const { overviews, f_type, f_group, f_name } = get();
    let filteredRecords = overviews;
    
    if (f_type) {
      filteredRecords = filteredRecords.filter(x => x.type === f_type);
    }
    if (f_group) {
      filteredRecords = filteredRecords.filter(x => x.group === f_group);
    }
    if (f_name) {
      filteredRecords = filteredRecords.filter(x => includes(x.name, f_name));
    }
    
    return filteredRecords;
  },

  // 操作方法
  fetchRecords: async () => {
    set({ isFetching: true });
    try {
      const res: any = await http.get('/api/monitor/');
      const { groups, detections } = res;
      const tmp = new Set<string>();
      
      const processedDetections = detections.map((item: MonitorRecord) => {
        tmp.add(item.type_alias);
        const value = item.latest_run_time;
        item.latest_run_time_alias = value ? dayjs(value).fromNow() : undefined;
        return item;
      });
      
      set({
        types: Array.from(tmp),
        records: processedDetections,
        groups
      });
    } finally {
      set({ isFetching: false });
    }
  },

  fetchOverviews: async () => {
    const { autoReload } = get();
    if (autoReload === false) return;
    
    set({ ovFetching: true });
    try {
      const res: any = await http.get('/api/monitor/overview/');
      set({ overviews: res });
    } finally {
      set({ ovFetching: false });
      
      // 自动刷新逻辑
      if (get().autoReload) {
        setTimeout(() => get().fetchOverviews(), 5000);
      }
    }
  },

  showForm: (info) => {
    if (info) {
      set({ record: cloneDeep(info) });
    } else {
      const currentRecord = get().record;
      if (currentRecord.id || !currentRecord.type) {
        set({ record: { type: '1', targets: [] } });
      }
    }
    set({ page: 0, formVisible: true });
  },

  // 设置方法
  setFormVisible: (visible) => set({ formVisible: visible }),
  setPage: (page) => set({ page }),
  setAutoReload: (autoReload) => set({ autoReload }),
  setFilterName: (name) => set({ f_name: name }),
  setFilterType: (type) => set({ f_type: type }),
  setFilterActive: (active) => set({ f_active: active }),
  setFilterGroup: (group) => set({ f_group: group }),
}));

export default useMonitorStore;
