/**
 * 任务计划 Store
 */
import { create } from 'zustand';
import http from '@/libs/http';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface ScheduleRecord {
  id: number;
  name: string;
  type: string;
  desc?: string;
  is_active: boolean;
  latest_status?: number;
  latest_status_alias?: string;
  latest_run_time?: string;
  latest_run_time_alias?: string;
  interpreter?: string;
  rst_notify?: any;
  trigger?: string;
  h_id?: string;
  command?: string;
  targets?: any[];
  trigger_args?: any;
}

interface ScheduleState {
  // 数据状态
  records: ScheduleRecord[];
  types: string[];
  record: Partial<ScheduleRecord>;
  page: number;
  targets: (any | undefined)[];
  
  // UI状态
  isFetching: boolean;
  formVisible: boolean;
  infoVisible: boolean;
  recordVisible: boolean;
  
  // 过滤状态
  f_status?: number;
  f_active: string;
  f_name?: string;
  f_type?: string;
  
  // 计算属性方法
  getDataSource: () => ScheduleRecord[];
  
  // 操作方法
  fetchRecords: () => Promise<void>;
  showForm: (info?: Partial<ScheduleRecord>) => void;
  showInfo: (info?: ScheduleRecord, h_id?: string) => void;
  showRecord: (info: ScheduleRecord) => void;
  editTarget: (index: number, v: any) => void;
  delTarget: (index: number) => void;
  
  // 设置方法
  setFormVisible: (visible: boolean) => void;
  setInfoVisible: (visible: boolean) => void;
  setRecordVisible: (visible: boolean) => void;
  setPage: (page: number) => void;
  setFilterStatus: (status?: number) => void;
  setFilterActive: (active: string) => void;
  setFilterName: (name?: string) => void;
  setFilterType: (type?: string) => void;
}

const useScheduleStore = create<ScheduleState>((set, get) => ({
  // 初始状态
  records: [],
  types: [],
  record: {},
  page: 0,
  targets: [undefined],
  isFetching: false,
  formVisible: false,
  infoVisible: false,
  recordVisible: false,
  f_status: undefined,
  f_active: '',
  f_name: undefined,
  f_type: undefined,

  // 计算属性方法
  getDataSource: () => {
    const { records, f_active, f_name, f_type, f_status } = get();
    let filteredRecords = records;
    
    if (f_active) {
      filteredRecords = filteredRecords.filter(x => x.is_active === (f_active === '1'));
    }
    
    if (f_name) {
      filteredRecords = filteredRecords.filter(x => 
        x.name.toLowerCase().includes(f_name.toLowerCase())
      );
    }
    
    if (f_type) {
      filteredRecords = filteredRecords.filter(x => 
        x.type.toLowerCase().includes(f_type.toLowerCase())
      );
    }
    
    if (f_status !== undefined) {
      if (f_status === -1) {
        filteredRecords = filteredRecords.filter(x => x.is_active && !x.latest_status_alias);
      } else {
        filteredRecords = filteredRecords.filter(x => x.latest_status === f_status);
      }
    }
    
    return filteredRecords;
  },

  // 操作方法
  fetchRecords: async () => {
    set({ isFetching: true });
    try {
      const res: any = await http.get('/api/schedule/');
      const tasks = res.tasks.map((item: ScheduleRecord) => {
        const value = item.latest_run_time;
        item.latest_run_time_alias = value ? dayjs(value).fromNow() : undefined;
        item.latest_run_time = value || '1970-01-01';
        return item;
      });
      set({ records: tasks, types: res.types });
    } finally {
      set({ isFetching: false });
    }
  },

  showForm: (info = {}) => {
    set({
      page: 0,
      record: info.id ? info : { 
        interpreter: 'sh', 
        rst_notify: { mode: '0' }, 
        trigger: 'interval' 
      },
      formVisible: true
    });
  },

  showInfo: (info, h_id = 'latest') => {
    const record = info ? { ...info, h_id } : { ...get().record, h_id };
    set({ record, infoVisible: true });
  },

  showRecord: (info) => {
    set({ recordVisible: true, record: info });
  },

  editTarget: (index, v) => {
    const targets = [...get().targets];
    targets[index] = v;
    set({ targets });
  },

  delTarget: (index) => {
    const targets = [...get().targets];
    targets.splice(index, 1);
    set({ targets });
  },

  // 设置方法
  setFormVisible: (visible) => set({ formVisible: visible }),
  setInfoVisible: (visible) => set({ infoVisible: visible }),
  setRecordVisible: (visible) => set({ recordVisible: visible }),
  setPage: (page) => set({ page }),
  setFilterStatus: (status) => set({ f_status: status }),
  setFilterActive: (active) => set({ f_active: active }),
  setFilterName: (name) => set({ f_name: name }),
  setFilterType: (type) => set({ f_type: type }),
}));

export default useScheduleStore;
