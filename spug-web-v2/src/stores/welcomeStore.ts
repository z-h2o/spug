/**
 * 欢迎页面信息状态管理
 */
import { create } from 'zustand';
import http from '@/libs/http';

export interface User {
  id?: number;
  username?: string;
  nickname?: string;
  email?: string;
}

interface WelcomeState {
  user: User;
  fetchUser: () => Promise<void>;
}

const useWelcomeStore = create<WelcomeState>((set, get) => ({
  user: {},

  fetchUser: async () => {
    try {
      const res = await http.get('/api/account/self/');
      set({ user: res.data || res });
    } catch (error) {
      // Error handled by http interceptor
    }
  },
}));

export default useWelcomeStore;
