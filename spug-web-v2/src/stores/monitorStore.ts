/**
 * 监控管理状态管理
 */
import { create } from 'zustand';
import http from '@/libs/http';
import { message } from 'antd';
import { includes } from '@/utils/functools';
import moment from 'moment';
import { cloneDeep } from 'lodash';

export interface MonitorRecord {
  id?: number;
  name: string;
  desc?: string;
  type: string;
  type_alias: string;
  group: string;
  targets: string[] | number[];
  extra?: string;
  is_active: boolean;
  latest_run_time?: string;
  latest_run_time_alias?: string | null;
  rate?: number;
  threshold?: number;
  notify_grp?: number[];
  notify_mode?: string[];
  quiet?: number;
}

export interface MonitorOverview {
  id: number;
  name: string;
  type: string;
  group: string;
  status: string;
  target: string;
  duration?: string;
  desc?: string;
  latest_run_time?: string;
}

interface MonitorState {
  autoReload: boolean | null;
  records: MonitorRecord[];
  record: Partial<MonitorRecord>;
  types: string[];
  groups: string[];
  overviews: MonitorOverview[];
  page: number;
  isFetching: boolean;
  formVisible: boolean;
  ovFetching: boolean;

  f_name?: string;
  f_type?: string;
  f_active: string;
  f_group?: string;

  fetchRecords: () => Promise<void>;
  fetchOverviews: () => Promise<void>;
  showForm: (info?: MonitorRecord) => void;
  setFormVisible: (visible: boolean) => void;
  setPage: (page: number) => void;
  updateRecord: (updates: Partial<MonitorRecord>) => void;
  deleteRecord: (id: number) => Promise<void>;
  toggleActive: (id: number, is_active: boolean) => Promise<void>;
  getDataSource: () => MonitorRecord[];
  getOvDataSource: () => MonitorOverview[];
  setFilters: (filters: { f_name?: string; f_type?: string; f_active?: string; f_group?: string }) => void;
  setAutoReload: (autoReload: boolean | null) => void;
  setFilterGroup: (group: string) => void;
  setFilterType: (type: string) => void;
  setFilterName: (name: string) => void;
  setFilterActive: (active: string) => void;
}

const useMonitorStore = create<MonitorState>((set, get) => ({
  autoReload: null,
  records: [],
  record: {},
  types: [],
  groups: [],
  overviews: [],
  page: 0,
  isFetching: false,
  formVisible: false,
  ovFetching: false,

  f_name: '',
  f_type: '',
  f_active: '',
  f_group: '',

  fetchRecords: async () => {
    set({ isFetching: true });
    try {
      const res = await http.get('/api/monitor/');
      const { groups, detections } = res.data || res;
      const tmp = new Set<string>();
      
      detections.forEach((item: MonitorRecord) => {
        tmp.add(item.type_alias);
        const value = item.latest_run_time;
        item.latest_run_time_alias = value ? moment(value).fromNow() : null;
      });

      set({
        types: Array.from(tmp),
        records: detections,
        groups,
        isFetching: false
      });
    } catch (error) {
      set({ isFetching: false });
    }
  },

  fetchOverviews: async () => {
    const { autoReload } = get();
    if (autoReload === false) return;
    
    set({ ovFetching: true });
    try {
      const res = await http.get('/api/monitor/overview/');
      set({ overviews: res.data || res, ovFetching: false });
      
      if (autoReload) {
        setTimeout(() => get().fetchOverviews(), 5000);
      }
    } catch (error) {
      set({ ovFetching: false });
    }
  },

  showForm: (info) => {
    let record: Partial<MonitorRecord>;
    if (info) {
      record = cloneDeep(info);
    } else if (get().record.id || !get().record.type) {
      record = { type: '1', targets: [] };
    } else {
      record = get().record;
    }
    
    set({
      record,
      page: 0,
      formVisible: true
    });
  },

  setFormVisible: (visible) => set({ formVisible: visible }),
  setPage: (page) => set({ page }),

  updateRecord: (updates) => {
    set(state => ({
      record: { ...state.record, ...updates }
    }));
  },

  deleteRecord: async (id: number) => {
    try {
      await http.delete('/api/monitor/', { params: { id } });
      message.success('删除成功');
      get().fetchRecords();
      get().fetchOverviews();
    } catch (error) {
      // Error handled by http interceptor
    }
  },

  toggleActive: async (id: number, is_active: boolean) => {
    try {
      await http.patch('/api/monitor/', { id, is_active });
      message.success('操作成功');
      get().fetchRecords();
      get().fetchOverviews();
    } catch (error) {
      // Error handled by http interceptor
    }
  },

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

  setFilters: (filters) => {
    set(state => ({ ...state, ...filters }));
  },

  setAutoReload: (autoReload) => set({ autoReload }),
  
  setFilterGroup: (group) => set({ f_group: group }),
  setFilterType: (type) => set({ f_type: type }),
  setFilterName: (name) => set({ f_name: name }),
  setFilterActive: (active) => set({ f_active: active }),
}));

export default useMonitorStore;