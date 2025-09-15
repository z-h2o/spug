#!/bin/bash
# Spug 一键启动脚本
# 作者: AI Assistant
# 功能: 一键启动所有 Spug 服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"

# 检查是否在正确的目录
if [ ! -f "$PROJECT_DIR/manage.py" ]; then
    log_error "错误: 未找到 manage.py 文件，请确保在正确的项目目录下运行此脚本"
    exit 1
fi

log_info "开始启动 Spug 项目..."
log_info "项目目录: $PROJECT_DIR"

# 检查Python环境
check_python() {
    log_info "检查 Python 环境..."
    
    if command -v python3 &> /dev/null; then
        PYTHON=python3
    elif command -v python &> /dev/null; then
        PYTHON=python
    else
        log_error "未找到 Python，请先安装 Python 3.6+"
        exit 1
    fi
    
    # 检查Python版本
    PYTHON_VERSION=$($PYTHON --version 2>&1 | awk '{print $2}')
    log_success "找到 Python: $PYTHON_VERSION"
}

# 检查并激活虚拟环境
check_venv() {
    log_info "检查虚拟环境..."
    
    if [ -d "$PROJECT_DIR/venv" ]; then
        log_info "激活虚拟环境..."
        source "$PROJECT_DIR/venv/bin/activate"
        log_success "虚拟环境已激活"
    else
        log_warning "未找到虚拟环境，将在系统环境中运行"
        log_warning "建议创建虚拟环境: python3 -m venv venv"
    fi
}

# 检查Redis服务
check_redis() {
    log_info "检查 Redis 服务..."
    
    if command -v redis-cli &> /dev/null; then
        if redis-cli ping > /dev/null 2>&1; then
            log_success "Redis 服务正常运行"
        else
            log_error "Redis 服务未运行，请先启动 Redis"
            log_info "启动命令:"
            log_info "  macOS: brew services start redis"
            log_info "  Linux: sudo systemctl start redis"
            exit 1
        fi
    else
        log_error "未找到 redis-cli，请先安装 Redis"
        exit 1
    fi
}

# 检查依赖
check_dependencies() {
    log_info "检查项目依赖..."
    
    if [ -f "$PROJECT_DIR/requirements.txt" ]; then
        # 检查关键依赖
        if $PYTHON -c "import django" 2>/dev/null; then
            log_success "Django 已安装"
        else
            log_error "Django 未安装，请运行: pip install -r requirements.txt"
            exit 1
        fi
        
        if $PYTHON -c "import channels" 2>/dev/null; then
            log_success "Channels 已安装"
        else
            log_error "Channels 未安装，请运行: pip install -r requirements.txt"
            exit 1
        fi
    else
        log_error "未找到 requirements.txt 文件"
        exit 1
    fi
}

# 检查数据库
check_database() {
    log_info "检查数据库..."
    
    cd "$PROJECT_DIR"
    
    # 检查是否需要迁移
    if $PYTHON manage.py showmigrations --plan | grep -q '\[ \]'; then
        log_warning "检测到未应用的数据库迁移"
        read -p "是否自动执行数据库迁移？ (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log_info "执行数据库迁移..."
            $PYTHON manage.py migrate
            log_success "数据库迁移完成"
        else
            log_warning "跳过数据库迁移，如果出现问题请手动执行: python manage.py migrate"
        fi
    else
        log_success "数据库状态正常"
    fi
    
    # 检查是否有管理员用户
    USER_COUNT=$($PYTHON manage.py shell -c "from apps.account.models import User; print(User.objects.count())" 2>/dev/null || echo "0")
    if [ "$USER_COUNT" -eq "0" ]; then
        log_warning "未找到用户，请先创建管理员用户"
        log_info "运行: python manage.py user"
        exit 1
    else
        log_success "用户数据正常 ($USER_COUNT 个用户)"
    fi
}

# 检查端口占用
check_ports() {
    log_info "检查端口占用..."
    
    PORTS=(9001 9002)
    for PORT in "${PORTS[@]}"; do
        if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
            log_warning "端口 $PORT 已被占用"
            PID=$(lsof -Pi :$PORT -sTCP:LISTEN -t)
            log_info "占用进程 PID: $PID"
            read -p "是否杀死占用进程？ (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                kill -9 $PID 2>/dev/null || true
                log_success "已杀死进程 $PID"
            else
                log_error "端口冲突，请手动处理后重试"
                exit 1
            fi
        else
            log_success "端口 $PORT 可用"
        fi
    done
}

# 创建日志目录
create_log_dir() {
    LOG_DIR="$PROJECT_DIR/logs"
    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR"
        log_success "创建日志目录: $LOG_DIR"
    fi
}

# 启动服务
start_services() {
    log_info "开始启动服务..."
    
    cd "$PROJECT_DIR"
    
    # 确保工具脚本有执行权限
    chmod +x tools/*.sh
    
    # 启动 API 服务
    log_info "启动 API 服务 (端口 9001)..."
    nohup bash tools/start-api.sh > logs/api.log 2>&1 &
    API_PID=$!
    echo $API_PID > logs/api.pid
    sleep 2
    
    # 检查 API 服务是否启动成功
    if kill -0 $API_PID 2>/dev/null; then
        log_success "API 服务启动成功 (PID: $API_PID)"
    else
        log_error "API 服务启动失败"
        exit 1
    fi
    
    # 启动 WebSocket 服务
    log_info "启动 WebSocket 服务 (端口 9002)..."
    nohup bash tools/start-ws.sh > logs/ws.log 2>&1 &
    WS_PID=$!
    echo $WS_PID > logs/ws.pid
    sleep 2
    
    if kill -0 $WS_PID 2>/dev/null; then
        log_success "WebSocket 服务启动成功 (PID: $WS_PID)"
    else
        log_error "WebSocket 服务启动失败"
        exit 1
    fi
    
    # 启动工作进程
    log_info "启动工作进程..."
    nohup bash tools/start-worker.sh > logs/worker.log 2>&1 &
    WORKER_PID=$!
    echo $WORKER_PID > logs/worker.pid
    sleep 1
    
    if kill -0 $WORKER_PID 2>/dev/null; then
        log_success "工作进程启动成功 (PID: $WORKER_PID)"
    else
        log_warning "工作进程启动可能有问题，请检查日志"
    fi
    
    # 启动调度器
    log_info "启动调度器..."
    nohup bash tools/start-scheduler.sh > logs/scheduler.log 2>&1 &
    SCHEDULER_PID=$!
    echo $SCHEDULER_PID > logs/scheduler.pid
    sleep 1
    
    if kill -0 $SCHEDULER_PID 2>/dev/null; then
        log_success "调度器启动成功 (PID: $SCHEDULER_PID)"
    else
        log_warning "调度器启动可能有问题，请检查日志"
    fi
    
    # 启动监控服务
    log_info "启动监控服务..."
    nohup bash tools/start-monitor.sh > logs/monitor.log 2>&1 &
    MONITOR_PID=$!
    echo $MONITOR_PID > logs/monitor.pid
    sleep 1
    
    if kill -0 $MONITOR_PID 2>/dev/null; then
        log_success "监控服务启动成功 (PID: $MONITOR_PID)"
    else
        log_warning "监控服务启动可能有问题，请检查日志"
    fi
}

# 验证服务
verify_services() {
    log_info "验证服务状态..."
    
    # 等待服务完全启动
    sleep 5
    
    # 测试 API 服务
    if curl -s http://127.0.0.1:9001/api/account/login/ >/dev/null; then
        log_success "API 服务响应正常"
    else
        log_error "API 服务无响应，请检查日志: logs/api.log"
    fi
    
    # 测试 WebSocket 端口
    if nc -z 127.0.0.1 9002 2>/dev/null; then
        log_success "WebSocket 服务端口正常"
    else
        log_error "WebSocket 服务端口无响应，请检查日志: logs/ws.log"
    fi
}

# 显示启动信息
show_info() {
    echo
    log_success "🎉 Spug 项目启动完成！"
    echo
    echo "服务信息:"
    echo "  📡 API 服务:      http://127.0.0.1:9001"
    echo "  🔌 WebSocket:     ws://127.0.0.1:9002"
    echo
    echo "日志文件:"
    echo "  📋 API 日志:      $PROJECT_DIR/logs/api.log"
    echo "  📋 WebSocket 日志: $PROJECT_DIR/logs/ws.log"
    echo "  📋 工作进程日志:    $PROJECT_DIR/logs/worker.log"
    echo "  📋 调度器日志:     $PROJECT_DIR/logs/scheduler.log"
    echo "  📋 监控服务日志:    $PROJECT_DIR/logs/monitor.log"
    echo
    echo "管理命令:"
    echo "  🛑 停止服务:      ./stop-all.sh"
    echo "  🔍 查看状态:      ./status.sh"
    echo "  📊 查看日志:      tail -f logs/api.log"
    echo
    echo "测试命令:"
    echo "  curl http://127.0.0.1:9001/api/account/login/"
    echo
    log_info "如果需要停止服务，请运行: ./stop-all.sh"
}

# 主函数
main() {
    echo "=========================================="
    echo "        Spug 项目一键启动脚本"
    echo "=========================================="
    echo
    
    # 执行检查
    check_python
    check_venv
    check_redis
    check_dependencies
    check_database
    check_ports
    create_log_dir
    
    echo
    log_info "所有检查通过，开始启动服务..."
    echo
    
    # 启动服务
    start_services
    
    # 验证服务
    verify_services
    
    # 显示信息
    show_info
}

# 信号处理
cleanup() {
    log_warning "收到中断信号，正在清理..."
    if [ -f logs/api.pid ]; then
        kill $(cat logs/api.pid) 2>/dev/null || true
    fi
    if [ -f logs/ws.pid ]; then
        kill $(cat logs/ws.pid) 2>/dev/null || true
    fi
    if [ -f logs/worker.pid ]; then
        kill $(cat logs/worker.pid) 2>/dev/null || true
    fi
    if [ -f logs/scheduler.pid ]; then
        kill $(cat logs/scheduler.pid) 2>/dev/null || true
    fi
    if [ -f logs/monitor.pid ]; then
        kill $(cat logs/monitor.pid) 2>/dev/null || true
    fi
    exit 1
}

trap cleanup INT TERM

# 执行主函数
main "$@"
