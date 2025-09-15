# Spug 项目启动指南

## 🎯 概述

本文档将详细指导你如何启动 Spug 自动化运维平台，包括环境准备、依赖安装、数据库初始化、服务启动等完整流程。

## 📋 系统要求

### 基础环境
- **操作系统**: macOS / Linux / Windows
- **Python版本**: 3.6 或更高版本
- **数据库**: SQLite3 (默认) / MySQL / PostgreSQL
- **缓存**: Redis 5.0+
- **内存**: 建议 2GB 以上
- **磁盘**: 建议 5GB 以上可用空间

### 必需服务
- Redis 服务器（用于缓存和消息队列）

## 🔧 第一步：环境准备

### 1.1 检查 Python 版本
```bash
# 检查 Python 版本
python3 --version
# 或
python --version

# 如果版本低于 3.6，需要升级 Python
```

### 1.2 安装 Redis

**macOS (使用 Homebrew):**
```bash
# 安装 Redis
brew install redis

# 启动 Redis 服务
brew services start redis

# 验证 Redis 是否运行
redis-cli ping
# 应该返回 PONG
```

**Ubuntu/Debian:**
```bash
# 更新包列表
sudo apt update

# 安装 Redis
sudo apt install redis-server

# 启动 Redis 服务
sudo systemctl start redis-server
sudo systemctl enable redis-server

# 验证 Redis
redis-cli ping
```

**CentOS/RHEL:**
```bash
# 安装 EPEL 仓库
sudo yum install epel-release

# 安装 Redis
sudo yum install redis

# 启动 Redis 服务
sudo systemctl start redis
sudo systemctl enable redis

# 验证 Redis
redis-cli ping
```

## 📦 第二步：项目准备

### 2.1 进入项目目录
```bash
cd /Users/rui/Desktop/demo/spug/spug/spug_api
```

### 2.2 创建虚拟环境
```bash
# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境 (macOS/Linux)
source venv/bin/activate

# 激活虚拟环境 (Windows)
# venv\Scripts\activate

# 验证虚拟环境已激活
# 命令行前面应该显示 (venv)
which python
```

### 2.3 安装项目依赖
```bash
# 确保虚拟环境已激活
source venv/bin/activate

# 升级 pip
pip install --upgrade pip

# 安装项目依赖
pip install -r requirements.txt

# 安装额外的服务器依赖
pip install gunicorn daphne

# 验证依赖安装
pip list
```

## 🗄️ 第三步：数据库初始化

### 3.1 执行数据库迁移
```bash
# 确保在项目根目录且虚拟环境已激活
cd /Users/rui/Desktop/demo/spug/spug/spug_api
source venv/bin/activate

# 生成迁移文件（如果需要）
python manage.py makemigrations

# 执行数据库迁移
python manage.py migrate

# 验证迁移是否成功
python manage.py showmigrations
```

### 3.2 初始化系统数据
```bash
# 初始化系统基础数据
python manage.py updatedb

# 创建超级管理员用户
python manage.py user

# 按提示输入：
# 用户名: admin
# 密码: (输入你的密码，建议8位以上包含数字和字母)
# 昵称: 管理员
```

### 3.3 验证数据库
```bash
# 进入 Django shell 验证
python manage.py shell

# 在 shell 中执行
from apps.account.models import User
users = User.objects.all()
print(f"用户总数: {users.count()}")
if users.exists():
    admin = users.first()
    print(f"管理员用户: {admin.username}")
# 退出 shell
exit()
```

## 🚀 第四步：启动服务

Spug 需要启动多个服务才能完整运行。建议使用多个终端窗口分别启动。

### 4.1 方式一：使用启动脚本（推荐）

**终端 1 - API 服务 (端口 9001):**
```bash
cd /Users/rui/Desktop/demo/spug/spug/spug_api
source venv/bin/activate
./tools/start-api.sh
```

**终端 2 - WebSocket 服务 (端口 9002):**
```bash
cd /Users/rui/Desktop/demo/spug/spug/spug_api
source venv/bin/activate
./tools/start-ws.sh
```

**终端 3 - 工作进程:**
```bash
cd /Users/rui/Desktop/demo/spug/spug/spug_api
source venv/bin/activate
./tools/start-worker.sh
```

**终端 4 - 调度器:**
```bash
cd /Users/rui/Desktop/demo/spug/spug/spug_api
source venv/bin/activate
./tools/start-scheduler.sh
```

**终端 5 - 监控服务:**
```bash
cd /Users/rui/Desktop/demo/spug/spug/spug_api
source venv/bin/activate
./tools/start-monitor.sh
```

### 4.2 方式二：手动启动服务

**终端 1 - API 服务:**
```bash
cd /Users/rui/Desktop/demo/spug/spug/spug_api
source venv/bin/activate
gunicorn -b 127.0.0.1:9001 -w 2 --threads 8 --access-logfile - spug.wsgi
```

**终端 2 - WebSocket 服务:**
```bash
cd /Users/rui/Desktop/demo/spug/spug/spug_api
source venv/bin/activate
daphne -p 9002 spug.asgi:application
```

**终端 3 - 工作进程:**
```bash
cd /Users/rui/Desktop/demo/spug/spug/spug_api
source venv/bin/activate
python manage.py runworker
```

**终端 4 - 调度器:**
```bash
cd /Users/rui/Desktop/demo/spug/spug/spug_api
source venv/bin/activate
python manage.py runscheduler
```

**终端 5 - 监控服务:**
```bash
cd /Users/rui/Desktop/demo/spug/spug/spug_api
source venv/bin/activate
python manage.py runmonitor
```

### 4.3 方式三：开发模式（仅用于开发测试）

```bash
cd /Users/rui/Desktop/demo/spug/spug/spug_api
source venv/bin/activate
python manage.py runserver 127.0.0.1:9001
```

## 🌐 第五步：验证启动

### 5.1 检查服务状态

**检查 API 服务:**
```bash
# 测试 API 服务是否正常
curl http://127.0.0.1:9001/api/account/login/

# 应该返回类似这样的响应:
# {"code": 1, "message": "请输入用户名"}
```

**检查 WebSocket 服务:**
```bash
# 使用 telnet 测试 WebSocket 端口
telnet 127.0.0.1 9002

# 或者检查端口占用
lsof -i :9002
```

**检查 Redis 连接:**
```bash
redis-cli ping
# 应该返回 PONG
```

### 5.2 访问管理界面

1. **启动前端项目**（如果有的话）
2. **或者通过 API 测试登录:**

```bash
# 测试登录 API
curl -X POST http://127.0.0.1:9001/api/account/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your_password"}'

# 成功响应示例:
# {"code": 0, "data": {"access_token": "xxx", "nickname": "管理员"}}
```

## 📝 第六步：配置和自定义

### 6.1 修改配置文件

**编辑 spug/settings.py:**
```python
# 允许的主机（生产环境需要修改）
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', 'your-domain.com']

# 调试模式（生产环境设为 False）
DEBUG = True

# 数据库配置（如需使用 MySQL）
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'spug',
        'USER': 'spug_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}

# Redis 配置
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}
```

### 6.2 生产环境配置

**创建生产环境配置文件 spug/overrides.py:**
```python
# 生产环境配置覆盖
DEBUG = False
ALLOWED_HOSTS = ['your-production-domain.com']

# 安全密钥（请更换为随机字符串）
SECRET_KEY = 'your-production-secret-key'

# 数据库配置
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'spug_prod',
        'USER': 'spug_prod_user',
        'PASSWORD': 'strong_password',
        'HOST': 'db-server',
        'PORT': '3306',
        'OPTIONS': {
            'charset': 'utf8mb4',
        },
    }
}
```

## 🛠️ 第七步：进程管理（可选）

### 7.1 使用 Supervisor 管理进程

**安装 Supervisor:**
```bash
pip install supervisor
```

**配置文件 /etc/supervisor/conf.d/spug.conf:**
```ini
[group:spug]
programs=spug-api,spug-ws,spug-worker,spug-scheduler,spug-monitor

[program:spug-api]
command=/Users/rui/Desktop/demo/spug/spug/spug_api/venv/bin/gunicorn -b 127.0.0.1:9001 -w 2 --threads 8 spug.wsgi
directory=/Users/rui/Desktop/demo/spug/spug/spug_api
user=spug
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/spug/api.log

[program:spug-ws]
command=/Users/rui/Desktop/demo/spug/spug/spug_api/venv/bin/daphne -p 9002 spug.asgi:application
directory=/Users/rui/Desktop/demo/spug/spug/spug_api
user=spug
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/spug/ws.log

[program:spug-worker]
command=/Users/rui/Desktop/demo/spug/spug/spug_api/venv/bin/python manage.py runworker
directory=/Users/rui/Desktop/demo/spug/spug/spug_api
user=spug
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/spug/worker.log

[program:spug-scheduler]
command=/Users/rui/Desktop/demo/spug/spug/spug_api/venv/bin/python manage.py runscheduler
directory=/Users/rui/Desktop/demo/spug/spug/spug_api
user=spug
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/spug/scheduler.log

[program:spug-monitor]
command=/Users/rui/Desktop/demo/spug/spug/spug_api/venv/bin/python manage.py runmonitor
directory=/Users/rui/Desktop/demo/spug/spug/spug_api
user=spug
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/spug/monitor.log
```

**启动 Supervisor:**
```bash
# 重新加载配置
sudo supervisorctl reread
sudo supervisorctl update

# 启动所有服务
sudo supervisorctl start spug:*

# 查看状态
sudo supervisorctl status
```

## 🐛 故障排除

### 常见问题及解决方案

**1. Redis 连接失败**
```bash
# 检查 Redis 是否运行
ps aux | grep redis

# 启动 Redis
brew services start redis  # macOS
sudo systemctl start redis  # Linux
```

**2. 端口占用问题**
```bash
# 查看端口占用
lsof -i :9001
lsof -i :9002

# 杀死占用进程
kill -9 <PID>
```

**3. 数据库迁移失败**
```bash
# 重置迁移
python manage.py migrate --fake-initial

# 或者删除迁移文件重新生成
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
python manage.py makemigrations
python manage.py migrate
```

**4. 模块导入错误**
```bash
# 检查 Python 路径
python -c "import sys; print('\n'.join(sys.path))"

# 确保在项目根目录
pwd
ls manage.py
```

**5. 权限问题**
```bash
# 给启动脚本执行权限
chmod +x tools/*.sh

# 检查文件权限
ls -la tools/
```

## 📊 监控和日志

### 查看日志
```bash
# API 服务日志
tail -f logs/api.log

# 错误日志
tail -f logs/error.log

# Django 日志
python manage.py shell
import logging
logging.basicConfig(level=logging.DEBUG)
```

### 性能监控
```bash
# 检查内存使用
ps aux | grep python

# 检查 Redis 状态
redis-cli info memory

# 检查数据库连接
python manage.py dbshell
```

## ✅ 启动成功检查清单

- [ ] Redis 服务正常运行
- [ ] 虚拟环境已激活
- [ ] 所有依赖已安装
- [ ] 数据库迁移完成
- [ ] 管理员用户已创建
- [ ] API 服务启动成功 (端口 9001)
- [ ] WebSocket 服务启动成功 (端口 9002)
- [ ] 工作进程正常运行
- [ ] 调度器正常运行
- [ ] 监控服务正常运行
- [ ] 能够正常调用 API 接口

## 🎉 恭喜！

如果完成了以上所有步骤并且检查清单全部通过，那么恭喜你已经成功启动了 Spug 项目！

### 下一步建议：
1. 阅读 [学习文档](./学习文档/README.md) 深入了解项目
2. 配置你的第一个主机
3. 尝试执行远程命令
4. 设置监控和报警

### 技术支持：
- [Spug 官方文档](https://ops.spug.cc/docs/)
- [GitHub Issues](https://github.com/openspug/spug/issues)
- [官方网站](https://www.spug.cc)

---

**最后更新**: 2025年9月  
**文档版本**: v1.0
