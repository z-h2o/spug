/**
 * 路由类型定义
 */
import type { ReactNode } from 'react';

export interface RouteConfig {
  path?: string;
  component?: React.ComponentType<any>;
  title?: string;
  icon?: ReactNode;
  auth?: string;
  child?: RouteConfig[];
}
