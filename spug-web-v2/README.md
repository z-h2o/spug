# Spug Web v2 - 现代化运维管理平台

基于 React 18 + Vite + Ant Design 重构的新版 Spug 运维管理平台前端项目。

## 🚀 技术栈

- **前端框架**: React 18.1.1
- **构建工具**: Vite 7.1.5
- **UI 组件库**: Ant Design 5.27.3 + @ant-design/icons 6.0.1
- **状态管理**: Zustand 5.0.8
- **路由管理**: React Router DOM 7.8.2
- **HTTP 客户端**: Axios 1.11.0
- **代码编辑器**: ACE Editor (ace-builds 1.43.3 + react-ace 14.0.1)
- **图表组件**: Apache ECharts 6.0.0 (echarts-for-react 3.0.2)
- **终端组件**: xterm 5.3.0
- **样式处理**: SCSS + CSS Modules
- **包管理器**: pnpm
- **类型检查**: TypeScript 5.8.3

## ✨ 主要特性

### 🏗️ 现代化架构
- **React 18**: 使用最新的 React 18 特性，包括并发特性和自动批处理
- **Vite**: 极速的开发服务器和构建工具
- **TypeScript**: 完整的类型支持，提高代码质量和开发效率
- **ESM**: 原生 ES 模块支持

### 🎨 优秀的用户体验
- **响应式设计**: 支持移动端和桌面端访问
- **主题定制**: 支持深色/浅色主题切换
- **懒加载**: 页面组件按需加载，优化首屏性能
- **国际化**: 完整的中文界面

### 🔒 完善的权限系统
- **路由级权限**: 根据用户权限动态生成路由
- **组件级权限**: AuthButton、AuthDiv、AuthFragment 权限控制组件
- **菜单权限**: 支持 OR (|) 和 AND (&) 逻辑的权限组合
- **按钮级权限**: 细粒度的操作权限控制

### 📦 模块化设计
- **清晰的目录结构**: 按功能模块组织代码
- **组件复用**: 通用组件和业务组件分离
- **工具函数**: 完善的工具函数库
- **类型定义**: 完整的 TypeScript 类型定义

## 📁 项目结构

```
src/
├── components/          # 公共组件
│   ├── AuthButton/     # 权限控制按钮
│   ├── AuthDiv/        # 权限控制容器
│   ├── AuthFragment/   # 权限控制片段
│   ├── NotFound/       # 404 页面
│   └── PagePlaceholder/ # 页面占位组件
├── layout/             # 布局组件
│   ├── Header.tsx      # 顶部导航
│   ├── Sider.tsx       # 侧边栏
│   ├── Footer.tsx      # 底部
│   └── index.tsx       # 主布局
├── libs/               # 核心库
│   └── http.ts         # HTTP 请求封装
├── pages/              # 页面组件
│   ├── home/           # 工作台
│   ├── dashboard/      # Dashboard
│   ├── host/           # 主机管理
│   ├── exec/           # 批量执行
│   ├── deploy/         # 应用发布
│   ├── schedule/       # 任务计划
│   ├── config/         # 配置中心
│   ├── monitor/        # 监控中心
│   ├── alarm/          # 报警中心
│   ├── system/         # 系统管理
│   ├── login/          # 登录页面
│   ├── ssh/            # SSH 终端
│   └── welcome/        # 欢迎页面
├── stores/             # 状态管理
│   └── globalStore.ts  # 全局状态
├── styles/             # 样式文件
│   ├── variables.scss  # SCSS 变量
│   └── global.scss     # 全局样式
├── types/              # 类型定义
│   └── route.ts        # 路由类型
├── utils/              # 工具函数
│   ├── auth.ts         # 权限管理
│   └── common.ts       # 通用工具
├── App.tsx             # 应用主组件
├── main.tsx            # 入口文件
└── routes.tsx          # 路由配置
```

## 🚀 快速开始

### 环境要求
- Node.js >= 20.19.0
- pnpm >= 8.0.0

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm run dev
```

### 构建生产版本
```bash
pnpm run build
```

### 预览生产版本
```bash
pnpm run preview
```

## 🔧 开发配置

### 代理配置
开发环境自动代理 `/api/*` 请求到 `http://127.0.0.1:9001`

### 路径别名
```typescript
{
  "@/*": ["src/*"],
  "components": ["src/components"],
  "libs": ["src/libs"],
  "pages": ["src/pages"],
  "stores": ["src/stores"],
  "utils": ["src/utils"],
  "assets": ["src/assets"]
}
```

## 📊 功能模块

### 核心模块
- **工作台**: 系统概览和快速访问
- **Dashboard**: 数据统计和可视化展示
- **主机管理**: 服务器资源管理
- **批量执行**: 批量任务执行和模板管理
- **应用发布**: 应用部署和版本管理
- **任务计划**: 定时任务调度
- **配置中心**: 配置文件管理
- **监控中心**: 系统监控和告警
- **报警中心**: 告警规则和通知管理
- **系统管理**: 用户、角色和系统设置

### 特殊功能
- **SSH 终端**: 基于 xterm.js 的 Web SSH 终端
- **代码编辑器**: 基于 ACE Editor 的配置文件编辑
- **图表展示**: 基于 ECharts 的数据可视化

## 🔐 权限系统

### 权限码规范
权限码采用三级命名结构：`模块.页面.操作`

**模块分类**:
- `dashboard`: Dashboard模块
- `host`: 主机管理模块  
- `exec`: 批量执行模块
- `deploy`: 应用发布模块
- `schedule`: 任务计划模块
- `config`: 配置中心模块
- `monitor`: 监控中心模块
- `alarm`: 报警中心模块
- `system`: 系统管理模块

**操作类型**:
- `view`: 查看权限
- `add`: 新增权限
- `edit`: 编辑权限
- `del`: 删除权限
- `do`: 执行权限

### 权限组合
- **OR 逻辑**: 使用 `|` 分隔，如 `host.host.view|host.host.edit`
- **AND 逻辑**: 使用 `&` 分隔，如 `host.host.view&host.host.edit`

## 🎨 样式系统

### SCSS 变量
项目使用 SCSS 预处理器，定义了完整的设计系统变量：
- 主题色彩
- 字体系统
- 间距规范
- 边框样式
- 阴影效果
- 响应式断点

### CSS Modules
组件样式使用 CSS Modules，避免样式冲突：
```scss
// index.module.scss
.container {
  padding: 24px;
}
```

## 📱 响应式设计

项目支持多种设备访问：
- **桌面端**: >= 1200px
- **平板端**: 768px - 1199px  
- **移动端**: < 768px

移动端会自动收起侧边栏并提示横屏使用。

## 🔄 状态管理

使用 Zustand 进行状态管理：
- **轻量级**: 仅 2.9kb gzipped
- **简单 API**: 无需样板代码
- **TypeScript 友好**: 完整的类型支持
- **开发工具**: 支持 Redux DevTools

## 🚀 性能优化

- **代码分割**: 使用 React.lazy 进行路由级代码分割
- **懒加载**: 页面组件按需加载
- **Tree Shaking**: 自动移除未使用的代码
- **资源优化**: Vite 自动优化静态资源
- **缓存策略**: 合理的缓存配置

## 🔒 安全特性

- **前端权限控制**: 仅用于 UI 展示控制
- **Token 认证**: 基于 JWT 的身份验证
- **请求拦截**: 自动添加认证头
- **错误处理**: 统一的错误处理机制

> **重要提醒**: 前端权限控制仅用于用户体验优化，实际的权限验证必须在后端实现。

## 📝 开发规范

### 代码规范
- 使用 ESLint 进行代码检查
- 使用 TypeScript 进行类型检查
- 遵循 React 最佳实践

### 提交规范
建议使用语义化提交信息：
- `feat`: 新功能
- `fix`: 修复问题
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建或工具相关

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'feat: add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建 Pull Request

## 📄 许可证

本项目基于原 Spug 项目重构，遵循 AGPL-3.0 许可证。

## 🙏 致谢

感谢原 [Spug](https://github.com/openspug/spug) 项目提供的优秀基础架构和设计思路。

---

**Spug Web v2** - 让运维管理更简单、更现代化！