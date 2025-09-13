# 02 - Django框架基础

## 🎯 学习目标
通过本文档，你将学会：
- Django 框架的核心概念
- MVC/MVT 架构模式
- Django 项目的基本结构
- 模型（Models）、视图（Views）、URL 配置
- Django 管理命令的使用

## 📚 第一部分：Django 简介

### 1.1 什么是 Django？
Django 是一个高级的 Python Web 框架，特点：
- **快速开发**：内置很多常用功能
- **安全性**：自动处理安全问题
- **可扩展**：适合大型项目
- **DRY原则**：Don't Repeat Yourself（不要重复自己）

### 1.2 Django 的 MVT 架构
```
用户请求 → URL配置 → 视图(View) → 模板(Template) → 响应
                ↓
            模型(Model) ← → 数据库
```

- **Model（模型）**：数据层，定义数据结构
- **View（视图）**：业务逻辑层，处理请求
- **Template（模板）**：表现层，生成HTML（Spug项目中主要是API，较少用到）

## 🏗️ 第二部分：Spug 项目结构分析

### 2.1 项目根目录结构
```
spug_api/
├── manage.py           # Django管理脚本
├── requirements.txt    # 项目依赖
├── db.sqlite3         # SQLite数据库文件
├── spug/              # 项目配置目录
│   ├── __init__.py
│   ├── settings.py    # 项目设置
│   ├── urls.py        # 主URL配置
│   ├── wsgi.py        # WSGI服务器接口
│   └── asgi.py        # ASGI服务器接口（WebSocket支持）
├── apps/              # 应用目录
├── libs/              # 公共库
└── tools/             # 工具脚本
```

### 2.2 Django 应用结构
每个应用（如 `apps/account/`）的典型结构：
```
account/
├── __init__.py
├── models.py          # 数据模型
├── views.py           # 视图函数
├── urls.py            # URL配置
├── migrations/        # 数据库迁移文件
└── management/        # 自定义管理命令
```

## ⚙️ 第三部分：Django 核心概念

### 3.1 设置文件（settings.py）

让我们分析 Spug 的设置文件：

```python
# 基础设置
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECRET_KEY = 'vk0do47)egwzz!uk49%(y3s(fpx4+ha@ugt-hcv&%&d@hwr&p7'
DEBUG = True  # 开发模式
ALLOWED_HOSTS = ['127.0.0.1']  # 允许的主机

# 安装的应用
INSTALLED_APPS = [
    'apps.account',    # 账户管理
    'apps.host',       # 主机管理
    'apps.setting',    # 系统设置
    'apps.exec',       # 命令执行
    'apps.schedule',   # 任务调度
    'apps.monitor',    # 监控
    'apps.alarm',      # 报警
    'apps.config',     # 配置中心
    'apps.app',        # 应用管理
    'apps.deploy',     # 部署
    'apps.notify',     # 通知
    'apps.repository', # 仓库
    'apps.home',       # 首页
    'channels',        # WebSocket支持
]

# 数据库配置
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}
```

### 3.2 URL 配置

#### 主 URL 配置（spug/urls.py）
```python
from django.urls import path, include

urlpatterns = [
    path('api/account/', include('apps.account.urls')),
    path('api/host/', include('apps.host.urls')),
    path('api/deploy/', include('apps.deploy.urls')),
    # ... 其他应用的URL
]
```

#### 应用 URL 配置示例（apps/account/urls.py）
```python
from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login),      # POST /api/account/login/
    path('logout/', views.logout),    # POST /api/account/logout/
    path('self/', views.get_self),    # GET /api/account/self/
]
```

### 3.3 模型（Models）

模型定义数据结构，让我们看一个简单例子：

```python
# apps/account/models.py
from django.db import models

class User(models.Model):
    """用户模型"""
    username = models.CharField(max_length=50, unique=True)  # 用户名
    nickname = models.CharField(max_length=50)               # 昵称
    email = models.EmailField(null=True)                     # 邮箱
    is_active = models.BooleanField(default=True)            # 是否激活
    is_supper = models.BooleanField(default=False)           # 是否超级用户
    access_token = models.CharField(max_length=32)           # 访问令牌
    token_expired = models.IntegerField()                    # 令牌过期时间
    created_at = models.DateTimeField(auto_now_add=True)     # 创建时间
    
    def __str__(self):
        return self.username
    
    class Meta:
        db_table = 'users'  # 数据库表名
```

### 3.4 视图（Views）

视图处理业务逻辑，Spug 主要使用函数视图：

```python
# apps/account/views.py
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import User

@csrf_exempt
def login(request):
    """用户登录视图"""
    if request.method == 'POST':
        # 解析请求数据
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        # 验证用户
        try:
            user = User.objects.get(username=username)
            # 这里简化了密码验证逻辑
            return JsonResponse({
                'code': 0,
                'data': {
                    'access_token': user.access_token,
                    'nickname': user.nickname
                }
            })
        except User.DoesNotExist:
            return JsonResponse({
                'code': 1,
                'message': '用户不存在'
            })
    
    return JsonResponse({'code': 1, 'message': '请求方法错误'})
```

## 🔧 第四部分：Django 管理命令

### 4.1 常用管理命令

```bash
# 激活虚拟环境
source venv/bin/activate

# 创建数据库迁移文件
python manage.py makemigrations

# 执行数据库迁移
python manage.py migrate

# 创建超级用户
python manage.py createsuperuser

# 启动开发服务器
python manage.py runserver 127.0.0.1:8000

# 进入Django shell
python manage.py shell

# 收集静态文件
python manage.py collectstatic
```

### 4.2 Spug 自定义命令

Spug 项目有一些自定义的管理命令：

```bash
# 初始化数据库数据
python manage.py updatedb

# 创建用户
python manage.py user

# 运行工作进程
python manage.py runworker

# 运行调度器
python manage.py runscheduler

# 运行监控服务
python manage.py runmonitor
```

## 🛠️ 第五部分：实践练习

### 5.1 探索 Spug 数据库

```bash
# 进入Django shell
python manage.py shell
```

在shell中执行：
```python
# 导入用户模型
from apps.account.models import User

# 查看所有用户
users = User.objects.all()
print(f"用户总数: {users.count()}")

# 查看第一个用户
if users:
    first_user = users.first()
    print(f"用户名: {first_user.username}")
    print(f"昵称: {first_user.nickname}")
    print(f"是否激活: {first_user.is_active}")

# 退出shell
exit()
```

### 5.2 查看数据库表结构

```bash
# 查看所有迁移
python manage.py showmigrations

# 查看SQL语句（不执行）
python manage.py sqlmigrate account 0001
```

### 5.3 创建简单的测试视图

创建文件 `test_view.py`：
```python
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def hello_api(request):
    """简单的API测试"""
    if request.method == 'GET':
        return JsonResponse({
            'code': 0,
            'message': '欢迎学习Spug项目！',
            'data': {
                'project': 'Spug',
                'version': '3.3.3',
                'framework': 'Django'
            }
        })
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name', '未知用户')
            return JsonResponse({
                'code': 0,
                'message': f'你好, {name}！',
                'data': data
            })
        except json.JSONDecodeError:
            return JsonResponse({
                'code': 1,
                'message': '请求数据格式错误'
            })
```

## 📊 第六部分：理解 Spug 的 API 设计

### 6.1 统一的响应格式
Spug 使用统一的JSON响应格式：
```python
# 成功响应
{
    "code": 0,           # 0表示成功
    "data": {...}        # 返回的数据
}

# 错误响应
{
    "code": 1,           # 非0表示错误
    "message": "错误信息"
}
```

### 6.2 认证机制
Spug 使用token认证：
```python
# 请求头中包含
Authorization: Bearer <access_token>
```

### 6.3 中间件的作用
```python
# libs/middleware.py 中的认证中间件
class AuthenticationMiddleware:
    """认证中间件"""
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # 检查是否需要认证
        # 验证token
        # 设置当前用户
        response = self.get_response(request)
        return response
```

## ✅ 检查点

完成本文档学习后，你应该能够：

1. **理解Django基本概念**：
   - MVT架构模式
   - 模型、视图、URL的关系
   - 设置文件的作用

2. **使用Django管理命令**：
   ```bash
   python manage.py --help  # 查看所有可用命令
   python manage.py shell   # 进入Django shell
   python manage.py migrate # 执行数据库迁移
   ```

3. **读懂简单的Django代码**：
   - 模型定义
   - 视图函数
   - URL配置

## 🎯 下一步
完成本文档的学习和实践后，请继续学习：
**03-Spug项目结构分析.md** - 深入了解Spug项目的具体结构和各模块功能

## 💡 小贴士
- Django 官方文档：https://docs.djangoproject.com/
- 多使用 `python manage.py shell` 进行交互式学习
- 理解 Django 的 ORM（对象关系映射）概念
- 注意 Django 的安全特性（CSRF保护、SQL注入防护等）
