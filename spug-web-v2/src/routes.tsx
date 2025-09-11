/**
 * 路由配置
 */
import React from 'react';
import {
  DashboardOutlined,
  DesktopOutlined,
  CloudServerOutlined,
  CodeOutlined,
  FlagOutlined,
  ScheduleOutlined,
  DeploymentUnitOutlined,
  MonitorOutlined,
  AlertOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { RouteConfig } from '@/types/route';

// 懒加载组件
const Home = React.lazy(() => import('@/pages/home'));
const Dashboard = React.lazy(() => import('@/pages/dashboard'));
const Host = React.lazy(() => import('@/pages/host'));
const Schedule = React.lazy(() => import('@/pages/schedule'));
const Monitor = React.lazy(() => import('@/pages/monitor'));

// 系统管理模块
const SystemAccount = React.lazy(() => import('@/pages/system/account'));
const SystemRole = React.lazy(() => import('@/pages/system/role'));
const SystemSetting = React.lazy(() => import('@/pages/system/setting'));
const SystemLogin = React.lazy(() => import('@/pages/system/login'));

// 欢迎页面
const WelcomeIndex = React.lazy(() => import('@/pages/welcome/index'));
const WelcomeInfo = React.lazy(() => import('@/pages/welcome/info'));

const routes: RouteConfig[] = [
  {
    icon: <DesktopOutlined />,
    title: '工作台',
    path: '/home',
    component: Home
  },
  {
    icon: <DashboardOutlined />,
    title: 'Dashboard',
    auth: 'dashboard.dashboard.view',
    path: '/dashboard',
    component: Dashboard
  },
  {
    icon: <CloudServerOutlined />,
    title: '主机管理',
    auth: 'host.host.view',
    path: '/host',
    component: Host
  },
  {
    icon: <CodeOutlined />,
    title: '批量执行',
    auth: 'exec.task.do|exec.template.view',
    child: [
      {
        title: '执行任务',
        auth: 'exec.task.do',
        path: '/exec/task',
        component: React.lazy(() => import('@/pages/exec/task'))
      },
      {
        title: '模板管理',
        auth: 'exec.template.view',
        path: '/exec/template',
        component: React.lazy(() => import('@/pages/exec/template'))
      },
      {
        title: '文件分发',
        auth: 'exec.transfer.do',
        path: '/exec/transfer',
        component: React.lazy(() => import('@/pages/exec/transfer'))
      }
    ]
  },
  {
    icon: <FlagOutlined />,
    title: '应用发布',
    auth: 'deploy.app.view|deploy.repository.view|deploy.request.view',
    child: [
      {
        title: '发布配置',
        auth: 'deploy.app.view',
        path: '/deploy/app',
        component: React.lazy(() => import('@/pages/deploy/app'))
      },
      {
        title: '构建仓库',
        auth: 'deploy.repository.view',
        path: '/deploy/repository',
        component: React.lazy(() => import('@/pages/deploy/repository'))
      },
      {
        title: '发布申请',
        auth: 'deploy.request.view',
        path: '/deploy/request',
        component: React.lazy(() => import('@/pages/deploy/request'))
      }
    ]
  },
  {
    icon: <ScheduleOutlined />,
    title: '任务计划',
    auth: 'schedule.schedule.view',
    path: '/schedule',
    component: Schedule
  },
  {
    icon: <DeploymentUnitOutlined />,
    title: '配置中心',
    auth: 'config.env.view|config.src.view|config.app.view',
    child: [
      {
        title: '环境管理',
        auth: 'config.env.view',
        path: '/config/environment',
        component: React.lazy(() => import('@/pages/config/environment'))
      },
      {
        title: '服务配置',
        auth: 'config.src.view',
        path: '/config/service',
        component: React.lazy(() => import('@/pages/config/service'))
      },
      {
        title: '应用配置',
        auth: 'config.app.view',
        path: '/config/app',
        component: React.lazy(() => import('@/pages/config/app'))
      },
      {
        path: '/config/setting/:type/:id',
        component: React.lazy(() => import('@/pages/config/setting'))
      }
    ]
  },
  {
    icon: <MonitorOutlined />,
    title: '监控中心',
    auth: 'monitor.monitor.view',
    path: '/monitor',
    component: Monitor
  },
  {
    icon: <AlertOutlined />,
    title: '报警中心',
    auth: 'alarm.alarm.view|alarm.contact.view|alarm.group.view',
    child: [
      {
        title: '报警历史',
        auth: 'alarm.alarm.view',
        path: '/alarm/alarm',
        component: React.lazy(() => import('@/pages/alarm/alarm'))
      },
      {
        title: '报警联系人',
        auth: 'alarm.contact.view',
        path: '/alarm/contact',
        component: React.lazy(() => import('@/pages/alarm/contact'))
      },
      {
        title: '报警联系组',
        auth: 'alarm.group.view',
        path: '/alarm/group',
        component: React.lazy(() => import('@/pages/alarm/group'))
      }
    ]
  },
  {
    icon: <SettingOutlined />,
    title: '系统管理',
    auth: 'system.account.view|system.role.view|system.setting.view',
    child: [
      {
        title: '登录日志',
        auth: 'system.login.view',
        path: '/system/login',
        component: SystemLogin
      },
      {
        title: '账户管理',
        auth: 'system.account.view',
        path: '/system/account',
        component: SystemAccount
      },
      {
        title: '角色管理',
        auth: 'system.role.view',
        path: '/system/role',
        component: SystemRole
      },
      {
        title: '系统设置',
        auth: 'system.setting.view',
        path: '/system/setting',
        component: SystemSetting
      }
    ]
  },
  // 特殊路由
  {
    path: '/welcome/index',
    component: WelcomeIndex
  },
  {
    path: '/welcome/info',
    component: WelcomeInfo
  }
];

export default routes;
