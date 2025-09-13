# 01 - Python基础和环境准备

## 🎯 学习目标
通过本文档，你将学会：
- Python 基础语法和概念
- 如何搭建 Python 开发环境
- 理解虚拟环境的重要性
- 掌握包管理工具的使用

## 📚 第一部分：Python 基础概念

### 1.1 什么是 Python？
Python 是一种高级编程语言，具有以下特点：
- **简洁易读**：语法接近自然语言
- **跨平台**：可在 Windows、macOS、Linux 运行
- **丰富的库**：有大量第三方库可以使用
- **解释型语言**：无需编译，直接运行

### 1.2 Python 基础语法

#### 变量和数据类型
```python
# 字符串
name = "Spug"
description = '自动化运维平台'

# 数字
port = 9001
version = 3.3

# 布尔值
debug_mode = True
is_production = False

# 列表（类似数组）
apps = ['account', 'host', 'deploy', 'monitor']

# 字典（键值对）
config = {
    'host': '127.0.0.1',
    'port': 9001,
    'debug': True
}
```

#### 函数定义
```python
def start_server(port):
    """启动服务器的函数"""
    print(f"服务器启动在端口 {port}")
    return True

# 调用函数
result = start_server(9001)
```

#### 类和对象
```python
class Server:
    """服务器类"""
    def __init__(self, name, port):
        self.name = name
        self.port = port
    
    def start(self):
        print(f"{self.name} 服务器启动在端口 {self.port}")

# 创建对象
api_server = Server("API", 9001)
api_server.start()
```

## 🔧 第二部分：环境准备

### 2.1 检查 Python 版本
```bash
# 检查 Python 版本（需要 3.6+）
python3 --version
# 或者
python --version
```

### 2.2 创建项目目录
```bash
# 进入项目目录
cd /Users/rui/Desktop/demo/spug/spug/spug_api

# 查看项目文件
ls -la
```

### 2.3 创建虚拟环境
虚拟环境的作用：
- **隔离项目依赖**：不同项目使用不同版本的库
- **避免冲突**：防止全局安装的包影响项目
- **便于部署**：可以精确复制运行环境

```bash
# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境（macOS/Linux）
source venv/bin/activate

# 激活后，命令行前面会显示 (venv)
# (venv) $ 

# 停用虚拟环境（当不需要时）
deactivate
```

### 2.4 安装项目依赖
```bash
# 确保虚拟环境已激活
source venv/bin/activate

# 安装项目依赖
pip install -r requirements.txt

# 查看已安装的包
pip list
```

## 📦 第三部分：理解依赖文件

### 3.1 requirements.txt 解读
```txt
apscheduler==3.7.0      # 任务调度器，用于定时任务
Django==2.2.28          # Web框架，项目的核心
asgiref==3.2.10         # ASGI服务器，支持异步
channels==2.3.1         # WebSocket支持
channels_redis==2.4.1   # Redis通道层
paramiko==2.11.0        # SSH连接库，用于远程主机操作
django-redis==4.10.0    # Django的Redis缓存
requests==2.32.0        # HTTP请求库
GitPython==3.1.41       # Git操作库
python-ldap==3.4.0      # LDAP认证支持
openpyxl==3.0.3         # Excel文件处理
user_agents==2.2.0      # 用户代理解析
```

### 3.2 包的作用说明
- **Django**：整个项目的Web框架基础
- **channels**：实现WebSocket实时通信
- **paramiko**：SSH连接，执行远程命令
- **apscheduler**：定时任务调度
- **requests**：发送HTTP请求
- **redis相关**：缓存和消息队列

## 🛠️ 第四部分：开发工具准备

### 4.1 推荐的代码编辑器
- **VSCode**：免费，插件丰富
- **PyCharm**：专业的Python IDE
- **Cursor**：你现在使用的AI辅助编辑器

### 4.2 有用的VSCode插件
- Python
- Django
- GitLens
- Python Docstring Generator

### 4.3 命令行工具
```bash
# 查看Python路径
which python3

# 查看pip版本
pip --version

# 查看虚拟环境中的Python
which python  # 在激活虚拟环境后
```

## 🎯 第五部分：实践练习

### 5.1 创建第一个Python文件
创建文件 `hello_spug.py`：
```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

def main():
    """主函数"""
    print("欢迎学习 Spug 项目！")
    
    # 模拟项目信息
    project_info = {
        'name': 'Spug',
        'version': '3.3.3',
        'description': '轻量级无Agent的自动化运维平台',
        'apps': ['account', 'host', 'deploy', 'monitor']
    }
    
    print(f"项目名称: {project_info['name']}")
    print(f"版本: {project_info['version']}")
    print(f"描述: {project_info['description']}")
    print("包含的应用:")
    for app in project_info['apps']:
        print(f"  - {app}")

if __name__ == '__main__':
    main()
```

运行测试：
```bash
python hello_spug.py
```

### 5.2 理解项目启动流程
```python
# manage.py 的简化版本
import os
import sys

def main():
    # 设置Django配置模块
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'spug.settings')
    
    try:
        # 导入Django管理命令
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "无法导入Django。请确保已安装Django并且"
            "PYTHONPATH环境变量正确设置。"
            "是否忘记激活虚拟环境？"
        ) from exc
    
    # 执行命令行参数
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
```

## ✅ 检查点

完成本文档学习后，你应该能够：

1. **环境检查**：
   ```bash
   python3 --version  # 显示版本号
   source venv/bin/activate  # 激活虚拟环境
   pip list  # 显示已安装的包
   ```

2. **理解基本概念**：
   - 什么是虚拟环境，为什么需要它
   - requirements.txt 的作用
   - Python 基本语法

3. **能够运行简单的Python代码**

## 🎯 下一步
完成本文档的学习和实践后，请继续学习：
**02-Django框架基础.md** - 了解Django Web框架的核心概念

## 💡 小贴士
- 遇到问题时，善用 `python --help` 或 `pip --help`
- 保持虚拟环境激活状态进行开发
- 多动手实践，不要只看不做
- 有疑问可以查看官方文档：https://docs.python.org/3/
