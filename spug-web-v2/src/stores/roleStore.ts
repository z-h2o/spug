/**
 * 角色管理 Store
 */
import { create } from 'zustand';
import http from '@/libs/http';

interface RoleRecord {
  id: number;
  name: string;
  desc?: string;
}

interface RoleState {
  // 数据状态
  records: RoleRecord[];
  idMap: Record<number, RoleRecord>;
  
  // UI状态
  isFetching: boolean;
  
  // 操作方法
  fetchRecords: () => Promise<void>;
}

const useRoleStore = create<RoleState>((set, get) => ({
  // 初始状态
  records: [],
  idMap: {},
  isFetching: false,

  // 操作方法
  fetchRecords: async () => {
    set({ isFetching: true });
    try {
      const res: any = await http.get('/api/account/role/');
      const idMap: Record<number, RoleRecord> = {};
      res.forEach((item: RoleRecord) => {
        idMap[item.id] = item;
      });
      set({ records: res, idMap });
    } finally {
      set({ isFetching: false });
    }
  },
}));

export default useRoleStore;
