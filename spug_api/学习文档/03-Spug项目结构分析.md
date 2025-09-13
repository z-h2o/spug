# 03 - Spug项目结构分析

## 🎯 学习目标
通过本文档，你将学会：
- 深入理解 Spug 项目的整体架构
- 掌握各个应用模块的功能和作用
- 理解项目的数据库设计思路
- 学会阅读和分析 Django 项目结构

## 🏗️ 第一部分：项目整体架构

### 1.1 目录结构总览
```
spug_api/
├── manage.py              # Django 管理入口
├── requirements.txt       # 项目依赖
├── db.sqlite3            # SQLite 数据库文件
├── spug/                 # 项目配置目录
│   ├── settings.py       # 项目设置
│   ├── urls.py          # 主 URL 路由
│   ├── wsgi.py          # WSGI 服务器接口
│   └── asgi.py          # ASGI 服务器接口（WebSocket）
├── apps/                 # 业务应用目录
│   ├── account/         # 用户账户管理
│   ├── host/            # 主机管理
│   ├── exec/            # 命令执行
│   ├── deploy/          # 应用部署
│   ├── monitor/         # 监控报警
│   ├── schedule/        # 任务调度
│   ├── config/          # 配置中心
│   ├── app/             # 应用管理
│   ├── alarm/           # 报警管理
│   ├── notify/          # 通知管理
│   ├── repository/      # 代码仓库
│   ├── setting/         # 系统设置
│   ├── home/            # 首页统计
│   ├── file/            # 文件管理
│   └── apis/            # 外部 API
├── libs/                 # 公共库
├── consumer/             # WebSocket 消费者
├── tools/                # 工具脚本
├── logs/                 # 日志目录
├── repos/                # 代码仓库目录
└── storage/              # 存储目录
```

### 1.2 技术架构图
```
前端 (React) ←→ API (Django REST) ←→ 数据库 (SQLite/MySQL)
                      ↓
                WebSocket (Channels)
                      ↓
              后台服务 (Worker/Scheduler)
                      ↓
               外部系统 (SSH/Git/监控)
```

## 📦 第二部分：核心应用模块详解

### 2.1 用户账户模块 (apps/account/)
**功能**：用户认证、权限管理、角色分配

**核心模型**：
```python
# User 模型 - 用户信息
class User(models.Model):
    username = models.CharField(max_length=100)      # 用户名
    nickname = models.CharField(max_length=100)      # 昵称
    password_hash = models.CharField(max_length=100) # 密码哈希
    is_supper = models.BooleanField(default=False)   # 是否超级用户
    is_active = models.BooleanField(default=True)    # 是否激活
    access_token = models.CharField(max_length=32)   # 访问令牌
    roles = models.ManyToManyField('Role')           # 用户角色

# Role 模型 - 角色权限
class Role(models.Model):
    name = models.CharField(max_length=50)           # 角色名称
    page_perms = models.TextField(null=True)         # 页面权限
    deploy_perms = models.TextField(null=True)       # 部署权限
    group_perms = models.TextField(null=True)        # 主机组权限
```

**主要功能**：
- 用户登录/登出
- 权限验证
- 角色管理
- 登录历史记录

### 2.2 主机管理模块 (apps/host/)
**功能**：服务器主机的管理和操作

**核心模型**：
```python
# Host 模型 - 主机信息
class Host(models.Model):
    name = models.CharField(max_length=100)          # 主机名称
    hostname = models.CharField(max_length=50)       # 主机地址
    port = models.IntegerField(null=True)            # SSH端口
    username = models.CharField(max_length=50)       # SSH用户名
    pkey = models.TextField(null=True)               # SSH私钥
    is_verified = models.BooleanField(default=False) # 是否验证通过

# HostExtend 模型 - 主机扩展信息
class HostExtend(models.Model):
    host = models.OneToOneField(Host, on_delete=models.CASCADE)
    cpu = models.IntegerField()                      # CPU核数
    memory = models.FloatField()                     # 内存大小
    os_name = models.CharField(max_length=50)        # 操作系统
    private_ip_address = models.CharField(max_length=255)  # 内网IP
    public_ip_address = models.CharField(max_length=255)   # 公网IP

# Group 模型 - 主机分组
class Group(models.Model):
    name = models.CharField(max_length=50)           # 分组名称
    hosts = models.ManyToManyField(Host, related_name='groups')
```

**主要功能**：
- 主机信息管理
- SSH连接验证
- 主机分组管理
- 主机状态监控

### 2.3 命令执行模块 (apps/exec/)
**功能**：在远程主机上执行命令和脚本

**主要功能**：
- 批量命令执行
- 实时输出显示
- 执行历史记录
- 文件传输

### 2.4 应用部署模块 (apps/deploy/)
**功能**：应用的自动化部署

**核心模型**：
```python
# DeployRequest 模型 - 部署请求
class DeployRequest(models.Model):
    STATUS = (
        ('-3', '发布异常'),
        ('-1', '已驳回'),
        ('0', '待审核'),
        ('1', '待发布'),
        ('2', '发布中'),
        ('3', '发布成功'),
    )
    deploy = models.ForeignKey(Deploy, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)          # 部署名称
    type = models.CharField(max_length=2)            # 部署类型
    host_ids = models.TextField()                    # 目标主机
    status = models.CharField(max_length=2)          # 部署状态
    version = models.CharField(max_length=100)       # 版本号
```

**主要功能**：
- 应用发布流程
- 版本管理
- 回滚功能
- 发布审核

### 2.5 监控报警模块 (apps/monitor/)
**功能**：系统监控和报警通知

**主要功能**：
- 站点监控
- 端口监控
- 进程监控
- 自定义监控
- 多渠道报警（邮件、钉钉、微信等）

### 2.6 任务调度模块 (apps/schedule/)
**功能**：定时任务的管理和执行

**主要功能**：
- Cron表达式支持
- 任务执行历史
- 任务状态监控
- 失败重试机制

## 🔧 第三部分：公共库模块 (libs/)

### 3.1 SSH连接库 (libs/ssh.py)
```python
class SSH:
    """SSH连接封装类"""
    def __init__(self, hostname, port, username, pkey):
        self.hostname = hostname
        self.port = port
        self.username = username
        self.pkey = pkey
    
    def exec_command(self, command):
        """执行远程命令"""
        # 实现SSH连接和命令执行
        pass
```

### 3.2 Git操作库 (libs/gitlib.py)
处理Git仓库的克隆、拉取、分支切换等操作。

### 3.3 邮件发送库 (libs/mail.py)
封装邮件发送功能，支持SMTP配置。

### 3.4 中间件 (libs/middleware.py)
```python
class AuthenticationMiddleware:
    """认证中间件"""
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # 检查用户认证状态
        # 验证访问权限
        response = self.get_response(request)
        return response
```

## 🗄️ 第四部分：数据库设计分析

### 4.1 数据库表结构
```sql
-- 用户相关表
users                    # 用户信息
roles                    # 角色信息
user_role_rel           # 用户角色关联表
login_histories         # 登录历史

-- 主机相关表
hosts                   # 主机信息
host_extend            # 主机扩展信息
host_groups            # 主机分组

-- 部署相关表
deploy_requests        # 部署请求
deploy_histories       # 部署历史

-- 监控相关表
monitor_groups         # 监控分组
monitor_contacts       # 监控联系人
```

### 4.2 表关系分析
```python
# 用户和角色：多对多关系
User.roles = ManyToManyField(Role)

# 主机和分组：多对多关系
Group.hosts = ManyToManyField(Host)

# 主机和扩展信息：一对一关系
HostExtend.host = OneToOneField(Host)

# 部署请求和用户：多对一关系
DeployRequest.created_by = ForeignKey(User)
```

## ⚡ 第五部分：异步处理架构

### 5.1 WebSocket 支持
```python
# consumer/consumers.py
class ExecConsumer(AsyncWebsocketConsumer):
    """命令执行的WebSocket消费者"""
    async def connect(self):
        # 建立WebSocket连接
        pass
    
    async def receive(self, text_data):
        # 接收前端消息
        pass
    
    async def send_message(self, event):
        # 发送消息到前端
        pass
```

### 5.2 后台任务处理
```python
# 工作进程 (runworker)
def worker_main():
    """工作进程主函数"""
    while True:
        # 从Redis队列获取任务
        # 执行任务
        # 返回结果
        pass

# 调度器 (runscheduler)
def scheduler_main():
    """调度器主函数"""
    scheduler = APScheduler()
    # 加载定时任务
    # 启动调度器
    scheduler.start()
```

## 🎯 第六部分：实践练习

### 6.1 探索项目结构
```bash
# 查看项目结构
tree -L 2 /Users/rui/Desktop/demo/spug/spug/spug_api/

# 查看应用列表
ls -la apps/

# 查看某个应用的结构
ls -la apps/account/
```

### 6.2 分析模型关系
```bash
# 进入Django shell
python manage.py shell
```

```python
# 查看用户模型
from apps.account.models import User, Role
print(User._meta.get_fields())

# 查看主机模型
from apps.host.models import Host, Group
print(Host._meta.get_fields())

# 查看表关系
user = User.objects.first()
print(f"用户角色: {user.roles.all()}")

host = Host.objects.first()
print(f"主机分组: {host.groups.all()}")
```

### 6.3 理解URL路由
```python
# 查看主URL配置
cat spug/urls.py

# 查看某个应用的URL配置
cat apps/account/urls.py

# 测试API接口
curl -X GET http://127.0.0.1:9001/api/account/self/
```

## 📊 第七部分：配置文件详解

### 7.1 Django设置 (spug/settings.py)
```python
# 关键配置项解释
INSTALLED_APPS = [
    'apps.account',      # 用户管理
    'apps.host',         # 主机管理
    # ... 其他应用
    'channels',          # WebSocket支持
]

# 数据库配置
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',  # 数据库引擎
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),  # 数据库文件
    }
}

# Redis配置
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
    }
}

# WebSocket通道配置
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("127.0.0.1", 6379)],
        },
    },
}
```

### 7.2 自定义配置项
```python
# Spug特有的配置
TOKEN_TTL = 8 * 3600              # Token有效期
SCHEDULE_KEY = 'spug:schedule'     # 调度任务Redis键
EXEC_WORKER_KEY = 'spug:exec:worker'  # 执行任务Redis键
REPOS_DIR = '/path/to/repos'       # 代码仓库目录
```

## ✅ 检查点

完成本文档学习后，你应该能够：

1. **理解项目架构**：
   - 知道各个目录的作用
   - 理解模块间的关系
   - 掌握数据流向

2. **分析业务模块**：
   ```python
   # 能够看懂模型定义
   from apps.account.models import User
   # 理解字段含义和关系
   ```

3. **理解配置文件**：
   - Django基础配置
   - 数据库配置
   - 缓存和WebSocket配置

## 🎯 下一步
完成本文档的学习和实践后，请继续学习：
**04-核心模块详解.md** - 深入学习各个核心模块的实现细节

## 💡 小贴士
- 使用 `python manage.py show_urls` 查看所有URL路由（需要安装django-extensions）
- 多使用 Django shell 探索模型关系
- 阅读代码时，从URL → View → Model的顺序理解业务流程
- 关注模型的 `__str__` 和 `to_dict` 方法，了解数据如何展示
